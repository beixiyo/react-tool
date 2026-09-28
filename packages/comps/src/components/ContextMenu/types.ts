import type { FloatingPlacement } from 'hooks'

export type ContextMenuProps = {
  /**
   * 菜单内容
   */
  children?: React.ReactNode
  /**
   * 菜单宽度（像素）
   * @default 200
   */
  width?: number
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 自定义样式
   */
  style?: React.CSSProperties
  /**
   * 菜单打开时的回调
   */
  onOpen?: () => void
  /**
   * 菜单关闭时的回调
   */
  onClose?: () => void
  /**
   * 点击菜单内容时是否自动关闭
   * @default true
   */
  closeOnClick?: boolean
  /**
   * 受控模式：菜单是否打开
   * 当提供此 prop 时，组件进入受控模式，不会监听全局 contextmenu 事件，
   * 需自行监听右键并通过 ref.open(event) 触发打开（仅传 open 不会自动右键弹出）
   */
  open?: boolean
  /**
   * 受控模式：菜单打开状态变化时的回调
   */
  onOpenChange?: (open: boolean) => void
  /**
   * 点击外部关闭时忽略的选择器
   * 用于防止点击某些元素（如 Popover 内容）时关闭菜单
   */
  clickOutsideIgnoreSelector?: string
  /**
   * 点击菜单内容关闭时忽略的选择器
   * 用于防止点击有二级菜单的项（如 Popover trigger）时关闭菜单
   */
  closeOnClickIgnoreSelector?: string
}

/**
 * `ContextMenuRef.open` 的定位选项
 */
export type ContextMenuOpenOptions = {
  /**
   * 定位锚：传元素或包围盒时，菜单出现在锚下方、按 `placement` 对齐锚的左缘或右缘
   * （越界仍会翻转 / 平移），位置与右键落点无关；省略则以鼠标点定位
   */
  anchor?: Element | DOMRect
  /**
   * 菜单相对锚（或鼠标点）的落位：`bottom-start` 左缘对齐，`bottom-end` 右缘对齐
   *
   * 锚靠近容器右缘时用 `bottom-end`，避免菜单向右伸出后再被 shift 推回、与锚错位
   * @default 'bottom-start'
   */
  placement?: ContextMenuPlacement
}

/** 菜单支持的落位；只开放底部两种对齐方式，下方空间不足时仍由 flip 翻到上方 */
export type ContextMenuPlacement = Extract<FloatingPlacement, 'bottom-start' | 'bottom-end'>

/**
 * ContextMenu 组件的 Ref
 */
export interface ContextMenuRef {
  /**
   * 手动打开菜单
   *
   * @param options 定位选项，见 {@link ContextMenuOpenOptions}
   */
  open: (event: MouseEvent, options?: ContextMenuOpenOptions) => void
  /**
   * 手动关闭菜单
   */
  close: () => void
}

export type ContextMenuItemProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'role'> & {
  /** 左侧图标 */
  icon?: React.ReactNode
  /** 右侧附加内容，如快捷键提示、勾选图标 */
  extra?: React.ReactNode
  /**
   * 禁用后不触发 onClick
   * @default false
   */
  disabled?: boolean
  /** 菜单项文字 */
  children?: React.ReactNode
  /** 图标 + 文字容器的额外类名 */
  contentClassName?: string
  /** 文字的额外类名 */
  labelClassName?: string
}
