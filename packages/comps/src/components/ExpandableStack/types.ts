import type React from 'react'

/**
 * 通用可展开堆叠组件的基础项类型
 * - 要求必须包含唯一的 id 字段
 */
export type ExpandableStackItem = {
  /** 唯一标识符 */
  id: string
}

/**
 * 渲染收起态卡片的渲染函数
 * @remarks 外部可完全自定义收起态的 TSX 内容
 */
export type RenderCollapsed<T extends ExpandableStackItem> = (
  item: Readonly<T>,
  index: number,
) => React.ReactNode

/**
 * 渲染展开态卡片的渲染函数
 * @remarks 外部可完全自定义展开态的 TSX 内容；提供 close 方法用来关闭
 */
export type RenderExpanded<T extends ExpandableStackItem> = (
  item: Readonly<T>,
  index: number,
  close: () => void,
) => React.ReactNode

/**
 * 动画配置
 */
export type ExpandableStackAnimation = {
  /** 动画类型 @default 'spring' */
  type?: 'spring' | 'tween'
  /** 弹簧刚度，type 为 'spring' 时有效 @default 300 */
  stiffness?: number
  /** 阻尼，type 为 'spring' 时有效 @default 30 */
  damping?: number
  /** 时长，type 为 'tween' 时有效，单位秒 @default 0.25 */
  duration?: number
}

/**
 * 初始偏移配置
 */
export type InitialOffset = {
  /** 初始 X 偏移，进入动画用 @default -100 */
  x?: number
  /** 初始 Y 偏移，进入动画用 @default 100 */
  y?: number
}

/**
 * ExpandableStack 组件的属性
 */
export type ExpandableStackProps<T extends ExpandableStackItem> = {
  /** 数据项列表，用于渲染堆叠卡片 */
  items: ReadonlyArray<Readonly<T>>

  /** 受控：当前展开项的 id，不传则为非受控 */
  expandedId?: string | null
  /** 非受控：默认展开项 id @default null */
  defaultExpandedId?: string | null
  /** 展开项变化回调 */
  onExpandedChange?: (id: string | null) => void

  /** 收起态渲染函数（传入 item、index） */
  renderCollapsed: RenderCollapsed<T>
  /** 展开态渲染函数（传入 item、index、close） */
  renderExpanded: RenderExpanded<T>

  /** 堆叠容器位置 @default 'top-right' */
  position?: 'top-right' | 'top-left'
  /** 容器偏移（单位 px） @default { top: 0, right: 16, left: 16 } */
  containerOffset?: { top?: number, right?: number, left?: number }

  /** 收起态每张卡片的垂直层叠间距（单位 px） @default 0 */
  stackSpacing?: number
  /** 收起态透明度 @default 0.1 */
  collapsedOpacity?: number
  /** 悬浮态透明度 @default 1 */
  hoverOpacity?: number

  /** 展开态是否采用 fixed 定位 @default true */
  expandedFixed?: boolean
  /** 展开态定位位置 @default 'top-right' */
  expandedPlacement?: 'top-right' | 'center'
  /** 展开态宽度 @default 600 */
  expandedWidth?: number | string
  /** 展开态最大高度 @default 'calc(100vh - 2rem)' */
  expandedMaxHeight?: string
  /** zIndex 基准 @default 50 */
  zIndexBase?: number

  /** 是否启用按 ESC 关闭展开态 @default true */
  enableEscClose?: boolean

  /** 动画参数配置 */
  animation?: ExpandableStackAnimation
  /** 进入动画初始偏移量 */
  initialOffset?: InitialOffset

  /** 容器类名 */
  className?: string
  /** 卡片通用类名（收起/展开都会追加） */
  itemClassName?: string
  /** 展开态类名（仅展开时追加） */
  expandedClassName?: string
  /** 收起态类名（仅收起时追加） */
  collapsedClassName?: string
  /** 容器内联样式 */
  style?: React.CSSProperties
}
