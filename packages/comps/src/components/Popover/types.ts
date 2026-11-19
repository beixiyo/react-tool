import type { FloatingOffset } from 'hooks'
import type { Variants } from 'motion/react'
import type { Ref } from 'react'
import type { FloatingArrowConfig } from '../FloatingArrow'

/** Popover 显示位置 */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'

/** Popover 交叉轴对齐方式 */
export type PopoverAlign = 'start' | 'center' | 'end'

/** Popover 触发方式 */
export type PopoverTrigger = 'hover' | 'click' | 'command'

/** 各位置的动画变体映射 */
export type PopoverVariantsMap = {
  [key in PopoverPosition]: Variants
}

export interface PopoverProps {
  ref?: Ref<PopoverRef>
  /**
   * 触发器元素的类名
   */
  className?: string
  /**
   * 内容元素的类名
   */
  contentClassName?: string
  /**
   * 内容元素的样式
   */
  contentStyle?: React.CSSProperties
  /**
   * 触发器元素的样式
   */
  style?: React.CSSProperties
  /**
   * 触发 Popover 的子元素
   *
   * 为单个 React 元素时，`aria-haspopup` / `aria-expanded` / `aria-controls` 会注入到该元素上
   * （子元素需把未知 props 透传到 DOM）；否则挂在包裹层
   */
  children: React.ReactNode
  /**
   * 浮层 dialog 的无障碍名称，仅 click / command 模式生效
   */
  'aria-label'?: string
  /**
   * 指向浮层 dialog 标题元素的 id，优先于 `aria-label`，仅 click / command 模式生效
   */
  'aria-labelledby'?: string
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
   * 交叉轴对齐方式（与 `position` 的垂直方向）：
   * - `'start'`：与触发器起始边对齐（如 `position='right'` 时子菜单顶部与触发行对齐）
   * - `'center'`：相对触发器居中
   * - `'end'`：与触发器结束边对齐
   * @default 'center'
   */
  align?: PopoverAlign
  /**
   * 触发 Popover 的方式
   * - 'hover': 鼠标悬停触发
   * - 'click': 点击触发
   * - 'command': 命令式触发，只能通过 ref 的 open/close 方法控制
   * @default 'hover'
   */
  trigger?: PopoverTrigger
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
   * 目标元素到浮层可见边缘的间距，单位 px；回调按每个候选方向计算
   *
   * 开启箭头时以箭头尖端为准，关闭箭头时以面板边缘为准，两种状态视觉间距一致
   * @default 8
   */
  offset?: FloatingOffset
  /**
   * 点击外部区域是否关闭 Popover
   * @default true
   */
  clickOutsideToClose?: boolean
  /**
   * 浮层打开时触发关闭的键盘按键
   * @default ['Escape']
   */
  closeKeys?: string[]
  /**
   * Popover 打开时的回调
   */
  onOpen?: () => void
  /**
   * Popover 关闭时的回调
   */
  onClose?: () => void
  /**
   * 受控的打开状态；传入后内部不再维护状态，开合请求只通过 `onOpenChange` 通知
   *
   * 不影响 ref 的 open / close：受控时它们同样只触发 `onOpenChange`
   */
  open?: boolean
  /**
   * 非受控时的初始打开状态
   * @default false
   */
  defaultOpen?: boolean
  /** 打开状态变化（含触发器、点击外部、关闭键、ref 调用）时回调；受控与非受控都会触发 */
  onOpenChange?: (open: boolean) => void
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
   * 随容器内滚动一起移动。滚动父级需具备定位上下文（如 position: relative）以保证位置正确
   * @default false
   */
  followScroll?: boolean
  /**
   * 打开期间逐帧跟随锚点，适用于触发器或祖先存在 transform / 布局动画的场景
   * @default false
   */
  animationFrame?: boolean
  /**
   * 打开后是否将焦点恢复到打开前的元素（避免 portal 挂载导致焦点被抢，如选中工具栏场景）
   * 为 true 时会在打开后下一帧对「打开前」的 document.activeElement 执行 focus()
   *
   * 默认 click 模式打开后会把焦点移入浮层（首个可聚焦元素，没有则浮层自身）、关闭后归还触发前的焦点；
   * 开启本项时不移入也不归还，焦点始终留在打开前的元素上
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
  /**
   * 是否显示气泡箭头。传对象时可配置箭头尺寸、偏移和样式
   * @default true
   */
  arrow?: FloatingArrowConfig
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
