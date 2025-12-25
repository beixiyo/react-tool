import type { TableProps } from './types'

import { flexRender } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { useTableInstance } from './hooks/useTableInstance'
import { useTableState } from './hooks/useTableState'
import { NormalBody, VirtualizedBody } from './render'

function InnerTable<TData extends object>(props: TableProps<TData>) {
  const {
    style,
    className,
    data,
    columns,
    enableVirtualization = false,
  } = props

  /** 使用统一的 Hook 管理表格状态 */
  const {
    sorting,
    globalFilter,
    pagination,
    setSorting,
    setGlobalFilter,
    setPagination,
  } = useTableState(props)

  /** 创建 table 实例 */
  const table = useTableInstance(
    data,
    columns,
    {
      sorting,
      globalFilter,
      ...(enableVirtualization
        ? {}
        : { pagination }),
    },
    enableVirtualization,
  )

  /** 设置回调函数 */
  table.options.onSortingChange = setSorting
  table.options.onGlobalFilterChange = setGlobalFilter
  if (!enableVirtualization) {
    table.options.onPaginationChange = setPagination
  }

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
      <table className="text-sm text-left text-textPrimary min-w-full" style={ { display: 'grid' } }>
        <thead className="text-xs text-textSecondary uppercase bg-backgroundSecondary dark:bg-backgroundSecondary dark:text-textSecondary" style={ { display: 'grid', position: 'sticky', top: 0, zIndex: 1 } }>
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
                          header.column.getCanSort() && 'cursor-pointer select-none hover:bg-backgroundSecondary/50',
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
}

InnerTable.displayName = 'InnerTable'

export const Table = memo(InnerTable) as typeof InnerTable
