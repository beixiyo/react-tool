import type { PanelConfig, PanelState } from './types'
import { clamp } from '@jl-org/tool'

function getStorage() {
  return typeof localStorage === 'undefined'
    ? null
    : localStorage
}

/**
 * 计算面板的初始宽度
 */
export function calculateInitialWidths(
  configs: PanelConfig[],
  containerWidth: number,
  dividerSize: number,
  gap = 0,
  dividerSizes?: readonly number[],
): number[] {
  const dividerCount = configs.length - 1
  const totalDividerSize = calculateTotalDividerSize(dividerCount, dividerSize, dividerSizes)
  const availableWidth = containerWidth - totalDividerSize - dividerCount * gap

  const widths: number[] = []
  let fixedWidth = 0
  let autoCount = 0

  /** 先计算固定宽度的面板 */
  configs.forEach((config) => {
    if (config.defaultWidth !== 'auto' && config.defaultWidth !== undefined) {
      const width = clamp(
        config.defaultWidth,
        config.minWidth ?? 100,
        config.maxWidth ?? Infinity,
      )
      widths.push(width)
      fixedWidth += width
    }
    else {
      widths.push(-1) // 标记为自动
      autoCount++
    }
  })

  /** 计算自动宽度面板的宽度 */
  const autoWidth = autoCount > 0
    ? (availableWidth - fixedWidth) / autoCount
    : 0

  return widths.map((w, i) => {
    if (w === -1) {
      const config = configs[i]
      return clamp(
        autoWidth,
        config.minWidth ?? 100,
        config.maxWidth ?? Infinity,
      )
    }
    return w
  })
}

/**
 * 获取指定分隔条尺寸
 */
export function getDividerSize(index: number, dividerSize: number, dividerSizes?: readonly number[]): number {
  return dividerSizes?.[index] ?? dividerSize
}

/**
 * 计算所有分隔条占用宽度
 */
function calculateTotalDividerSize(dividerCount: number, dividerSize: number, dividerSizes?: readonly number[]): number {
  let total = 0

  for (let index = 0; index < dividerCount; index++) {
    total += getDividerSize(index, dividerSize, dividerSizes)
  }

  return total
}

/**
 * 应用宽度约束
 */
export function applyWidthConstraints(width: number, config: PanelConfig, collapsed: boolean): number {
  if (collapsed) {
    return config.collapsedWidth ?? 0
  }
  return clamp(width, config.minWidth ?? 100, config.maxWidth ?? Infinity)
}

/**
 * 检查是否应该自动收起
 */
export function shouldAutoCollapse(width: number, threshold: number | undefined): boolean {
  if (threshold === undefined)
    return false
  return width < threshold
}

/**
 * 从 localStorage 读取状态
 */
export function loadPersistedState(key: string): { sizes: number[], collapsedStates: boolean[], widthsBeforeCollapse: number[] } | null {
  try {
    const stored = getStorage()?.getItem(key)
    if (!stored)
      return null
    return JSON.parse(stored)
  }
  catch {
    return null
  }
}

/**
 * 保存状态到 localStorage
 */
export function savePersistedState(key: string, states: PanelState[]): void {
  try {
    const data = {
      sizes: states.map(s => s.responsiveCollapsed
        ? s.widthBeforeCollapse
        : s.width),
      collapsedStates: states.map(s => s.responsiveCollapsed
        ? false
        : s.collapsed),
      widthsBeforeCollapse: states.map(s => s.widthBeforeCollapse),
    }
    getStorage()?.setItem(key, JSON.stringify(data))
  }
  catch {
    /** 忽略存储错误 */
  }
}
