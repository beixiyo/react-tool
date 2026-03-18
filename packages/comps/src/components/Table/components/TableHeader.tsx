import type { HeaderGroup, SortingState } from '@tanstack/react-table'
import type { TableInstance, TableProps } from '../types'
import { flexRender } from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
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
  /**
   * 当前排序状态，用于触发 memo 重新渲染
   */
  sorting?: SortingState
} & Pick<TableProps<TData>, 'defaultHeaderAlign' | 'rowSelectionColumnWidth' | 'rowNumberColumnWidth'>

function TableHeaderInner<TData extends object>(props: TableHeaderProps<TData>) {
  const {
    headerGroups,
    enableRowSelection = false,
    enableRowNumber = false,
    table,
    isAllRowsSelected = false,
    isSomeRowsSelected = false,
    sorting,
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
            /**
             * 从 sorting prop 中查找当前列排序方向，
             * 避免依赖 header.column.getIsSorted()（其返回值基于 table 实例的可变状态，
             * React Compiler 无法追踪，会错误缓存 map 回调结果）
             */
            const sortDirection = sorting?.find(s => s.id === header.column.id)?.desc === false
              ? 'asc' as const
              : sorting?.find(s => s.id === header.column.id)?.desc === true
                ? 'desc' as const
                : false as const

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
                        canSort
                          ? 'justify-between'
                          : flexAlignClassName,
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
                        canSort
                          ? 'flex-1 min-w-0'
                          : 'w-full',
                      ) }>
                        { flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        ) }
                      </span>
                      { canSort && (
                        <span className={ cn(
                          'shrink-0 ml-2 transition-colors',
                          sortDirection
                            ? 'text-brand'
                            : 'text-text3',
                        ) }>
                          { sortDirection === 'asc'
                            ? <ChevronUp className="h-4 w-4" />
                            : sortDirection === 'desc'
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronsUpDown className="h-4 w-4" /> }
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
