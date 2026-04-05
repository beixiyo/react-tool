import type { ReactNode, RefObject } from 'react'

/** 饼图单项数据 */
export interface PieData {
  /** 扇区展示标签 */
  label: string
  /** 数值，决定相对总面积的比例 */
  value: number
  /** 可选颜色，缺省使用调色板 */
  color?: string
  /** 可选填充（渐变/图案 url，如 url(#id)） */
  fill?: string
}

/** d3 pie 计算后的弧数据 */
export interface PieArcData {
  data: PieData
  index: number
  startAngle: number
  endAngle: number
  padAngle: number
  value: number
}

/** Pie 上下文（供 PieSlice / PieCenter 使用） */
export interface PieContextValue {
  data: PieData[]
  arcs: PieArcData[]
  size: number
  center: number
  outerRadius: number
  innerRadius: number
  padAngle: number
  cornerRadius: number
  hoverOffset: number
  hoveredIndex: number | null
  setHoveredIndex: (index: number | null) => void
  animationKey: number
  isLoaded: boolean
  containerRef: RefObject<HTMLDivElement | null>
  totalValue: number
  getColor: (index: number) => string
  getFill: (index: number) => string
  /** 相对图表容器（containerRef）的指针位置，用于悬停提示框 */
  tooltipPos: { x: number, y: number } | null
  /** 根据视口 client 坐标更新 tooltip 锚点 */
  setTooltipClientPoint: (clientX: number, clientY: number) => void
}

export interface PieChartProps {
  /** 数据，每一项为一个扇区 */
  data: PieData[]
  /** 固定边长（像素）；不传则随父容器响应式 */
  size?: number
  /** 内半径，0 为实心饼图 @default 0 */
  innerRadius?: number
  /** 扇区间隙（弧度）@default 0 */
  padAngle?: number
  /** 扇区圆角 @default 0 */
  cornerRadius?: number
  /** 起始角（弧度）@default -π/2 */
  startAngle?: number
  /** 结束角（弧度）@default 3π/2 */
  endAngle?: number
  className?: string
  /** 受控：当前悬停扇区索引 */
  hoveredIndex?: number | null
  onHoverChange?: (index: number | null) => void
  /** 悬停外移/放大像素，同时作为边距防止裁切 @default 10 */
  hoverOffset?: number
  children: ReactNode
}

/** 悬停动效类型 */
export type PieSliceHoverEffect = 'translate' | 'grow' | 'none'

export interface PieSliceProps {
  /** 对应 data 数组下标 */
  index: number
  color?: string
  fill?: string
  /** @default true */
  animate?: boolean
  /** @default true */
  showGlow?: boolean
  /** @default 'translate' */
  hoverEffect?: PieSliceHoverEffect
  /** 悬停位移或放大像素，缺省用 PieChart 的 hoverOffset */
  hoverOffset?: number
  className?: string
}

/** PieCenter 数字格式（对齐 Intl.NumberFormatOptions 子集） */
export interface PieCenterNumberFormat {
  notation?: 'standard' | 'compact'
  compactDisplay?: 'short' | 'long'
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  minimumIntegerDigits?: number
  minimumSignificantDigits?: number
  maximumSignificantDigits?: number
  style?: 'decimal' | 'percent' | 'currency'
  currency?: string
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name'
  unit?: string
  unitDisplay?: 'short' | 'long' | 'narrow'
}

export interface PieCenterProps {
  /** 未悬停时的说明文案 @default '合计' */
  defaultLabel?: string
  formatOptions?: PieCenterNumberFormat
  children?: (props: {
    value: number
    label: string
    isHovered: boolean
    data: { label: string, value: number, color?: string, fill?: string }
  }) => ReactNode
  className?: string
  valueClassName?: string
  labelClassName?: string
  prefix?: string
  suffix?: string
}

export interface PieTooltipProps {
  /** 与 ChartTooltip.content 类似：完全自定义提示内容 */
  content?: (props: { data: PieData, index: number }) => ReactNode
  className?: string
}

export interface PieChartInnerProps {
  width: number
  height: number
  data: PieData[]
  innerRadius: number
  padAngle: number
  cornerRadius: number
  startAngle: number
  endAngle: number
  hoverOffset: number
  children: ReactNode
  containerRef: React.RefObject<HTMLDivElement | null>
  hoveredIndexProp?: number | null
  onHoverChange?: (index: number | null) => void
}
