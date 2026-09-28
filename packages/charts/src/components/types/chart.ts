import type { scaleBand, scaleLinear, scaleTime } from '@visx/scale'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import type { ChartVirtualState } from './virtual'

export type ScaleLinear<Output, _Input = number> = ReturnType<typeof scaleLinear<Output>>
export type ScaleTime<Output, _Input = Date | number> = ReturnType<typeof scaleTime<Output>>
export type ScaleBand<Domain extends { toString: () => string }> = ReturnType<typeof scaleBand<Domain>>

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface TooltipData {
  point: Record<string, unknown>
  index: number
  x: number
  yPositions: Record<string, number>
  xPositions?: Record<string, number>
}

export interface LineConfig {
  dataKey: string
  stroke: string
  strokeWidth: number
}

/** 统一的图表状态接口 */
export interface ChartState {
  /** 数据相关 */
  /** 当前渲染的切片数据 */
  data: Record<string, unknown>[]
  /** 完整的原始数据（仅在开启虚拟滚动时存在） */
  rawData?: Record<string, unknown>[]

  /** 比例尺 */
  xScale: ScaleTime<number, number>
  yScale: ScaleLinear<number, number>
  barScale?: ScaleBand<string>

  /** 尺寸 */
  width: number
  height: number
  innerWidth: number
  innerHeight: number
  margin: Margin
  columnWidth: number
  bandWidth?: number

  /** 交互状态 */
  tooltipData: TooltipData | null
  setTooltipData: Dispatch<SetStateAction<TooltipData | null>>
  hoveredBarIndex?: number | null
  setHoveredBarIndex?: (index: number | null) => void

  /** 虚拟滚动 */
  virtual?: ChartVirtualState

  /** 其他配置 */
  containerRef: RefObject<HTMLDivElement | null>
  lines: LineConfig[]
  isLoaded: boolean
  animationDuration: number
  xAccessor: (d: Record<string, unknown>) => Date
  dateLabels: string[]
  orientation?: 'vertical' | 'horizontal'
  /** X accessor for bar charts (returns string instead of Date) */
  barXAccessor?: (d: Record<string, unknown>) => string
  /** 柱状图堆叠时，每个数据点、每个系列的累计偏移 */
  stacked?: boolean
  stackOffsets?: Map<number, Map<string, number>>
}
