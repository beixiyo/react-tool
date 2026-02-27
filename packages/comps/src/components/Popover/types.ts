import type { Variants } from 'motion/react'

/** Popover 显示位置 */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'

/** Popover 触发方式 */
export type PopoverTrigger = 'hover' | 'click' | 'command'

/** 各位置的动画变体映射 */
export type PopoverVariantsMap = {
  [key in PopoverPosition]: Variants
}

export interface PopoverProps {
  /**
   * 触发器元素的类名
   */
  className?: string
  /**
   * 内容元素的类名
   */
  contentClassName?: string
  /**
   * 触发器元素的样式
   */
  style?: React.CSSProperties
  /**
   * 触发 Popover 的子元素
   */
  children: React.ReactNode
  /**
   * Popover 中显示的内容
   */
  content: React.ReactNode
  /**
   * Popover 的位置
   * @default 'top'
   */
  position?: PopoverPosition
  /**
   * 触发 Popover 的方式
   * - 'hover': 鼠标悬停触发
   * - 'click': 点击触发
   * - 'command': 命令式触发，只能通过 ref 的 open/close 方法控制
   * @default 'hover'
   */
  trigger?: PopoverTrigger
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showCloseBtn?: boolean
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 移除 Popover 之前的延迟（毫秒）
   * @default 200
   */
  removeDelay?: number
  /**
   * 显示 Popover 之前的延迟（毫秒）
   * @default 0
   */
  showDelay?: number
  /**
   * 与触发器元素的偏移距离
   * @default 8
   */
  offset?: number
  /**
   * 点击外部区域是否关闭 Popover
   * @default true
   */
  clickOutsideToClose?: boolean
  /**
   * Popover 打开时的回调
   */
  onOpen?: () => void
  /**
   * Popover 关闭时的回调
   */
  onClose?: () => void
  /**
   * 虚拟 reference 的矩形区域
   */
  virtualReferenceRect?: DOMRect | null
  /**
   * 点击外部区域时忽略的选择器
   */
  clickOutsideIgnoreSelector?: string
  /**
   * 是否跟随元素滚动：为 true 时 Popover 挂载到触发器的滚动父级内，使用 absolute 定位，
   * 随容器内滚动一起移动。滚动父级需具备定位上下文（如 position: relative）以保证位置正确。
   * @default false
   */
  followScroll?: boolean
  /**
   * 打开后是否将焦点恢复到打开前的元素（避免 portal 挂载导致焦点被抢，如选中工具栏场景）。
   * 为 true 时会在打开后下一帧对「打开前」的 document.activeElement 执行 focus()。
   * @default false
   */
  restoreFocusOnOpen?: boolean
  /**
   * 关闭时是否禁用退出动画
   * 适用于路由切换等需要立即卸载的场景
   * @default false
   */
  exitSetMode?: boolean
  /**
   * 是否显示边框
   * @default light: false, dark: true
   */
  bordered?: boolean
}

/**
 * Popover 组件的 Ref
 */
export interface PopoverRef {
  /**
   * 手动打开 Popover
   */
  open: () => void
  /**
   * 手动关闭 Popover
   */
  close: () => void
}
