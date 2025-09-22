import type { type ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, Row, SortingState, Table as TableInstance, TableOptions, useReactTable } from '@tanstack/react-table'

import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'

// =================================================================================================
// Props
// =================================================================================================

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
  onSortingChange?: (sorting: SortingState) => void
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
  onPaginationChange?: (pagination: PaginationState) => void
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

// =================================================================================================
// NormalBody (标准渲染)
// =================================================================================================
function NormalBody<TData extends object>({ table }: { table: TableInstance<TData> }) {
  return (
    <tbody style={ { display: 'grid' } }>
      { table.getRowModel().rows.map(row => (
        <tr key={ row.id } className="flex w-full bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          { row.getVisibleCells().map(cell => (
            <td key={ cell.id } className="px-6 py-4 flex items-center" style={ { width: cell.column.getSize() } }>
              { flexRender(cell.column.columnDef.cell, cell.getContext()) }
            </td>
          )) }
        </tr>
      )) }
    </tbody>
  )
}

// =================================================================================================
// VirtualizedBody (虚拟化渲染)
// =================================================================================================
function VirtualizedBody<TData extends object>({ table, container }: { table: TableInstance<TData>, container: HTMLDivElement | null }) {
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => container,
    estimateSize: () => 52,
    overscan: 5,
    measureElement:
      typeof window !== 'undefined' && !navigator.userAgent.includes('Firefox')
        ? element => element?.getBoundingClientRect().height
        : undefined,
  })

  return (
    <tbody
      style={ {
        display: 'grid',
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative',
      } }
    >
      { rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<TData>
        return (
          <tr
            key={ row.id }
            data-index={ virtualRow.index }
            ref={ node => rowVirtualizer.measureElement(node) }
            className="flex"
            style={ {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            } }
          >
            { row.getVisibleCells().map(cell => (
              <td
                key={ cell.id }
                className="px-6 py-4 flex items-center"
                style={ {
                  width: cell.column.getSize(),
                } }
              >
                { flexRender(cell.column.columnDef.cell, cell.getContext()) }
              </td>
            )) }
          </tr>
        )
      }) }
    </tbody>
  )
}

// =================================================================================================
// Table (主组件)
// =================================================================================================
export const Table = memo(<TData extends object>(props: TableProps<TData>) => {
  const {
    style,
    className,
    data,
    columns,
    enableVirtualization = false,
    sorting: controlledSorting,
    onSortingChange: setControlledSorting,
    globalFilter: controlledGlobalFilter,
    onGlobalFilterChange: setControlledGlobalFilter,
    pagination: controlledPagination,
    onPaginationChange: setControlledPagination,
  } = props

  /** 状态管理：支持受控和非受控模式 */
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const sorting = controlledSorting ?? internalSorting
  const setSorting = setControlledSorting ?? setInternalSorting

  const [internalGlobalFilter, setInternalGlobalFilter] = useState('')
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter
  const setGlobalFilter = setControlledGlobalFilter ?? setInternalGlobalFilter

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 30,
  })
  const pagination = controlledPagination ?? internalPagination
  const setPagination = setControlledPagination ?? setInternalPagination

  // TanStack Table 核心配置
  const tableOptions: TableOptions<TData> = {
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  }

  /** 根据是否启用虚拟滚动来决定是否添加分页配置 */
  if (!enableVirtualization) {
    tableOptions.state!.pagination = pagination
    tableOptions.onPaginationChange = setPagination
    tableOptions.getPaginationRowModel = getPaginationRowModel()
  }

  const table = useReactTable(tableOptions)

  /** 用于虚拟滚动的容器引用 */
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  return (
    <div
      ref={ setContainer } // 使用 Callback Ref
      className={ cn(
        'overflow-auto relative shadow-md sm:rounded-lg',
        enableVirtualization && 'h-[400px]', // 仅在虚拟滚动时设置固定高度
        className,
      ) }
      style={ style }
    >
      <table className="text-sm text-left text-gray-500 dark:text-gray-400 min-w-full" style={ { display: 'grid' } }>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" style={ { display: 'grid', position: 'sticky', top: 0, zIndex: 1 } }>
          { table.getHeaderGroups().map(headerGroup => (
            <tr key={ headerGroup.id } className="flex w-full">
              { headerGroup.headers.map(header => (
                <th
                  key={ header.id }
                  scope="col"
                  style={ {
                    width: header.getSize(),
                  } }
                >
                  { header.isPlaceholder
                    ? null
                    : <div
                        className={ cn(
                          'flex items-center justify-between w-full h-full px-6 py-3',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:bg-gray-200/50 dark:hover:bg-gray-600/50',
                        ) }
                        onClick={ header.column.getToggleSortingHandler() }
                        title={ header.column.getCanSort()
                          ? '点击排序'
                          : undefined }
                      >
                        { flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        ) }
                        { header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc'
                            ? <ArrowUp className="h-4 w-4" />
                            : header.column.getIsSorted() === 'desc'
                              ? <ArrowDown className="h-4 w-4" />
                              : <ArrowUpDown className="h-4 w-4 text-gray-400" />
                        ) }
                      </div>}
                </th>
              )) }
            </tr>
          )) }
        </thead>
        { enableVirtualization
          ? <VirtualizedBody table={ table } container={ container } />
          : <NormalBody table={ table } /> }
      </table>
    </div>
  )
})

Table.displayName = 'Table'
