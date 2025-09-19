import Decimal from 'decimal.js'

/**
 * @file 滚仓计算器核心算法模块
 * @version 5.0
 * @description 修正了核心的盈利计算逻辑。现在，加仓保证金是基于所有已开仓位的"总浮动盈利"来计算，而不是仅基于前一单的盈利。
 */

// --- 数据结构定义 (无变化) ---
export interface CalculationInputs {
  direction: 'LONG' | 'SHORT'
  initialCapital: number
  startPrice: number
  targetClosePrice: number
  expectedFinalCapital: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  manualLeverage?: number | null
  manualOrderCount?: number | null
}
export interface TradeOrder {
  orderIndex: number
  entryPrice: number
  margin: number
  leverage: number
  quantity: number
}
export interface CalculationOutput {
  summary: { calculatedFinalCapital: number, totalPnl: number, roi: number, avgEntryPrice: number, totalOrders: number, initialCapital: number, targetClosePrice: number }
  tradePlan: TradeOrder[]
}
export interface RiskLevelConfig {
  leverageRange: [number, number]
  reinvestmentSequences: number[][]
}
export interface AdvancedSettings {
  LOW: RiskLevelConfig
  MEDIUM: RiskLevelConfig
  HIGH: RiskLevelConfig
}

// --- 配置 ---
Decimal.set({ precision: 40 })
const FIBONACCI_RETRACEMENT_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.786]
export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  LOW: {
    leverageRange: [5, 30],
    reinvestmentSequences: [
      [60.0, 50.0, 40.0, 30.0, 20.0],
      [50.0, 45.0, 40.0, 35.0, 30.0],
    ],
  },
  MEDIUM: {
    leverageRange: [20, 80],
    reinvestmentSequences: [
      [75.0, 65.0, 55.0, 45.0, 35.0],
      [70.0, 60.0, 50.0, 40.0, 30.0],
    ],
  },
  HIGH: {
    leverageRange: [50, 125],
    reinvestmentSequences: [
      [80.0, 70.0, 60.0, 50.0, 40.0],
      [78.0, 72.0, 65.0, 58.0, 50.0],
    ],
  },
}
interface SimulationResult { finalCapital: Decimal, totalPnl: Decimal, avgEntryPrice: Decimal, tradePlan: TradeOrder[] }

/**
 * 模拟给定参数集的单个交易计划（高精度版）。
 * @version 5.0 - 修正盈利计算逻辑
 */
function simulateTradePlan(inputs: CalculationInputs, numOrders: number, leverage: number, initialMarginRatio: number, reinvestmentSequence: number[]): SimulationResult | null {
  const D_initialCapital = new Decimal(inputs.initialCapital)
  const D_startPrice = new Decimal(inputs.startPrice)
  const D_targetClosePrice = new Decimal(inputs.targetClosePrice)
  const D_leverage = new Decimal(leverage)
  const directionMultiplier = inputs.direction === 'LONG'
    ? 1
    : -1

  const entryPrices: Decimal[] = [D_startPrice]
  const priceDelta = D_targetClosePrice.minus(D_startPrice)
  for (let i = 0; i < numOrders - 1; i++) {
    const fibLevel = FIBONACCI_RETRACEMENT_LEVELS[i]
    entryPrices.push(D_startPrice.plus(priceDelta.times(fibLevel)))
  }

  const tradePlan: TradeOrder[] = []
  let totalValueWeightedSum = new Decimal(0)
  let totalQuantity = new Decimal(0)

  /** 模拟订单1 */
  const margin1 = D_initialCapital.times(initialMarginRatio)
  if (margin1.lessThanOrEqualTo(0))
    return null // 初始保证金必须大于0
  const quantity1 = margin1.times(D_leverage).div(entryPrices[0])
  tradePlan.push({ orderIndex: 1, entryPrice: entryPrices[0].toNumber(), margin: margin1.toNumber(), leverage, quantity: quantity1.toNumber() })
  totalValueWeightedSum = totalValueWeightedSum.plus(quantity1.times(entryPrices[0]))
  totalQuantity = totalQuantity.plus(quantity1)

  /** 模拟后续滚仓订单 */
  for (let i = 1; i < numOrders; i++) {
    const currentEntryPrice = entryPrices[i]

    // [****** THE CORE FIX ******]
    /** 计算在当前加仓点位时，所有已开仓位的"总浮动盈利"。 */
    let totalUnrealizedPnl = new Decimal(0)
    /** 遍历所有已建立的仓位 (从 0 到 i-1) */
    for (let j = 0; j < tradePlan.length; j++) {
      const existingOrder = tradePlan[j]
      // pnl = (当前价格 - 开仓价格) * 数量 * 方向
      const pnlForThisOrder = currentEntryPrice.minus(existingOrder.entryPrice).times(existingOrder.quantity).times(directionMultiplier)
      totalUnrealizedPnl = totalUnrealizedPnl.plus(pnlForThisOrder)
    }
    // [****** END OF FIX ******]

    /** 如果总浮动盈利小于等于0，说明策略已失效，此方案不可行。 */
    if (totalUnrealizedPnl.lessThanOrEqualTo(0)) {
      return null
    }

    /** 使用正确的"总浮动盈利"来计算本次加仓的保证金 */
    const reinvestmentRatio = reinvestmentSequence[i - 1] // 注意序列索引是 i-1
    const currentMargin = totalUnrealizedPnl.times(reinvestmentRatio / 100) // 修正：从百分比转为小数

    if (currentMargin.lessThanOrEqualTo(0))
      return null // 加仓保证金必须大于0

    const currentQuantity = currentMargin.times(D_leverage).div(currentEntryPrice)

    tradePlan.push({ orderIndex: i + 1, entryPrice: currentEntryPrice.toNumber(), margin: currentMargin.toNumber(), leverage, quantity: currentQuantity.toNumber() })
    totalValueWeightedSum = totalValueWeightedSum.plus(currentQuantity.times(currentEntryPrice))
    totalQuantity = totalQuantity.plus(currentQuantity)
  }

  /** 计算最终结果 */
  let totalPnl = new Decimal(0)
  for (const order of tradePlan) {
    const pnl = D_targetClosePrice.minus(order.entryPrice).times(order.quantity).times(directionMultiplier)
    totalPnl = totalPnl.plus(pnl)
  }

  const finalCapital = D_initialCapital.plus(totalPnl)
  const avgEntryPrice = totalQuantity.isZero()
    ? new Decimal(0)
    : totalValueWeightedSum.div(totalQuantity)

  return { finalCapital, totalPnl, avgEntryPrice, tradePlan }
}

export function calculateRollingPositionPlan(inputs: CalculationInputs, settings: AdvancedSettings): CalculationOutput | null {
  if (inputs.startPrice <= 0 || inputs.targetClosePrice <= 0 || inputs.initialCapital <= 0)
    return null
  if (inputs.startPrice === inputs.targetClosePrice || (inputs.direction === 'LONG' && inputs.targetClosePrice < inputs.startPrice) || (inputs.direction === 'SHORT' && inputs.targetClosePrice > inputs.startPrice))
    return null

  const D_expectedFinalCapital = new Decimal(inputs.expectedFinalCapital)
  const lowerBound = D_expectedFinalCapital.times(0.9)
  const upperBound = D_expectedFinalCapital.times(1.1)

  const { riskLevel, manualLeverage, manualOrderCount } = inputs
  const config = settings[riskLevel]
  const leverageRange = manualLeverage
    ? [manualLeverage, manualLeverage]
    : config.leverageRange
  const reinvestmentSequences = config.reinvestmentSequences

  /** 如果指定了自定义开仓次数，则只尝试该次数 */
  if (manualOrderCount && manualOrderCount >= 2 && manualOrderCount <= 6) {
    const numOrders = manualOrderCount
    for (const sequence of reinvestmentSequences) {
      if (sequence.length < numOrders - 1)
        continue
      const reinvestmentSequence = sequence.slice(0, numOrders - 1)
      for (let leverage = leverageRange[1]; leverage >= leverageRange[0]; leverage--) {
        for (let initialMarginRatio = 0.20; initialMarginRatio >= 0.10; initialMarginRatio -= 0.01) {
          const result = simulateTradePlan(inputs, numOrders, leverage, initialMarginRatio, reinvestmentSequence)
          if (!result)
            continue
          if (result.finalCapital.gte(lowerBound) && result.finalCapital.lte(upperBound)) {
            return {
              summary: {
                calculatedFinalCapital: result.finalCapital.toDP(2).toNumber(),
                totalPnl: result.totalPnl.toDP(2).toNumber(),
                roi: result.totalPnl.div(inputs.initialCapital).times(100).toDP(2).toNumber(),
                avgEntryPrice: result.avgEntryPrice.toDP(8).toNumber(),
                totalOrders: numOrders,
                initialCapital: inputs.initialCapital,
                targetClosePrice: inputs.targetClosePrice,
              },
              tradePlan: result.tradePlan.map(order => ({
                ...order,
                entryPrice: new Decimal(order.entryPrice).toDP(8).toNumber(),
                margin: new Decimal(order.margin).toDP(2).toNumber(),
                quantity: new Decimal(order.quantity).toDP(8).toNumber(),
              })),
            }
          }
        }
      }
    }
  }
  else {
    /** 原有逻辑，尝试从6次到2次的所有可能开仓次数 */
    for (let numOrders = 6; numOrders >= 2; numOrders--) {
      for (const sequence of reinvestmentSequences) {
        if (sequence.length < numOrders - 1)
          continue
        const reinvestmentSequence = sequence.slice(0, numOrders - 1)
        for (let leverage = leverageRange[1]; leverage >= leverageRange[0]; leverage--) {
          for (let initialMarginRatio = 0.20; initialMarginRatio >= 0.10; initialMarginRatio -= 0.01) {
            const result = simulateTradePlan(inputs, numOrders, leverage, initialMarginRatio, reinvestmentSequence)
            if (!result)
              continue
            if (result.finalCapital.gte(lowerBound) && result.finalCapital.lte(upperBound)) {
              return {
                summary: {
                  calculatedFinalCapital: result.finalCapital.toDP(2).toNumber(),
                  totalPnl: result.totalPnl.toDP(2).toNumber(),
                  roi: result.totalPnl.div(inputs.initialCapital).times(100).toDP(2).toNumber(),
                  avgEntryPrice: result.avgEntryPrice.toDP(8).toNumber(),
                  totalOrders: numOrders,
                  initialCapital: inputs.initialCapital,
                  targetClosePrice: inputs.targetClosePrice,
                },
                tradePlan: result.tradePlan.map(order => ({
                  ...order,
                  entryPrice: new Decimal(order.entryPrice).toDP(8).toNumber(),
                  margin: new Decimal(order.margin).toDP(2).toNumber(),
                  quantity: new Decimal(order.quantity).toDP(8).toNumber(),
                })),
              }
            }
          }
        }
      }
    }
  }
  return null
}
