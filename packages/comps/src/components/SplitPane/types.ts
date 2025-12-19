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
   * @default 'rgb(var(--borderStrong) / 1)'
   */
  dividerHoverColor?: string
  /**
   * 收起按钮背景色
   * @default 'rgb(var(--backgroundSecondary) / 1)'
   */
  buttonBackground?: string
  /**
   * 收起按钮 hover 背景色
   * @default 'rgb(var(--background) / 1)'
   */
  buttonHoverBackground?: string
  /**
   * 收起按钮图标颜色
   * @default 'rgb(var(--textPrimary) / 1)'
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
}

/**
 * SplitPane 子组件 Props
 */
export type SplitPanePanelProps = {
  /**
   * 面板唯一标识，用于通过 usePanelState 获取状态
   */
  id?: string
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
   * 布局变化回调
   */
  onLayoutChange?: (sizes: number[], collapsedStates: boolean[]) => void
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
