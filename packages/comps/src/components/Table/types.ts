import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState, SortingState, Table as TableInstance, VisibilityState } from '@tanstack/react-table'

export type { TableInstance }

/**
 * 扩展 @tanstack/react-table 的 ColumnDef 类型，添加对齐方式和编辑功能支持
 */
declare module '@tanstack/react-table' {
  interface ColumnDefBase<TData, TValue> {
    /**
     * 表头对齐方式
     * 优先级高于 Table 组件的 defaultHeaderAlign
     */
    headerAlign?: TextAlign
    /**
     * 单元格对齐方式
     * 优先级高于 Table 组件的 defaultCellAlign
     */
    cellAlign?: TextAlign
    /**
     * 单元格编辑配置
     */
    editConfig?: CellEditConfig<TData, TValue>
  }
}

/**
 * 文本对齐方式
 */
export type TextAlign = 'left' | 'center' | 'right'

/**
 * 获取行属性的函数类型
 */
export type GetRowProps<TData> = (row: TData, index: number) => Record<string, any>

/**
 * 编辑相关的事件回调类型
 */
export type EditCallbacks<TData> = {
  /**
   * 开始编辑时的事件回调
   */
  onEditStart?: (params: { row: TData, columnId: string, value: unknown }) => void
  /**
   * 取消编辑时的事件回调
   */
  onEditCancel?: (params: { row: TData, columnId: string, originalValue: unknown }) => void
  /**
   * 确认编辑时的事件回调
   */
  onEditSave?: (params: { row: TData, columnId: string, newValue: unknown, originalValue: unknown }) => void
}

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
  onGlobalFilterChange?: OnChangeFn<string>
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
  /**
   * 开始编辑时的事件回调
   * @param params 编辑参数
   * @param params.row 当前行的数据
   * @param params.columnId 列 ID
   * @param params.value 当前单元格的值
   */
  onEditStart?: EditCallbacks<TData>['onEditStart']
  /**
   * 取消编辑时的事件回调
   * @param params 编辑参数
   * @param params.row 当前行的数据
   * @param params.columnId 列 ID
   * @param params.originalValue 原始值
   */
  onEditCancel?: EditCallbacks<TData>['onEditCancel']
  /**
   * 确认编辑时的事件回调
   * @param params 编辑参数
   * @param params.row 当前行的数据
   * @param params.columnId 列 ID
   * @param params.newValue 新值
   * @param params.originalValue 原始值
   */
  onEditSave?: EditCallbacks<TData>['onEditSave']
  /**
   * 无限滚动加载更多数据的回调函数
   * 当 VirtualizedBody 触底时自动调用
   * @returns Promise<void> 加载完成后需要 resolve
   */
  loadMore?: () => Promise<void>
  /**
   * 是否还有更多数据可加载
   * @default true
   */
  hasMore?: boolean
  /**
   * 是否显示加载中的状态指示器
   * @default false
   */
  showLoading?: boolean
  /**
   * 是否启用自动行号功能
   * @default false
   */
  enableRowNumber?: boolean
  /**
   * 获取行属性的函数，用于自定义行的 HTML 属性
   * @param row 当前行的数据
   * @param index 行索引
   * @returns 返回要应用到 <tr> 元素的属性对象
   */
  getRowProps?: GetRowProps<TData>
  /**
   * 是否显示加载状态遮罩层
   * @default false
   */
  loading?: boolean
  /**
   * 自定义加载组件
   * 如果不提供，则使用默认的 Loading 组件
   * @param loading 当前加载状态
   */
  loadingComponent?: (loading: boolean) => React.ReactNode
  /**
   * 默认表头对齐方式
   * 如果列定义中设置了 headerAlign，则使用列定义中的值（优先级更高）
   * @default 'left'
   */
  defaultHeaderAlign?: TextAlign
  /**
   * 默认单元格对齐方式
   * 如果列定义中设置了 cellAlign，则使用列定义中的值（优先级更高）
   * @default 'left'
   */
  defaultCellAlign?: TextAlign
  /**
   * 行选择复选框列宽度（像素）
   * @default 48
   */
  rowSelectionColumnWidth?: number
  /**
   * 行号列宽度（像素）
   * @default 60
   */
  rowNumberColumnWidth?: number
  /**
   * 虚拟滚动默认高度（像素）
   * @default 400
   */
  virtualScrollDefaultHeight?: number
  /**
   * 虚拟滚动行估算高度（像素）
   * @default 52
   */
  virtualRowEstimateSize?: number
  /**
   * 虚拟滚动加载指示器高度（像素）
   * @default 60
   */
  virtualLoadingHeight?: number
  /**
   * 虚拟滚动 overscan 数量
   * @default 5
   */
  virtualOverscan?: number
  /**
   * 触底加载阈值（像素）
   * @default 50
   */
  scrollReachBottomThreshold?: number
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
