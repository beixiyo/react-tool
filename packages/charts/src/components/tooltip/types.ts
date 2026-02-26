import type { MotionValue } from 'motion/react'
import type { ReactNode, RefObject } from 'react'

export interface TooltipRow {
  /** 行前面的颜色标记 */
  color: string
  /** 行标签文本 */
  label: string
  /** 行对应的数值 */
  value: string | number
}

export interface TooltipContentProps {
  /** 标题（通常为日期或类别名称） */
  title?: string
  /** 要展示的行数据 */
  rows?: TooltipRow[]
  /** 可选的附加内容（例如标记、说明等） */
  children?: ReactNode
}

export interface ChartTooltipProps {
  /** 是否在底部展示日期胶囊标签，默认：true */
  showDatePill?: boolean
  /** 是否展示垂直十字准线，默认：true */
  showCrosshair?: boolean
  /** 是否在柱子/折线拐点上展示圆点，默认：true */
  showDots?: boolean
  /** 自定义提示框内容渲染函数 */
  content?: (props: {
    point: Record<string, unknown>
    index: number
  }) => ReactNode
  /** 自定义行渲染函数，返回 TooltipRow 数组 */
  rows?: (point: Record<string, unknown>) => TooltipRow[]
  /** 行列表下方的附加内容（例如标记、补充说明等） */
  children?: ReactNode
  /** 自定义类名 */
  className?: string
}

export interface TooltipDotProps {
  /** 圆点的 x 坐标（相对图表内部坐标） */
  x: number
  /** 圆点的 y 坐标（相对图表内部坐标） */
  y: number
  /** 是否可见 */
  visible: boolean
  /** 圆点填充颜色 */
  color: string
  /** 圆点半径，默认：5 */
  size?: number
  /** 外描边颜色，默认：chart 背景色 */
  strokeColor?: string
  /** 外描边宽度，默认：2 */
  strokeWidth?: number
}

/** 十字准线宽度配置 */
export type IndicatorWidth
  = | number // 像素宽度
    | 'line' // 1px 细线（默认）
    | 'thin' // 2px
    | 'medium' // 4px
    | 'thick' // 8px

export interface TooltipIndicatorProps {
  /** 指示器中心的 x 坐标（像素） */
  x: number
  /** 指示器高度（像素） */
  height: number
  /** 是否可见 */
  visible: boolean
  /**
   * 指示器宽度：像素值或预设关键字。
   * 当同时提供 span 时会被忽略。
   */
  width?: IndicatorWidth
  /**
   * 需要跨越的列数/天数，当前点居中。
   * 需要搭配 columnWidth 一起使用。
   */
  span?: number
  /** 单个列/天的宽度（像素），与 span 配合使用 */
  columnWidth?: number
  /** 渐变边缘颜色（10% 与 90% 位置） */
  colorEdge?: string
  /** 渐变中间颜色（50% 位置） */
  colorMid?: string
  /** 是否在 0% 与 100% 处渐变为透明 */
  fadeEdges?: boolean
  /** 渐变唯一 ID，用于避免与其他图表冲突 */
  gradientId?: string
}

/** motion 弹簧返回值类型（用于描述 useSpring 创建的 MotionValue） */
export type MotionSpringLike = MotionValue<number>

export interface TooltipBoxProps {
  /** 相对容器的 x 坐标（像素） */
  x: number
  /** 相对容器的 y 坐标（像素） */
  y: number
  /** 是否可见 */
  visible: boolean
  /** 用于 portal 渲染的容器 ref */
  containerRef: RefObject<HTMLDivElement | null>
  /** 容器宽度，用于翻转判断 */
  containerWidth: number
  /** 容器高度，用于边界限制 */
  containerHeight: number
  /** 与目标点的偏移距离（像素） */
  offset?: number
  /** 自定义类名 */
  className?: string
  /** 提示框内容 */
  children: ReactNode
  /** 覆盖内部计算后的 left 值 */
  left?: number | MotionSpringLike
  /** 覆盖内部计算后的 top 值 */
  top?: number | MotionSpringLike
  /** 强制指定是否翻转（用于完全自定义定位） */
  flipped?: boolean
}

export interface DateTickerProps {
  /** 当前索引（与 labels 一一对应） */
  currentIndex: number
  /** 标签文本数组 */
  labels: string[]
  /** 是否可见 */
  visible: boolean
}
