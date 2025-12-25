import type { HeaderGroup, Table as TableInstance } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Checkbox } from '../../Checkbox'

export type TableHeaderProps<TData extends object> = {
  /**
   * 表格实例，用于获取表头组
   */
  headerGroups: HeaderGroup<TData>[]
  /**
   * 是否启用行选择功能
   */
  enableRowSelection?: boolean
  /**
   * 表格实例，用于全选功能
   */
  table?: TableInstance<TData>
  onSelectionChange: () => void
}

function TableHeaderInner<TData extends object>(props: TableHeaderProps<TData>) {
  const {
    headerGroups,
    enableRowSelection = false,
    table,
    onSelectionChange,
  } = props

  return (
    <thead
      className="text-xs text-textSecondary uppercase bg-backgroundSecondary dark:bg-backgroundSecondary dark:text-textSecondary"
      style={ { display: 'grid', position: 'sticky', top: 0, zIndex: 1 } }
    >
      { headerGroups.map(headerGroup => (
        <tr key={ headerGroup.id } className="flex w-full">
          { enableRowSelection && table && (
            <th
              scope="col"
              style={ { width: '48px' } }
            >
              <div className="flex items-center justify-center w-full h-full px-2 py-3">
                <Checkbox
                  checked={ table.getIsAllRowsSelected() }
                  indeterminate={ table.getIsSomeRowsSelected() }
                  onChange={ (_checked, e) => {
                    const handler = table.getToggleAllRowsSelectedHandler()
                    handler(e as unknown as React.ChangeEvent<HTMLInputElement>)
                    onSelectionChange()
                  } }
                  size={ 18 }
                />
              </div>
            </th>
          ) }
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
  )
}

export const TableHeader = memo(TableHeaderInner) as <TData extends object>(
  props: TableHeaderProps<TData>,
) => React.ReactElement

TableHeaderInner.displayName = 'TableHeader'
