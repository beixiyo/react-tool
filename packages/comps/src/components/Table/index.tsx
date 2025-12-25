import type { TableProps } from './types'
import type { Table as TableInstance } from '@tanstack/react-table'

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { forwardRef, memo, useImperativeHandle, useState } from 'react'
import { cn } from 'utils'
import { useTableState } from './hooks/useTableState'
import { TableBody } from './components/TableBody'
import { TableHeader } from './components/TableHeader'
import { VirtualizedBody } from './components/VirtualizedBody'

function InnerTable<TData extends object>(props: TableProps<TData>, ref: React.Ref<TableInstance<TData> | null>) {
  const {
    style,
    className,
    data,
    columns,
    enableVirtualization = false,
  } = props

  const {
    sorting,
    globalFilter,
    pagination,
    setSorting,
    setGlobalFilter,
    setPagination,
  } = useTableState(props)

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      ...(!enableVirtualization && { pagination }),
    },

    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    ...(enableVirtualization ? {} : { onPaginationChange: setPagination }),
    ...(enableVirtualization ? {} : { getPaginationRowModel: getPaginationRowModel() }),

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  useImperativeHandle(ref, () => table, [table])

  /** 用于虚拟滚动的容器引用 */
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  return (
    <div
      ref={ setContainer }
      className={ cn(
        'overflow-auto relative shadow-md sm:rounded-lg',
        enableVirtualization && 'h-[400px]', // 仅在虚拟滚动时设置固定高度
        className,
      ) }
      style={ style }
    >
      <table className="text-sm text-left text-textPrimary min-w-full" style={ { display: 'grid' } }>
        <TableHeader headerGroups={ table.getHeaderGroups() } />

        {
          enableVirtualization
            ? <VirtualizedBody table={ table } container={ container } />
            : <TableBody rows={ table.getRowModel().rows } />
        }
      </table>
    </div>
  )
}

export const Table = memo(forwardRef(InnerTable)) as <TData extends object>(
  props: TableProps<TData> & React.RefAttributes<TableInstance<TData> | null>
) => React.ReactElement | null

InnerTable.displayName = 'Table'
