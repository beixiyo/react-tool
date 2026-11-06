import { clamp } from '@jl-org/tool'
import type { PanelConfig, PanelState } from './types'
import { getDividerSize } from './utils'

/** 将默认布局同步到当前容器，优先调整自适应栏；空间不足时保留各栏最小宽度供横向滚动 */
export function fitPanelWidths(options: FitPanelWidthsOptions): PanelState[] {
  const { configs, states, containerWidth, dividerSize, dividerSizes, gap } = options
  const next = states.map((state, index) => ({
    ...state,
    width: state.collapsed
      ? configs[index].collapsedWidth ?? 0
      : clamp(state.width, configs[index].minWidth ?? 100, configs[index].maxWidth ?? Infinity),
  }))

  let available = containerWidth
  for (let index = 0; index < configs.length - 1; index++) {
    available -= getDividerSize(index, dividerSize, dividerSizes)
  }

  next.forEach((state, index) => {
    if (!state.collapsed) {
      if (index > 0) available -= gap / 2
      if (index < configs.length - 1) available -= gap / 2
    }
  })

  let remaining = available - next.reduce((sum, state) => sum + state.width, 0)
  const expanded = next.flatMap((state, index) =>
    state.collapsed
      ? []
      : [index]
  )
  const flexible = expanded.filter((index) => configs[index].defaultWidth === undefined || configs[index].defaultWidth === 'auto')
  const fixed = expanded.filter((index) => !flexible.includes(index))

  for (const group of [flexible, fixed]) {
    let candidates = group
    while (Math.abs(remaining) > 0.001 && candidates.length > 0) {
      const share = remaining / candidates.length
      const active: number[] = []

      for (const index of candidates) {
        const state = next[index]
        const config = configs[index]
        const width = clamp(state.width + share, config.minWidth ?? 100, config.maxWidth ?? Infinity)
        remaining -= width - state.width
        state.width = width
        if (
          share > 0
            ? width < (config.maxWidth ?? Infinity)
            : width > (config.minWidth ?? 100)
        ) active.push(index)
      }
      candidates = active
    }
  }

  return next.map((state) =>
    state.collapsed
      ? state
      : { ...state, widthBeforeCollapse: state.width }
  )
}

/** 相邻栏在保持总宽度及双方约束下，左栏可达到的边界 */
export function getPairLimits(configs: PanelConfig[], states: PanelState[], index: number) {
  const left = states[index]
  const right = states[index + 1]
  const total = left.width + right.width
  const leftMin = left.collapsed
    ? left.width
    : configs[index].minWidth ?? 100
  const leftMax = left.collapsed
    ? left.width
    : configs[index].maxWidth ?? Infinity
  const rightMin = right.collapsed
    ? right.width
    : configs[index + 1].minWidth ?? 100
  const rightMax = right.collapsed
    ? right.width
    : configs[index + 1].maxWidth ?? Infinity
  return { min: Math.max(leftMin, total - rightMax), max: Math.min(leftMax, total - rightMin) }
}

/** 调整相邻栏，不改变总宽度，也不隐式展开 / 收起 */
export function resizePanelPair(configs: PanelConfig[], states: PanelState[], index: number, desired: number): PanelState[] {
  const { min, max } = getPairLimits(configs, states, index)
  if (min > max || states[index].collapsed || states[index + 1].collapsed) return states
  const width = clamp(desired, min, max)
  const rightWidth = states[index].width + states[index + 1].width - width
  const next = [...states]
  next[index] = { ...states[index], width, widthBeforeCollapse: width }
  next[index + 1] = { ...states[index + 1], width: rightWidth, widthBeforeCollapse: rightWidth }
  return next
}

/** 收起或展开一栏，严格检查相邻栏可提供 / 接收的空间；不合法时不改变状态 */
export function togglePanelPair(configs: PanelConfig[], states: PanelState[], index: number, adjacent: number, expandTo?: number): PanelState[] {
  const config = configs[index]
  const current = states[index]
  const neighbor = states[adjacent]
  if (!config?.collapsible || !current || !neighbor || neighbor.collapsed) return states
  const neighborMin = configs[adjacent].minWidth ?? 100
  const neighborMax = configs[adjacent].maxWidth ?? Infinity
  const total = current.width + neighbor.width
  let width: number
  if (current.collapsed) {
    const min = Math.max(config.minWidth ?? 100, total - neighborMax)
    const max = Math.min(config.maxWidth ?? Infinity, total - neighborMin)
    if (min > max) return states
    width = clamp(expandTo ?? current.widthBeforeCollapse, min, max)
  }
  else {
    width = config.collapsedWidth ?? 0
    if (total - width < neighborMin || total - width > neighborMax) return states
  }
  const next = [...states]
  next[index] = {
    ...current,
    width,
    collapsed: !current.collapsed,
    widthBeforeCollapse: current.collapsed
      ? width
      : current.width,
    responsiveCollapsed: false,
  }
  next[adjacent] = { ...neighbor, width: total - width, widthBeforeCollapse: total - width }
  return next
}

type FitPanelWidthsOptions = {
  configs: PanelConfig[]
  states: PanelState[]
  containerWidth: number
  dividerSize: number
  dividerSizes?: readonly number[]
  gap: number
}
