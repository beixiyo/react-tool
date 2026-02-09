import type { PanelConfig, PanelState } from './types'
import { clamp } from '@jl-org/tool'

/**
 * 计算面板的初始宽度
 */
export function calculateInitialWidths(configs: PanelConfig[], containerWidth: number, dividerSize: number): number[] {
  const dividerCount = configs.length - 1
  const availableWidth = containerWidth - dividerCount * dividerSize

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
    const stored = localStorage.getItem(key)
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
      sizes: states.map(s => s.width),
      collapsedStates: states.map(s => s.collapsed),
      widthsBeforeCollapse: states.map(s => s.widthBeforeCollapse),
    }
    localStorage.setItem(key, JSON.stringify(data))
  }
  catch {
    /** 忽略存储错误 */
  }
}
