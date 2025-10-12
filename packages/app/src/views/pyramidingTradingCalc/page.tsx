import type { CalculationInputs, CalculationOutput, RiskLevelConfig } from './calculator'
import { NumberInput, Slider, Switch } from 'comps'

import { AnimatePresence, motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { calculateRollingPositionPlan, DEFAULT_ADVANCED_SETTINGS } from './calculator'
import { ReinvestmentSliders } from './ReinvestmentSliders'
import { useAdvancedSettings } from './useAdvancedSettings'

// --- 常量 ---
/** 将所有表单的初始状态定义为一个常量，方便重置 */
const INITIAL_FORM_STATE = {
  direction: 'LONG' as 'LONG' | 'SHORT',
  initialCapital: '15',
  startPrice: '1',
  targetClosePrice: '1.1', // 这个值会被自动计算覆盖
  expectedFinalCapital: '150', // 这个值会被自动计算覆盖
  riskLevel: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
  manualLeverage: '100',
  useManualLeverage: false,
  manualOrderCount: '4',
  useManualOrderCount: false,
}

const inputStyles = 'w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'

function App() {
  // --- 状态管理 ---
  const [direction, setDirection] = useState(INITIAL_FORM_STATE.direction)
  const [initialCapital, setInitialCapital] = useState(INITIAL_FORM_STATE.initialCapital)
  const [startPrice, setStartPrice] = useState(INITIAL_FORM_STATE.startPrice)
  const [targetClosePrice, setTargetClosePrice] = useState(INITIAL_FORM_STATE.targetClosePrice)
  const [expectedFinalCapital, setExpectedFinalCapital] = useState(INITIAL_FORM_STATE.expectedFinalCapital)
  const [riskLevel, setRiskLevel] = useState(INITIAL_FORM_STATE.riskLevel)
  const [manualLeverage, setManualLeverage] = useState(INITIAL_FORM_STATE.manualLeverage)
  const [useManualLeverage, setUseManualLeverage] = useState(INITIAL_FORM_STATE.useManualLeverage)
  const [manualOrderCount, setManualOrderCount] = useState(INITIAL_FORM_STATE.manualOrderCount)
  const [useManualOrderCount, setUseManualOrderCount] = useState(INITIAL_FORM_STATE.useManualOrderCount)
  const [isInitialized, setIsInitialized] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CalculationOutput | 'NO_SOLUTION' | null>(null)

  // --- 自定义 Hook 管理高级配置 ---
  const { settings: advancedSettings, setSettings: setAdvancedSettings, resetSettings: resetAllAdvancedSettings } = useAdvancedSettings()
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [selectedSequenceIndex, setSelectedSequenceIndex] = useState(0)

  // --- 衍生状态与回调 ---
  const expectedCapitalPresets = useMemo(() => {
    const capital = Number.parseFloat(initialCapital)
    if (Number.isNaN(capital) || capital <= 0)
      return []
    const multipliers = [2, 5, 10]
    const percentages = [0.1, 0.5, 1]
    const presets = direction === 'LONG'
      ? [...percentages.map(p => ({ label: `+${p * 100}%`, value: capital * (1 + p) })), ...multipliers.map(m => ({ label: `x${m}`, value: capital * m }))]
      : []
    return presets.map(p => ({ label: p.label, value: p.value.toFixed(2) }))
  }, [initialCapital, direction])

  /** 自动计算目标价格和目标最终资金 */
  useEffect(() => {
    if (!isInitialized) {
      const startPriceNum = Number.parseFloat(startPrice)
      const initialCapitalNum = Number.parseFloat(initialCapital)

      if (!Number.isNaN(startPriceNum) && startPriceNum > 0) {
        const newTargetPrice = direction === 'LONG'
          ? (startPriceNum * 1.1).toFixed(8) // 做多时 +10%
          : (startPriceNum * 0.9).toFixed(8) // 做空时 -10%

        setTargetClosePrice(newTargetPrice)
      }

      if (!Number.isNaN(initialCapitalNum) && initialCapitalNum > 0) {
        const newExpectedFinalCapital = (initialCapitalNum * 10).toFixed(2)
        setExpectedFinalCapital(newExpectedFinalCapital)
      }

      setIsInitialized(true)
    }
  }, [isInitialized, direction, startPrice, initialCapital])

  const handleCalculate = useCallback(() => {
    setIsLoading(true)
    setResult(null)
    const inputs: CalculationInputs = {
      direction,
      initialCapital: Number.parseFloat(initialCapital),
      startPrice: Number.parseFloat(startPrice),
      targetClosePrice: Number.parseFloat(targetClosePrice),
      expectedFinalCapital: Number.parseFloat(expectedFinalCapital),
      riskLevel,
      manualLeverage: useManualLeverage
        ? Number.parseFloat(manualLeverage)
        : null,
      manualOrderCount: useManualOrderCount
        ? Number.parseInt(manualOrderCount)
        : null,
    }
    setTimeout(() => {
      const calculationResult = calculateRollingPositionPlan(inputs, advancedSettings)
      setResult(calculationResult || 'NO_SOLUTION')
      setIsLoading(false)
    }, 100)
  }, [direction, initialCapital, startPrice, targetClosePrice, expectedFinalCapital, riskLevel, useManualLeverage, manualLeverage, useManualOrderCount, manualOrderCount, advancedSettings])

  const handleRiskLevelSelect = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    setRiskLevel(risk)
    /** 加载对应风险的默认预设 */
    setAdvancedSettings(DEFAULT_ADVANCED_SETTINGS)
    setSelectedSequenceIndex(0)
  }

  /** 修改方向时重新计算目标价格 */
  const handleDirectionChange = (newDirection: 'LONG' | 'SHORT') => {
    setDirection(newDirection)

    /** 根据新方向自动计算目标价格 */
    const startPriceNum = Number.parseFloat(startPrice)
    if (!Number.isNaN(startPriceNum) && startPriceNum > 0) {
      const newTargetPrice = newDirection === 'LONG'
        ? (startPriceNum * 1.1).toFixed(8) // 做多时 +10%
        : (startPriceNum * 0.9).toFixed(8) // 做空时 -10%

      setTargetClosePrice(newTargetPrice)
    }
  }

  /** 修改开仓价格时重新计算目标价格 */
  const handleStartPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartPrice = e.target.value
    setStartPrice(newStartPrice)

    /** 根据当前方向自动计算目标价格 */
    const startPriceNum = Number.parseFloat(newStartPrice)
    if (!Number.isNaN(startPriceNum) && startPriceNum > 0) {
      const newTargetPrice = direction === 'LONG'
        ? (startPriceNum * 1.1).toFixed(8) // 做多时 +10%
        : (startPriceNum * 0.9).toFixed(8) // 做空时 -10%

      setTargetClosePrice(newTargetPrice)
    }
  }

  /** 修改初始资金时重新计算目标最终资金 */
  const handleInitialCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInitialCapital = e.target.value
    setInitialCapital(newInitialCapital)

    /** 自动计算目标最终资金为初始资金的十倍 */
    const initialCapitalNum = Number.parseFloat(newInitialCapital)
    if (!Number.isNaN(initialCapitalNum) && initialCapitalNum > 0) {
      const newExpectedFinalCapital = (initialCapitalNum * 10).toFixed(2)
      setExpectedFinalCapital(newExpectedFinalCapital)
    }
  }

  const handleSettingsChange = (risk: 'LOW' | 'MEDIUM' | 'HIGH', field: keyof RiskLevelConfig, value: any) => {
    setAdvancedSettings(prev => ({ ...prev, [risk]: { ...prev[risk], [field]: value } }))
  }

  const handleSequenceChange = (risk: 'LOW' | 'MEDIUM' | 'HIGH', newSequence: number[]) => {
    const newSequences = [...advancedSettings[risk].reinvestmentSequences]
    newSequences[selectedSequenceIndex] = newSequence
    handleSettingsChange(risk, 'reinvestmentSequences', newSequences)
  }

  /** 重置所有参数的函数 */
  const handleResetAll = () => {
    /** 重置所有表单输入 */
    setDirection(INITIAL_FORM_STATE.direction)
    setInitialCapital(INITIAL_FORM_STATE.initialCapital)
    setStartPrice(INITIAL_FORM_STATE.startPrice)
    setTargetClosePrice(INITIAL_FORM_STATE.targetClosePrice)
    setExpectedFinalCapital(INITIAL_FORM_STATE.expectedFinalCapital)
    setRiskLevel(INITIAL_FORM_STATE.riskLevel)
    setManualLeverage(INITIAL_FORM_STATE.manualLeverage)
    setUseManualLeverage(INITIAL_FORM_STATE.useManualLeverage)
    setManualOrderCount(INITIAL_FORM_STATE.manualOrderCount)
    setUseManualOrderCount(INITIAL_FORM_STATE.useManualOrderCount)

    setIsInitialized(false)

    /** 清空计算结果 */
    setResult(null)

    /** 调用从 Hook 中得到的函数，重置高级配置和 localStorage */
    resetAllAdvancedSettings()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 text-white font-sans">
      <div className="max-w-6xl w-full">
        <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } } transition={ { duration: 0.5 } } className="rounded-xl bg-gray-800 p-6 shadow-2xl md:p-8">
          <div className="mb-2 flex items-center justify-center">
            <h1 className="absolute from-blue-400 to-teal-300 bg-linear-to-r bg-clip-text text-3xl text-transparent font-bold center-x md:text-4xl">滚仓交易计算器</h1>

            <button onClick={ handleResetAll } title="重置所有参数" className="ml-auto rounded-full bg-gray-700 p-2 text-gray-400 transition-all duration-300 hover:bg-gray-600 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              {/* --- 表单部分 --- */ }
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-300 font-medium">方向</label>
                  <div className="w-full flex rounded-md bg-gray-700 p-1">
                    <button
                      onClick={ () => handleDirectionChange('LONG') }
                      className={ `w-1/2 rounded py-1.5 text-sm font-semibold transition ${direction === 'LONG'
                        ? 'bg-green-600 shadow-sm'
                        : 'hover:bg-gray-600'}` }>
                      做多
                    </button>
                    <button
                      onClick={ () => handleDirectionChange('SHORT') }
                      className={ `w-1/2 rounded py-1.5 text-sm font-semibold transition ${direction === 'SHORT'
                        ? 'bg-red-600 shadow-sm'
                        : 'hover:bg-gray-600'}` }>
                      做空
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-300 font-medium">风险预设 (加载配置)</label>
                  <div className="w-full flex rounded-md bg-gray-700 p-1 text-xs sm:text-sm">
                    <button
                      onClick={ () => handleRiskLevelSelect('LOW') }
                      className={ `w-1/3 rounded py-1.5 font-semibold transition ${riskLevel === 'LOW'
                        ? 'bg-blue-600 shadow-sm'
                        : 'hover:bg-gray-600'}` }>
                      低
                    </button>
                    <button
                      onClick={ () => handleRiskLevelSelect('MEDIUM') }
                      className={ `w-1/3 rounded py-1.5 font-semibold transition ${riskLevel === 'MEDIUM'
                        ? 'bg-yellow-600 shadow-sm'
                        : 'hover:bg-gray-600'}` }>
                      中
                    </button>
                    <button
                      onClick={ () => handleRiskLevelSelect('HIGH') }
                      className={ `w-1/3 rounded py-1.5 font-semibold transition ${riskLevel === 'HIGH'
                        ? 'bg-red-600 shadow-sm'
                        : 'hover:bg-gray-600'}` }>
                      高
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="initialCapital" className="mb-1 block text-sm text-gray-300 font-medium">初始资金 (U)</label>
                  <NumberInput
                    id="initialCapital"
                    value={ initialCapital }
                    onChange={ value => handleInitialCapitalChange({ target: { value: String(value) } } as React.ChangeEvent<HTMLInputElement>) }
                    min={ 0.01 }
                    precision={ 2 }
                    size="md"
                  />
                </div>
                <div>
                  <label htmlFor="startPrice" className="mb-1 block text-sm text-gray-300 font-medium">开仓价格</label>
                  <NumberInput
                    id="startPrice"
                    value={ startPrice }
                    onChange={ value => handleStartPriceChange({ target: { value: String(value) } } as React.ChangeEvent<HTMLInputElement>) }
                    min={ 0.00000001 }
                    precision={ 8 }
                    size="md"
                  />
                </div>
                <div>
                  <label htmlFor="targetClosePrice" className="mb-1 block text-sm text-gray-300 font-medium">目标价格</label>
                  <NumberInput
                    id="targetClosePrice"
                    value={ targetClosePrice }
                    onChange={ value => setTargetClosePrice(String(value)) }
                    min={ 0.00000001 }
                    precision={ 8 }
                    size="md"
                  />
                </div>
                <div>
                  <label htmlFor="expectedFinalCapital" className="mb-1 block text-sm text-gray-300 font-medium">预期最终资金</label>
                  <NumberInput
                    id="expectedFinalCapital"
                    value={ expectedFinalCapital }
                    onChange={ value => setExpectedFinalCapital(String(value)) }
                    min={ 0.01 }
                    precision={ 2 }
                    size="md"
                  />
                  <div className="mt-2 flex flex-wrap gap-1">{ expectedCapitalPresets.map(p => (<button key={ p.label } onClick={ () => setExpectedFinalCapital(p.value) } className="rounded bg-gray-600 px-2 py-0.5 text-xs transition hover:bg-gray-500">{ p.label }</button>)) }</div>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm text-gray-300 font-medium">手动杠杆</label>
                  <div className="flex items-center">
                    <span className="mr-2 text-xs text-gray-400">关</span>
                    <Switch
                      checked={ useManualLeverage }
                      onChange={ checked => setUseManualLeverage(checked) }
                      size="sm"
                    />
                    <span className="ml-2 text-xs text-gray-400">开</span>
                  </div>
                </div>
                <AnimatePresence>
                  { useManualLeverage && (<motion.div initial={ { opacity: 0, height: 0 } } animate={ { opacity: 1, height: 'auto' } } exit={ { opacity: 0, height: 0 } } className="overflow-hidden">
                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <NumberInput
                          value={ manualLeverage }
                          onChange={ value => setManualLeverage(String(value)) }
                          min={ 1 }
                          max={ 125 }
                          size="sm"
                          className="w-24"
                        />
                        <Slider
                          min={ 1 }
                          max={ 125 }
                          value={ Number(manualLeverage) }
                          onChange={ value => setManualLeverage(String(value)) }
                          className="flex-1"
                          tooltip
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        { [10, 25, 50, 75, 100, 125].map(l => (<button key={ l } onClick={ () => setManualLeverage(String(l)) } className="rounded bg-gray-600 px-2 py-0.5 text-xs transition hover:bg-gray-500">
                          { l }
                          x
                        </button>)) }
                      </div>
                    </div>
                  </motion.div>) }
                </AnimatePresence>
              </div>

              {/* 添加自定义开仓次数控制 */ }
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm text-gray-300 font-medium">自定义开仓次数</label>
                  <div className="flex items-center">
                    <span className="mr-2 text-xs text-gray-400">关</span>
                    <Switch
                      checked={ useManualOrderCount }
                      onChange={ checked => setUseManualOrderCount(checked) }
                      size="sm"
                    />
                    <span className="ml-2 text-xs text-gray-400">开</span>
                  </div>
                </div>
                <AnimatePresence>
                  { useManualOrderCount && (<motion.div initial={ { opacity: 0, height: 0 } } animate={ { opacity: 1, height: 'auto' } } exit={ { opacity: 0, height: 0 } } className="overflow-hidden">
                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <NumberInput
                          value={ manualOrderCount }
                          onChange={ value => setManualOrderCount(String(value)) }
                          min={ 2 }
                          max={ 6 }
                          step={ 1 }
                          size="sm"
                          className="w-24"
                        />
                        <Slider
                          min={ 2 }
                          max={ 6 }
                          step={ 1 }
                          value={ Number(manualOrderCount) }
                          onChange={ value => setManualOrderCount(String(value)) }
                          className="flex-1"
                          tooltip
                          dots
                          marks={ {
                            2: '2',
                            3: '3',
                            4: '4',
                            5: '5',
                            6: '6',
                          } }
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        { [2, 3, 4, 5, 6].map(count => (<button key={ count } onClick={ () => setManualOrderCount(String(count)) } className="rounded bg-gray-600 px-2 py-0.5 text-xs transition hover:bg-gray-500">
                          { count }
                          次
                        </button>)) }
                      </div>
                      <p className="mt-2 text-xs text-gray-400">开仓次数范围：2-6次</p>
                    </div>
                  </motion.div>) }
                </AnimatePresence>
              </div>
              {/* --- 高级配置 UI --- */ }
              <div>
                <button onClick={ () => setIsAdvancedOpen(!isAdvancedOpen) } className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 transition hover:text-white">
                  算法参数配置
                  <motion.svg
                    animate={ {
                      rotate: isAdvancedOpen
                        ? 180
                        : 0,
                    } }
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.9201 8.9502L13.4001 15.4702C12.6301 16.2402 11.3701 16.2402 10.6001 15.4702L4.08008 8.9502" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  { isAdvancedOpen && (
                    <motion.div initial={ { opacity: 0, height: 0 } } animate={ { opacity: 1, height: 'auto' } } exit={ { opacity: 0, height: 0 } } className="overflow-hidden">
                      <div className="mt-4 rounded-lg bg-gray-700/50 p-4 space-y-6">
                        <p className="mb-4 text-center text-xs text-gray-400 -mt-2">
                          此处参数决定了求解器的搜索行为。点击"风险预设"按钮可加载默认值。
                        </p>
                        { (Object.keys(advancedSettings) as Array<keyof typeof advancedSettings>).map((riskKey) => {
                          const currentRiskSettings = advancedSettings[riskKey]
                          return (
                            <div key={ riskKey }>
                              <h4 className="mb-2 text-lg text-yellow-400 font-bold">
                                { riskKey }
                                { ' ' }
                                风险配置
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm text-gray-300 font-medium">杠杆搜索范围 (Min/Max)</label>
                                  <div className="mt-1 flex gap-2">
                                    <input type="number" value={ currentRiskSettings.leverageRange[0] } onChange={ e => handleSettingsChange(riskKey, 'leverageRange', [Number.parseInt(e.target.value), currentRiskSettings.leverageRange[1]]) } className={ `${inputStyles} w-1/2` } />
                                    <input type="number" value={ currentRiskSettings.leverageRange[1] } onChange={ e => handleSettingsChange(riskKey, 'leverageRange', [currentRiskSettings.leverageRange[0], Number.parseInt(e.target.value)]) } className={ `${inputStyles} w-1/2` } />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-300 font-medium">盈利再投资序列</label>
                                  <div className="mt-2 rounded-md bg-gray-800 p-3">
                                    <div className="mb-3 flex items-center justify-center gap-2">
                                      <span className="text-xs text-gray-400">选择编辑的策略:</span>
                                      { currentRiskSettings.reinvestmentSequences.map((_, index) => (
                                        <button
                                          key={ index }
                                          onClick={ () => setSelectedSequenceIndex(index) }
                                          className={ `px-3 py-1 text-xs rounded-full transition ${selectedSequenceIndex === index
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600'}` }>
                                          { index + 1 }
                                        </button>
                                      )) }
                                    </div>
                                    <ReinvestmentSliders
                                      sequence={ currentRiskSettings.reinvestmentSequences[selectedSequenceIndex] || [] }
                                      onChange={ newSequence => handleSequenceChange(riskKey, newSequence) }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }) }
                        <button onClick={ resetAllAdvancedSettings } className="mx-auto block text-xs text-gray-400 transition hover:text-red-500">恢复高级配置为默认</button>
                      </div>
                    </motion.div>
                  ) }
                </AnimatePresence>
              </div>
              <button onClick={ handleCalculate } disabled={ isLoading } className="w-full flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-lg text-white font-bold shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:bg-blue-800 hover:bg-blue-700">
                { isLoading
                  ? (
                      <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )
                  : '开始计算' }
              </button>
            </div>
            {/* --- 结果展示部分 --- */ }
            <div className="min-h-[300px] flex items-center justify-center rounded-lg bg-gray-900/50 p-4 lg:min-h-full md:p-6">
              <AnimatePresence mode="wait">
                { isLoading
                  ? (
                      <motion.div key="loader" initial={ { opacity: 0 } } animate={ { opacity: 1 } } exit={ { opacity: 0 } } className="text-center text-gray-400">
                        <svg className="mx-auto h-8 w-8 animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2">正在寻找最优解...</p>
                      </motion.div>
                    )
                  : result === 'NO_SOLUTION'
                    ? (
                        <motion.div key="no-solution" initial={ { opacity: 0, scale: 0.9 } } animate={ { opacity: 1, scale: 1 } } exit={ { opacity: 0, scale: 0.9 } } className="text-center text-yellow-400">
                          <p className="text-lg font-bold">无解</p>
                          <p className="mt-1 text-sm text-gray-400">
                            无法在当前条件下找到满足目标的方案。
                            <br />
                            请尝试调整目标、杠杆或高级配置。
                          </p>
                        </motion.div>
                      )
                    : result
                      ? (
                          <motion.div key="results" initial={ { opacity: 0 } } animate={ { opacity: 1 } } className="w-full">
                            <div className="mb-6 rounded-lg bg-gray-700/50 p-4">
                              <h3 className="mb-3 text-center text-lg font-bold">计划概要</h3>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <span className="text-gray-400">最终资金:</span>
                                <span className="text-right font-semibold">{ result.summary.calculatedFinalCapital.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }</span>
                                <span className="text-gray-400">总盈亏:</span>
                                <span className={ `font-semibold text-right ${result.summary.totalPnl > 0
                                  ? 'text-green-400'
                                  : 'text-red-400'}` }>
                                  { result.summary.totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }
                                </span>
                                <span className="text-gray-400">回报率 (ROI):</span>
                                <span className={ `font-semibold text-right ${result.summary.roi > 0
                                  ? 'text-green-400'
                                  : 'text-red-400'}` }>
                                  { result.summary.roi.toFixed(2) }
                                  %
                                </span>
                                <span className="text-gray-400">平均开仓价:</span>
                                <span className="text-right font-semibold">{ result.summary.avgEntryPrice.toLocaleString(undefined, { maximumFractionDigits: 8 }) }</span>
                              </div>
                            </div>
                            <div className="w-full overflow-x-auto">
                              <h3 className="mb-3 text-center text-lg font-bold">
                                交易计划 (
                                { result.summary.totalOrders }
                                { ' ' }
                                笔)
                              </h3>
                              <table className="w-full text-left text-sm">
                                <thead className="bg-gray-700/80">
                                  <tr>
                                    <th className="rounded-l-md p-2">#</th>
                                    <th className="p-2">开仓价</th>
                                    <th className="p-2">保证金(U)</th>
                                    <th className="p-2">杠杆</th>
                                    <th className="rounded-r-md p-2">数量</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  { result.tradePlan.map((order, index) => (<motion.tr key={ order.orderIndex } initial={ { opacity: 0, x: -20 } } animate={ { opacity: 1, x: 0 } } transition={ { duration: 0.3, delay: index * 0.07 } } className="border-b border-gray-700/50 last:border-none">
                                    <td className="p-2 font-bold">{ order.orderIndex }</td>
                                    <td className="p-2">{ order.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 8 }) }</td>
                                    <td className="p-2">{ order.margin.toFixed(2) }</td>
                                    <td className="p-2 text-yellow-400">
                                      { order.leverage }
                                      x
                                    </td>
                                    <td className="p-2">{ order.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 }) }</td>
                                  </motion.tr>)) }
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )
                      : (
                          <motion.div key="initial" initial={ { opacity: 0 } } animate={ { opacity: 1 } } className="text-center text-gray-500">
                            <p>输入参数后点击「开始计算」</p>
                          </motion.div>
                        ) }
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default App
