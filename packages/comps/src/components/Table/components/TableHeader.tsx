import type { Table as TableInstance } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

interface TableHeaderProps<TData extends object> {
  table: TableInstance<TData>
}

export const TableHeader = memo(<TData extends object>({ table }: TableHeaderProps<TData>) => {
  return (
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
  )
})

TableHeader.displayName = 'TableHeader'
