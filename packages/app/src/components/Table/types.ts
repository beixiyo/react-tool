import type { ColumnDef, PaginationState, SortingState, OnChangeFn, Updater } from '@tanstack/react-table'

/**
 * 表格组件的 Props
 */
export type TableProps<TData> = {
  /**
   * 表格需要渲染的数据
   */
  data: TData[]
  /**
   * 表格的列定义
   */
  columns: ColumnDef<TData>[]
  /**
   * 是否启用虚拟滚动
   * @default false
   */
  enableVirtualization?: boolean
  /**
   * 受控的排序状态
   */
  sorting?: SortingState
  /**
   * 排序状态变化时的回调
   */
  onSortingChange?: OnChangeFn<SortingState>
  /**
   * 受控的全局筛选关键字
   */
  globalFilter?: string
  /**
   * 全局筛选关键字变化时的回调
   */
  onGlobalFilterChange?: (filter: string) => void
  /**
   * 受控的分页状态
   */
  pagination?: PaginationState
  /**
   * 分页状态变化时的回调
   */
  onPaginationChange?: OnChangeFn<PaginationState>
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
