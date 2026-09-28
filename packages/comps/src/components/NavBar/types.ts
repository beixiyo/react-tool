/**
 * NavBar 类型声明
 */

export type NavItem = {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  className?: string
  dropdownItems?: {
    id: string
    label: React.ReactNode
    icon?: React.ReactNode
    className?: string
  }[]
}

export type NavbarProps = {
  /** CSS class to apply to the navbar */
  className?: string
  /** Brand/logo component or element */
  brand?: React.ReactNode
  /** Children elements for imperative usage */
  children?: React.ReactNode
  /** Additional styles */
  style?: React.CSSProperties
  /** Items configuration for declarative usage */
  items?: NavItem[]
  /** Currently active item ID */
  activeItem?: string
  /** Callback when an item is clicked */
  onItemClick?: (itemId: string) => void

  dropdownRenderer?: NavbarItemProps['dropdownRenderer']
}

export interface NavbarItemProps {
  className?: string
  active?: boolean
  /**
   * 激活态的样式类，用于覆盖默认激活色
   * @default 'text-blue-600'
   */
  activeClassName?: string
  /**
   * 非激活态的 hover 样式类，用于覆盖默认 hover 色
   * @default 'hover:text-blue-600'
   */
  hoverClassName?: string
  hasDropdown?: boolean
  item?: NavItem
  dropdownRenderer?: (data: {
    isOpen: boolean
    item?: NavItem
  }) => React.ReactNode
  dropdownContent?: React.ReactNode
  dropdownPosition?: 'left' | 'center' | 'right'
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}

export type NavbarDropdownProps = {
  /** CSS class to apply to the dropdown */
  className?: string
  /** Children elements */
  children?: React.ReactNode
  /** Callback when an item is clicked */
  onItemClick?: () => void
  /** Additional styles */
  style?: React.CSSProperties
}

export type NavbarDropdownItemProps = {
  /** CSS class to apply to the item */
  className?: string
  /** Whether this item is currently active */
  active?: boolean
  /** Icon to display before the text */
  icon?: React.ReactNode
  /** Children elements */
  children?: React.ReactNode
  /** Click handler */
  onClick?: () => void
  /** Additional styles */
  style?: React.CSSProperties
  /**
   * 激活圆点的 motion layoutId；
   * 传入统一值可让圆点在多个 item 间平滑滑动，
   * 不传则每项独立（仅淡入）
   */
  layoutId?: string
}
