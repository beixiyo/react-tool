import type { ReactNode } from 'react'
import type { Margin } from '../types/chart'

export type BarOrientation = 'vertical' | 'horizontal'
export type BarLineCap = 'round' | 'butt' | number
export type BarAnimationType = 'grow' | 'fade'

export interface BarProps {
  /** 用于读取 y 值的数据字段 key */
  dataKey: string
  /**
   * 柱子的填充颜色，可以是纯色、渐变 url 或图案 url。
   * 默认：var(--chart-line-primary)
   */
  fill?: string
  /**
   * Tooltip 圆点颜色。
   * 当 fill 使用渐变 / 图案时，可使用该字段指定纯色。
   * 默认：使用 fill 值。
   */
  stroke?: string
  /**
   * 柱子两端的线帽样式：
   * - "round"：圆角
   * - "butt"：直角
   * - number：自定义圆角半径
   * 默认："round"
   */
  lineCap?: BarLineCap
  /** 是否启用柱子动画，默认：true */
  animate?: boolean
  /**
   * 动画类型：
   * - "grow"：高度从 0 长到目标高度
   * - "fade"：从透明模糊渐变到清晰
   * 默认："grow"
   */
  animationType?: BarAnimationType
  /** 当其他柱子被高亮时，非高亮柱子的透明度，默认：0.3 */
  fadedOpacity?: number
  /** 柱子之间的交错动画延迟（秒），不传则自动根据柱子数量计算 */
  staggerDelay?: number
  /** 堆叠柱子之间的垂直/水平间隙（像素），默认：0 */
  stackGap?: number
  /** 分组柱子之间的间隙（像素），默认：4 */
  groupGap?: number
}

export interface BarChartProps extends React.HTMLAttributes<HTMLElement> {
  /** 数据数组，每一项应包含一个用于分类轴的字段和若干数值字段 */
  data: Record<string, unknown>[]
  /** 分类轴使用的数据字段 key，默认："name" */
  xDataKey?: string
  /** 图表边距 */
  margin?: Partial<Margin>
  /** 动画时长（毫秒），默认：1100 */
  animationDuration?: number
  /**
   * 柱子组之间的间隔，按带宽（bandWidth）的比例 0-1 表示。
   * 默认：0.2
   */
  barGap?: number
  /**
   * 固定柱子宽度（像素）。
   * 若未设置，则柱子会自动填满带宽。
   */
  barWidth?: number
  /** 柱状图方向，默认："vertical"（垂直） */
  orientation?: BarOrientation
  /** 是否使用堆叠模式而不是分组模式，默认：false */
  stacked?: boolean
  /** 堆叠段之间的间隙（像素），默认：0 */
  stackGap?: number
  /** 子组件（Bar、Grid、ChartTooltip 等） */
  children: ReactNode
}

export interface BarXAxisProps {
  /** 底部日期胶囊的半宽，用于计算淡出范围，默认：50 */
  tickerHalfWidth?: number
  /** 是否展示全部标签（密集数据下可能重叠），默认：false */
  showAllLabels?: boolean
  /** 在自动抽稀模式下最多展示的标签数量，默认：12 */
  maxLabels?: number
}

export interface BarXAxisLabelProps {
  label: string
  x: number
  crosshairX: number | null
  isHovering: boolean
  tickerHalfWidth: number
}

export interface BarYAxisProps {
  /** 是否展示全部标签（密集数据下可能重叠），默认：true */
  showAllLabels?: boolean
  /** 在自动抽稀模式下最多展示的标签数量，默认：20 */
  maxLabels?: number
}

export interface BarYAxisLabelProps {
  label: string
  y: number
  bandHeight: number
  isHovered: boolean
}

export interface AnimatedBarProps {
  x: number
  y: number
  width: number
  height: number
  fill: string
  rx: number
  ry: number
  index: number
  isFaded: boolean
  animationType: BarAnimationType
  innerHeight: number
  fadedOpacity: number
  staggerDelay: number
  animationDuration: number
  isHorizontal: boolean
}
