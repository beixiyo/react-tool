import type { ChartSelection } from '../use-chart-interaction'
import type {
  ChartState,
  TooltipData,
} from './chart'
import type { ChartVirtualState } from './virtual'

/**
 * 静态图表配置 Context
 * 包含 Scale、尺寸、配置等不随鼠标移动频繁变化的属性
 */
export interface ChartStaticState extends Omit<ChartState, 'tooltipData' | 'setTooltipData' | 'hoveredBarIndex' | 'setHoveredBarIndex' | 'virtual'> {}

/**
 * 交互状态 Context
 * 包含 Tooltip、Hover 等高频更新属性
 */
export interface ChartInteractionState {
  tooltipData: TooltipData | null
  setTooltipData: (data: TooltipData | null) => void
  hoveredBarIndex?: number | null
  setHoveredBarIndex?: (index: number | null) => void
  selection: ChartSelection | null
}

/**
 * 虚拟滚动 Context
 * 专门存储滚动偏移和切片索引，避免滚动时触发整个图表树的重绘
 */
export interface ChartVirtualContextState extends ChartVirtualState {}
