import type { HeaderGroup } from '@tanstack/react-table'
import type { TableInstance, TextAlign } from '../types'
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
  /**
   * 默认表头对齐方式
   */
  defaultHeaderAlign?: TextAlign
}

/**
 * 获取对齐方式的 Tailwind 类名（用于文本对齐）
 */
function getTextAlignClassName(align?: TextAlign): string {
  switch (align) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    case 'left':
    default:
      return 'text-left'
  }
}

/**
 * 获取对齐方式的 Tailwind 类名（用于 flex 对齐）
 */
function getFlexAlignClassName(align?: TextAlign): string {
  switch (align) {
    case 'center':
      return 'justify-center'
    case 'right':
      return 'justify-end'
    case 'left':
    default:
      return 'justify-start'
  }
}

function TableHeaderInner<TData extends object>(props: TableHeaderProps<TData>) {
  const {
    headerGroups,
    enableRowSelection = false,
    enableRowNumber = false,
    table,
    onSelectionChange,
    defaultHeaderAlign = 'left',
  } = props

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
          { headerGroup.headers.map((header) => {
            const columnDef = header.column.columnDef as any
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
                        canSort && 'cursor-pointer select-none hover:bg-backgroundSecondary/50',
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
