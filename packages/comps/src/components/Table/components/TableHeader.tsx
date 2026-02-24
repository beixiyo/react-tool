import type { HeaderGroup } from '@tanstack/react-table'
import type { TableInstance, TableProps } from '../types'
import { flexRender } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Checkbox } from '../../Checkbox'
import { getFlexAlignClassName, getTextAlignClassName } from '../utils/alignUtils'

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
  /**
   * 是否全选，提取为独立 prop 以便 React Compiler 追踪变化
   */
  isAllRowsSelected?: boolean
  /**
   * 是否部分选中，提取为独立 prop 以便 React Compiler 追踪变化
   */
  isSomeRowsSelected?: boolean
} & Pick<TableProps<TData>, 'defaultHeaderAlign' | 'rowSelectionColumnWidth' | 'rowNumberColumnWidth'>

function TableHeaderInner<TData extends object>(props: TableHeaderProps<TData>) {
  const {
    headerGroups,
    enableRowSelection = false,
    enableRowNumber = false,
    table,
    isAllRowsSelected = false,
    isSomeRowsSelected = false,
    defaultHeaderAlign = 'left',
    rowSelectionColumnWidth = 48,
    rowNumberColumnWidth = 60,
  } = props

  /** 处理全选变化 */
  const handleToggleAllRowsSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (table) {
      const handler = table.getToggleAllRowsSelectedHandler()
      handler(e as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <thead
      className="text-xs bg-background"
      style={ { display: 'grid', position: 'sticky', top: 0, zIndex: 1 } }
    >
      { headerGroups.map(headerGroup => (
        <tr key={ headerGroup.id } className="flex w-full">
          { enableRowSelection && table && (
            <th
              scope="col"
              style={ { width: `${rowSelectionColumnWidth}px` } }
            >
              <div className="flex items-center justify-center w-full h-full px-2 py-3">
                <Checkbox
                  checked={ isAllRowsSelected }
                  indeterminate={ isSomeRowsSelected }
                  onChange={ (_checked, e) => handleToggleAllRowsSelected(e) }
                  size={ 18 }
                />
              </div>
            </th>
          ) }
          { enableRowNumber && (
            <th
              scope="col"
              style={ { width: `${rowNumberColumnWidth}px` } }
            >
              <div className="flex items-center justify-center w-full h-full px-2 py-3">
                <span className="text-xs text-text2 uppercase">序号</span>
              </div>
            </th>
          ) }
          { headerGroup.headers.map((header) => {
            const columnDef = header.column.columnDef
            const headerAlign = columnDef.headerAlign ?? defaultHeaderAlign
            const textAlignClassName = getTextAlignClassName(headerAlign)
            const flexAlignClassName = getFlexAlignClassName(headerAlign)
            const canSort = header.column.getCanSort()

            return (
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
                        'flex items-center w-full h-full px-6 py-3 overflow-hidden',
                        canSort ? 'justify-between' : flexAlignClassName,
                        canSort && 'cursor-pointer select-none hover:bg-background2/50',
                      ) }
                      onClick={ header.column.getToggleSortingHandler() }
                      title={ canSort
                        ? '点击排序'
                        : undefined }
                    >
                      <span className={ cn(
                        'overflow-hidden text-ellipsis whitespace-nowrap',
                        textAlignClassName,
                        canSort ? 'flex-1 min-w-0' : 'w-full',
                      ) }>
                        { flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        ) }
                      </span>
                      { canSort && (
                        <span className="shrink-0 ml-2">
                          { header.column.getIsSorted() === 'asc'
                            ? <ArrowUp className="h-4 w-4" />
                            : header.column.getIsSorted() === 'desc'
                              ? <ArrowDown className="h-4 w-4" />
                              : <ArrowUpDown className="h-4 w-4 text-gray-400" /> }
                        </span>
                      ) }
                    </div> }
              </th>
            )
          }) }
        </tr>
      )) }
    </thead>
  )
}

export const TableHeader = memo(TableHeaderInner) as <TData extends object>(
  props: TableHeaderProps<TData>,
) => React.ReactElement

TableHeaderInner.displayName = 'TableHeader'
