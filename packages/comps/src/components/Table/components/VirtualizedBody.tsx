import type { Row } from '@tanstack/react-table'
import type { EditCallbacks, GetRowProps, TableInstance } from '../types'
import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from 'utils'
import { Checkbox } from '../../Checkbox'
import { LoadingIcon } from '../../Loading/LoadingIcon'
import { EditableCell } from './EditableCell'
import { TableCellContent } from './TableCellContent'

export type VirtualizedBodyProps<TData extends object> = {
  table: TableInstance<TData>
  container: HTMLDivElement | null
  enableRowSelection?: boolean
  enableRowNumber?: boolean
  enableEditing?: boolean
  /**
   * 开始编辑时的事件回调
   */
  onEditStart?: EditCallbacks<TData>['onEditStart']
  /**
   * 取消编辑时的事件回调
   */
  onEditCancel?: EditCallbacks<TData>['onEditCancel']
  /**
   * 确认编辑时的事件回调
   */
  onEditSave?: EditCallbacks<TData>['onEditSave']
  /**
   * 是否正在加载
   */
  isLoading?: boolean
  /**
   * 是否显示加载指示器
   */
  showLoading?: boolean
  /**
   * 获取行属性的函数
   */
  getRowProps?: GetRowProps<TData>
}

export function VirtualizedBody<TData extends object>({
  table,
  container,
  enableRowSelection = false,
  enableRowNumber = false,
  enableEditing = false,
  onEditStart,
  onEditCancel,
  onEditSave,
  isLoading = false,
  showLoading = false,
  getRowProps,
}: VirtualizedBodyProps<TData>) {
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

  /** 计算总高度，如果正在加载则增加高度以容纳加载指示器 */
  const totalSize = rowVirtualizer.getTotalSize()
  const loadingHeight = isLoading && showLoading
    ? 60
    : 0

  return (
    <tbody
      style={ {
        display: 'grid',
        height: `${totalSize + loadingHeight}px`,
        position: 'relative',
      } }
    >
      { rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<TData>
        const rowProps = getRowProps
          ? getRowProps(row.original, virtualRow.index)
          : {}
        const { className: rowClassName, style: rowStyle, ...restRowProps } = rowProps
        return (
          <tr
            key={ row.id }
            data-index={ virtualRow.index }
            ref={ node => rowVirtualizer.measureElement(node) }
            className={ cn(
              'flex bg-backgroundPrimary border-b border-border hover:bg-backgroundSecondary transition-all duration-300',
              rowClassName,
            ) }
            style={ {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
              ...rowStyle,
            } }
            { ...restRowProps }
          >
            { enableRowSelection && (
              <td
                className="px-2 py-4 flex items-center justify-center"
                style={ { width: '48px' } }
              >
                <Checkbox
                  checked={ row.getIsSelected() }
                  onChange={ () => row.toggleSelected() }
                  size={ 18 }
                />
              </td>
            ) }
            { enableRowNumber && (
              <td
                className="px-2 py-4 flex items-center justify-center text-textSecondary"
                style={ { width: '60px' } }
              >
                <span className="text-sm">{ virtualRow.index + 1 }</span>
              </td>
            ) }
            { row.getVisibleCells().map(cell => (
              <td
                key={ cell.id }
                className="px-6 py-4 flex items-center overflow-hidden min-w-0"
                style={ {
                  width: cell.column.getSize(),
                } }
              >
                { enableEditing
                  ? (
                      <EditableCell
                        cell={ cell }
                        row={ row }
                        columnDef={ cell.column.columnDef }
                        enableEditing={ enableEditing }
                        onEditStart={ onEditStart }
                        onEditCancel={ onEditCancel }
                        onEditSave={ onEditSave }
                      />
                    )
                  : (
                      <TableCellContent>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCellContent>
                    ) }
              </td>
            )) }
          </tr>
        )
      }) }
      { isLoading && showLoading && (
        <tr
          className="flex items-center justify-center py-4"
          style={ {
            position: 'absolute',
            top: `${rowVirtualizer.getTotalSize()}px`,
            left: 0,
            width: '100%',
          } }
        >
          <td
            colSpan={ (enableRowSelection
              ? 1
              : 0) + (enableRowNumber
              ? 1
              : 0) + (table.getHeaderGroups()[0]?.headers.length || 1) }
            className="w-full flex items-center justify-center"
          >
            <LoadingIcon size={ 30 } />
          </td>
        </tr>
      ) }
    </tbody>
  )
}
