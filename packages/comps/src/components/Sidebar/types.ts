/**
 * Sidebar 类型声明
 */
import type { InfiniteScrollProps } from '../InfiniteScroll'

export type SidebarProps = Pick<InfiniteScrollProps, 'loadMore' | 'hasMore'> & {
  /**
   * Custom width when expanded
   */
  expandedWidth?: number
  /**
   * Custom width when collapsed
   */
  collapsedWidth?: number

  disableHeader?: boolean
  disableItem?: boolean

  className?: string
  itemClassName?: string
  headerClassName?: string
  style?: React.CSSProperties

  /**
   * Items to display in the sidebar
   */
  data: Array<{
    id: string
    img: string
    title: string
    subtitle?: string
    timestamp: string
  }>
  /**
   * Callback when an item is clicked
   */
  onItemClick?: (id: string) => void
  /**
   * Callback when add button is clicked
   */
  onAddClick?: () => void
  /**
   * Custom header title
   */
  headerTitle?: string
  /**
   * Hover delay in milliseconds before expanding
   */
  hoverDelay?: number
  /**
   * Hover delay in milliseconds before collapsing
   */
  leaveDelay?: number

  /**
   * 受控展开状态。传入后由外部完全控制展开 / 收起，内部 hover 仅触发 `onExpandedChange`
   */
  expanded?: boolean
  /**
   * 非受控模式下的初始展开状态
   * @default false
   */
  defaultExpanded?: boolean
  /**
   * 展开状态变化回调（hover 触发或外部需要切换时）
   */
  onExpandedChange?: (expanded: boolean) => void

  /**
   * 当前选中项的 id，匹配的 `SidebarItem` 会显示选中高亮
   */
  activeId?: string
  /**
   * 列表为空（`data.length === 0`）时渲染的占位内容
   */
  emptyContent?: React.ReactNode
}

export interface SidebarHeaderProps {
  className?: string
  disabled?: boolean
  /**
   * Whether the sidebar is expanded
   */
  isExpanded: boolean
  /**
   * Header title
   */
  title?: string
  /**
   * Callback when add button is clicked
   */
  onClick?: (e: React.MouseEvent) => void
}

export type SidebarItemProps = SidebarProps['data'][0] & {
  isExpanded: boolean
  /**
   * Callback when item is clicked
   */
  onClick?: (id: string) => void
  className?: string
  disabled?: boolean
  /**
   * 是否为当前选中项，显示高亮
   * @default false
   */
  active?: boolean
}
