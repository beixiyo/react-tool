import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, TableOptions, useReactTable, OnChangeFn, Updater } from '@tanstack/react-table'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import type { TableProps } from './types'
import { NormalBody, VirtualizedBody } from './render'


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

  const [internalGlobalFilter, setInternalGlobalFilter] = useState('')
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 30,
  })
  const pagination = controlledPagination ?? internalPagination

  /** 创建 OnChangeFn 包装器 */
  const setSorting: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting = typeof updaterOrValue === 'function'
      ? updaterOrValue(sorting)
      : updaterOrValue
    setControlledSorting?.(newSorting) ?? setInternalSorting(newSorting)
  }

  const setGlobalFilter: OnChangeFn<string> = (updaterOrValue) => {
    const newFilter = typeof updaterOrValue === 'function'
      ? updaterOrValue(globalFilter)
      : updaterOrValue
    setControlledGlobalFilter?.(newFilter) ?? setInternalGlobalFilter(newFilter)
  }

  const setPagination: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const newPagination = typeof updaterOrValue === 'function'
      ? updaterOrValue(pagination)
      : updaterOrValue
    setControlledPagination?.(newPagination) ?? setInternalPagination(newPagination)
  }

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
                    </div> }
                </th>
              )) }
            </tr>
          )) }
        </thead>
        {
          enableVirtualization
            ? <VirtualizedBody table={ table } container={ container } />
            : <NormalBody table={ table } />
        }
      </table>
    </div>
  )
})

Table.displayName = 'Table'

