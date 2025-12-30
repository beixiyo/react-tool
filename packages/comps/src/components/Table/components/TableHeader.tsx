import type { HeaderGroup } from '@tanstack/react-table'
import type { TableInstance } from '../types'
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
   * 是否启用自动行号功能
   */
  enableRowNumber?: boolean
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
    enableRowNumber = false,
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
          { enableRowNumber && (
            <th
              scope="col"
              style={ { width: '60px' } }
            >
              <div className="flex items-center justify-center w-full h-full px-2 py-3">
                <span className="text-xs text-textSecondary uppercase">序号</span>
              </div>
            </th>
          ) }
          { headerGroup.headers.map(header => (
            <th
              key={ header.id }
              scope="col"
              className="overflow-hidden min-w-0"
              style={ {
                width: header.getSize(),
              } }
            >
              { header.isPlaceholder
                ? null
                : <div
                    className={ cn(
                      'flex items-center justify-between w-full h-full px-6 py-3 overflow-hidden',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:bg-backgroundSecondary/50',
                    ) }
                    onClick={ header.column.getToggleSortingHandler() }
                    title={ header.column.getCanSort()
                      ? '点击排序'
                      : undefined }
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                      { flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      ) }
                    </span>
                    { header.column.getCanSort() && (
                      <span className="flex-shrink-0 ml-2">
                        { header.column.getIsSorted() === 'asc'
                          ? <ArrowUp className="h-4 w-4" />
                          : header.column.getIsSorted() === 'desc'
                            ? <ArrowDown className="h-4 w-4" />
                            : <ArrowUpDown className="h-4 w-4 text-gray-400" /> }
                      </span>
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
