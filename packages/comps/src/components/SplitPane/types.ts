import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'

/**
 * 主题配置
 */
export type SplitPaneTheme = {
  /**
   * 分隔条背景色
   * @default 'rgb(var(--border) / 0.6)'
   */
  dividerColor?: string
  /**
   * 分隔条 hover 时的背景色
   * @default 'rgb(var(--border3) / 1)'
   */
  dividerHoverColor?: string
  /**
   * 收起按钮背景色
   * @default 'rgb(var(--background2) / 1)'
   */
  buttonBackground?: string
  /**
   * 收起按钮 hover 背景色
   * @default 'rgb(var(--background) / 1)'
   */
  buttonHoverBackground?: string
  /**
   * 收起按钮图标颜色
   * @default 'rgb(var(--text) / 1)'
   */
  buttonIconColor?: string
}

/**
 * 面板配置
 */
export type PanelConfig = {
  /**
   * 面板唯一标识
   */
  id: string
  /**
   * 最小宽度（像素）
   * @default 100
   */
  minWidth?: number
  /**
   * 最大宽度（像素）
   * @default Infinity
   */
  maxWidth?: number
  /**
   * 收起后的宽度（像素）
   * @default 0
   */
  collapsedWidth?: number
  /**
   * 是否可收起
   * @default true
   */
  collapsible?: boolean
  /**
   * 自动收起的临界宽度，低于此值时自动收起
   * @default undefined（不自动收起）
   */
  autoCollapseThreshold?: number
  /**
   * 初始宽度（像素或 'auto'）
   * @default 'auto'
   */
  defaultWidth?: number | 'auto'
}

/**
 * 面板状态
 */
export type PanelState = {
  /**
   * 当前宽度
   */
  width: number
  /**
   * 是否已收起
   */
  collapsed: boolean
  /**
   * 收起前的宽度（用于恢复）
   */
  widthBeforeCollapse: number
  /**
   * 是否因响应式空间不足被临时收起
   *
   * 临时收起不会覆盖用户持久化的展开偏好，容器恢复后可自动还原
   * @default false
   */
  responsiveCollapsed?: boolean
}

/**
 * 响应式布局重算上下文
 */
export type SplitPaneLayoutContext = {
  /**
   * 面板配置列表
   */
  configs: PanelConfig[]
  /**
   * 当前面板状态
   */
  states: PanelState[]
  /**
   * 容器宽度
   */
  containerWidth: number
  /**
   * 默认分隔条宽度
   */
  dividerSize: number
  /**
   * 分隔条宽度列表
   */
  dividerSizes?: readonly number[]
  /**
   * 面板间距
   * @default 0
   */
  gap: number
  /**
   * 触发布局重算的原因
   */
  reason: 'init' | 'resize' | 'toggle'
}

/**
 * 自定义响应式布局重算函数
 */
export type SplitPaneLayoutResolver = (context: SplitPaneLayoutContext) => PanelState[] | null | undefined

/**
 * 面板显式切换上下文
 */
export type SplitPaneToggleContext = SplitPaneLayoutContext & {
  /** 被切换的面板索引 */
  panelIndex: number
  /** 被切换的面板 id */
  panelId: string
}

/**
 * 自定义面板切换结算函数
 *
 * 用于多栏布局在一次状态更新内完成互斥收起和展开，避免产生非法中间宽度
 */
export type SplitPaneToggleResolver = (context: SplitPaneToggleContext) => PanelState[] | null | undefined

/**
 * SplitPane 子组件 Props
 */
export type SplitPanePanelProps = {
  /**
   * 面板唯一标识，用于通过 usePanelState 获取状态
   * @default useId()
   */
  id: string
  /**
   * 面板内容
   */
  children: ReactNode
  /**
   * 最小宽度（像素）
   * @default 100
   */
  minWidth?: number
  /**
   * 最大宽度（像素）
   * @default Infinity
   */
  maxWidth?: number
  /**
   * 收起后的宽度（像素）
   * @default 0
   */
  collapsedWidth?: number
  /**
   * 是否可收起（仅对左右两侧面板有效）
   * @default true
   */
  collapsible?: boolean
  /**
   * 自动收起的临界宽度
   */
  autoCollapseThreshold?: number
  /**
   * 初始宽度
   * @default 'auto'
   */
  defaultWidth?: number | 'auto'
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 允许内容溢出面板边界（阴影、装饰等不被裁切）
   * @default false
   */
  allowOverflow?: boolean
}

/**
 * 分隔条样式配置
 */
export type DividerStyleConfig = {
  /**
   * 分隔条类名
   */
  className?: string
  /**
   * 分隔条样式
   */
  style?: React.CSSProperties
  /**
   * hover 时的分隔条类名
   */
  hoverClassName?: string
  /**
   * hover 时的分隔条样式
   */
  hoverStyle?: React.CSSProperties
}

/**
 * SplitPane 主组件 Props
 */
export type SplitPaneProps = {
  /**
   * 面板子组件
   */
  children: ReactNode
  /**
   * localStorage 存储键名，用于持久化布局状态
   */
  storageKey?: string
  /**
   * 分隔条宽度（像素）
   * @default 4
   */
  dividerSize?: number
  /**
   * 分隔条宽度列表，按分隔条索引覆盖 dividerSize
   *
   * 未配置的分隔条会回退到 dividerSize
   * @default undefined
   */
  dividerSizes?: readonly number[]
  /**
   * 面板之间的间距（像素），在分隔条两侧均匀分配
   * @default 0
   */
  gap?: number
  /**
   * 布局变化回调
   *
   * 注意：拖拽过程中会随每次 mousemove 高频触发（每帧一次），
   * 若只需要拖拽结束时的最终布局（用于持久化 / 重计算），请使用 `onResizeEnd`
   */
  onLayoutChange?: (sizes: number[], collapsedStates: boolean[]) => void
  /**
   * 拖拽结束（含自动收起结算后）触发一次，回传最终布局
   *
   * 相比高频的 `onLayoutChange`，更适合做持久化或重计算
   */
  onResizeEnd?: (sizes: number[], collapsedStates: boolean[]) => void
  /**
   * 主题配置
   */
  theme?: SplitPaneTheme
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 收起/展开动画持续时间（毫秒）
   * @default 200
   */
  animationDuration?: number
  /**
   * 分隔条样式配置（细粒度控制）
   */
  dividerStyleConfig?: DividerStyleConfig
  /**
   * 分隔条是否可拖拽配置
   *
   * 按分隔条索引配置，当某一项为 false 时，对应分隔条不可拖拽
   * 未提供或长度不足时，未配置的分隔条默认可拖拽
   */
  draggableDividers?: boolean[]
  /**
   * 是否显示分隔条 hover 时的收起 / 展开按钮
   * @default true
   */
  showCollapseButtons?: boolean
  /**
   * 是否渲染分隔条视觉线条
   *
   * 传入数组时按分隔条索引配置，未配置项默认显示
   * @default true
   */
  showDividerLines?: boolean | readonly boolean[]
  /**
   * 容器尺寸变化时的自定义布局重算
   *
   * 返回 null / undefined 时保持默认布局状态不变
   */
  resolveLayout?: SplitPaneLayoutResolver
  /**
   * 自定义面板显式切换结算
   *
   * 返回 null / undefined 时使用 SplitPane 默认切换逻辑
   */
  resolveToggle?: SplitPaneToggleResolver
  /**
   * 外部 resize 信号
   *
   * 值变化时会重新测量容器宽度并触发布局重算，不会重挂载面板
   */
  resizeSignal?: unknown
}

/**
 * Divider 组件 Props
 */
export type DividerProps = {
  /**
   * 分隔条索引
   */
  index: number
  /**
   * 分隔条宽度
   */
  size: number
  /**
   * 左侧面板是否可收起
   */
  leftCollapsible: boolean
  /**
   * 右侧面板是否可收起
   */
  rightCollapsible: boolean
  /**
   * 左侧面板是否已收起
   */
  leftCollapsed: boolean
  /**
   * 右侧面板是否已收起
   */
  rightCollapsed: boolean
  /**
   * 拖拽开始回调
   */
  onDragStart: (index: number, event: ReactMouseEvent) => void
  /**
   * 收起左侧面板
   */
  onCollapseLeft: () => void
  /**
   * 收起右侧面板
   */
  onCollapseRight: () => void
  /**
   * 主题配置
   */
  theme?: SplitPaneTheme
  /**
   * 分隔条样式配置（细粒度控制）
   */
  styleConfig?: DividerStyleConfig
  /**
   * 是否允许拖拽
   * @default true
   */
  draggable?: boolean
  /**
   * 是否显示 hover 时的收起 / 展开按钮
   * @default true
   */
  showCollapseButtons?: boolean
  /**
   * 是否渲染分隔条视觉线条
   * @default true
   */
  showDividerLine?: boolean
}

/**
 * CollapseButton 组件 Props
 */
export type CollapseButtonProps = {
  /**
   * 收起方向
   */
  direction: 'left' | 'right'
  /**
   * 是否已收起
   */
  collapsed: boolean
  /**
   * 点击回调
   */
  onClick: () => void
  /**
   * 主题配置
   */
  theme?: SplitPaneTheme
}

/**
 * 持久化存储的数据结构
 */
export type PersistedState = {
  sizes: number[]
  collapsedStates: boolean[]
  widthsBeforeCollapse: number[]
}
