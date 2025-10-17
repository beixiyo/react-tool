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
   * 自定义 header 插槽
   * 提供默认的标题和收起按钮布局，支持完全自定义
   */
  header?: {
    /**
     * 是否显示 header
     * @default true
     */
    show?: boolean
    /**
     * 标题文本
     * @default '侧边栏'
     */
    title?: string
    /**
     * 标题样式类名
     */
    titleClassName?: string
    /**
     * header 容器样式类名
     */
    className?: string
    /**
     * 自定义 header 内容，传入时覆盖默认布局
     */
    children?: ReactNode
  }

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
