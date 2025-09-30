import type { ReactNode } from 'react'

/**
 * 可收起侧边栏组件的属性类型
 */
export type CollapsibleSidebarProps = {
  /**
   * 是否处于收起状态
   * @default false
   */
  isCollapsed?: boolean

  /**
   * 切换收起/展开状态的回调函数
   */
  onToggle?: () => void

  /**
   * 展开时的宽度
   * @default 280
   */
  expandedWidth?: number

  /**
   * 收起时的宽度，设为 0 时完全隐藏
   * @default 0
   */
  collapsedWidth?: number

  /**
   * 侧边栏位置
   * @default 'left'
   */
  position?: 'left' | 'right'

  /**
   * 是否显示切换按钮
   * @default true
   */
  showToggleButton?: boolean

  /**
   * 切换按钮位置
   * @default 'inside'
   */
  toggleButtonPosition?: 'inside' | 'outside'

  /**
   * 智能按钮定位：当 collapsedWidth 过小时，自动将按钮移到外部避免布局冲突
   * - true: 自动检测，当 collapsedWidth < 80 时切换到外部
   * - false: 始终使用 toggleButtonPosition 配置
   * @default true
   */
  toggleButtonAutoPosition?: boolean

  /**
   * 动画持续时间（秒）
   * @default 0.3
   */
  animationDuration?: number

  /**
   * 动画类型
   * @default 'spring'
   */
  animationType?: 'spring' | 'tween'

  /**
   * 是否显示遮罩层（移动端）
   * @default false
   */
  overlay?: boolean

  /**
   * 遮罩层样式类名
   */
  overlayClassName?: string

  /**
   * 切换按钮样式类名
   */
  toggleButtonClassName?: string

  /**
   * 内容区域样式类名
   */
  contentClassName?: string

  /**
   * 侧边栏容器样式类名
   */
  className?: string

  /**
   * 内联样式
   */
  style?: React.CSSProperties

  /**
   * 侧边栏内容
   */
  children?: ReactNode

  /**
   * 是否禁用切换功能
   * @default false
   */
  disabled?: boolean

  /**
   * z-index 层级
   * @default 10
   */
  zIndex?: number
}
