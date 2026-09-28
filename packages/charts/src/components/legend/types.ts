import type { ReactElement, ReactNode } from 'react'

/** 图例单项（可与饼图 data 对齐） */
export interface LegendItemData {
  label: string
  value: number
  /** 用于进度条或按 max 计算百分比；饼图图例可省略 */
  maxValue?: number
  color: string
}

export interface LegendContextValue {
  items: LegendItemData[]
  hoveredIndex: number | null
  setHoveredIndex: (index: number | null) => void
}

export interface LegendItemContextValue {
  item: LegendItemData
  index: number
  isHovered: boolean
  isFaded: boolean
  /** value / maxValue * 100；无 maxValue 时为 0，百分比可走 LegendValue 内对全量求和 */
  percentage: number
}

export interface LegendProps {
  items: LegendItemData[]
  hoveredIndex?: number | null
  onHoverChange?: (index: number | null) => void
  title?: string
  titleClassName?: string
  className?: string
  /** 每项克隆一份的子节点（通常为 LegendItem 包裹的一行） */
  children: ReactElement
}

export interface LegendItemProps {
  className?: string
  children: ReactNode
}

export interface LegendLabelProps {
  className?: string
}

export interface LegendMarkerProps {
  className?: string
}

export interface LegendValueProps {
  className?: string
  showPercentage?: boolean
  percentageClassName?: string
  formatValue?: (value: number) => string
  formatPercentage?: (percentage: number) => string
}

export interface LegendProgressProps {
  trackClassName?: string
  indicatorClassName?: string
  height?: string
}
