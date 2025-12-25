import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState, SortingState, VisibilityState } from '@tanstack/react-table'

/**
 * 单元格编辑配置
 */
export type CellEditConfig<TData, TValue = unknown> = {
  /**
   * 是否可编辑
   * @default false
   */
  editable?: boolean | ((row: TData) => boolean)
  /**
   * 编辑模式下的渲染函数
   * @param value 当前单元格的值
   * @param row 当前行的数据
   * @param onSave 保存回调，调用时传入新值
   * @param onCancel 取消回调
   */
  editComponent?: (params: {
    value: TValue
    row: TData
    onSave: (newValue: TValue) => void
    onCancel: () => void
  }) => React.ReactNode
  /**
   * 值变化时的回调
   * @param newValue 新值
   * @param row 当前行的数据
   * @param columnId 列 ID
   */
  onCellEdit?: (newValue: TValue, row: TData, columnId: string) => void | Promise<void>
}

/**
 * 扩展的列定义，支持编辑功能
 */
export type ExtendedColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  /**
   * 单元格编辑配置
   */
  editConfig?: CellEditConfig<TData, TValue>
}

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
   * 支持自定义 JSX 渲染：在 columnDef 中使用 cell 属性返回 React 元素
   * @example
   * ```tsx
   * {
   *   header: '状态',
   *   accessorKey: 'status',
   *   cell: ({ getValue }) => (
   *     <span className="text-systemOrange">{getValue()}</span>
   *   )
   * }
   * ```
   */
  columns: ExtendedColumnDef<TData>[]
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
  /**
   * 是否启用行选择功能
   * @default false
   */
  enableRowSelection?: boolean
  /**
   * 受控的行选择状态
   */
  rowSelection?: RowSelectionState
  /**
   * 行选择状态变化时的回调
   */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /**
   * 行选择变化时的事件回调，提供选中的行数据
   * @param selectedRows 选中的行数据数组
   * @param rowSelection 当前的选择状态
   */
  onSelectionChange?: (selectedRows: TData[], rowSelection: RowSelectionState) => void
  /**
   * 受控的列可见性状态
   * 用于控制列的显示/隐藏
   * @example { firstName: false, lastName: true } // 隐藏 firstName 列，显示 lastName 列
   */
  columnVisibility?: VisibilityState
  /**
   * 列可见性状态变化时的回调
   */
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  /**
   * 受控的列顺序状态
   * 用于控制列的显示顺序
   * @example ['firstName', 'lastName', 'age'] // 列的顺序
   */
  columnOrder?: string[]
  /**
   * 列顺序状态变化时的回调
   */
  onColumnOrderChange?: OnChangeFn<string[]>
  /**
   * 是否启用编辑功能
   * @default false
   */
  enableEditing?: boolean
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
