import type { Row } from '@tanstack/react-table'
import type { TableInstance, TableProps, TextAlign } from '../types'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from 'utils'
import { LoadingIcon } from '../../Loading/LoadingIcon'
import { getFlexAlignClassName } from '../utils/alignUtils'
import { calculateRowNumber } from '../utils/rowNumberUtils'
import { RowNumberCell } from './RowNumberCell'
import { RowSelectionCell } from './RowSelectionCell'
import { TableCellRenderer } from './TableCellRenderer'

export type VirtualizedBodyProps<TData extends object> = {
  table: TableInstance<TData>
  container: HTMLDivElement | null
  enableRowSelection?: boolean
  enableRowNumber?: boolean
  enableEditing?: boolean
  /**
   * 是否正在加载
   */
  isLoading?: boolean
  /**
   * 是否显示加载指示器
   */
  showLoading?: boolean
} & Pick<
  TableProps<TData>,
  | 'onEditStart'
  | 'onEditCancel'
  | 'onEditSave'
  | 'getRowProps'
  | 'defaultCellAlign'
  | 'rowSelectionColumnWidth'
  | 'rowNumberColumnWidth'
  | 'virtualRowEstimateSize'
  | 'virtualOverscan'
  | 'virtualLoadingHeight'
>

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
  defaultCellAlign = 'left',
  rowSelectionColumnWidth = 48,
  rowNumberColumnWidth = 60,
  virtualRowEstimateSize = 52,
  virtualOverscan = 5,
  virtualLoadingHeight = 60,
}: VirtualizedBodyProps<TData>) {
  const { rows } = table.getRowModel()

  /** 处理行选择变化 */
  const handleRowSelectionChange = (rowId: string, _rowOriginal: TData, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!enableRowSelection) {
      return
    }
    const row = rows.find(r => r.id === rowId)
    if (row) {
      const handler = row.getToggleSelectedHandler()
      handler(e)
    }
  }

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => container,
    estimateSize: () => virtualRowEstimateSize,
    overscan: virtualOverscan,
    measureElement:
      typeof window !== 'undefined' && !navigator.userAgent.includes('Firefox')
        ? element => element?.getBoundingClientRect().height
        : undefined,
  })

  /** 计算总高度，如果正在加载则增加高度以容纳加载指示器 */
  const totalSize = rowVirtualizer.getTotalSize()
  const loadingHeight = isLoading && showLoading
    ? virtualLoadingHeight
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
        const rowNumber = calculateRowNumber(virtualRow.index)
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
            <RowSelectionCell
              rowId={ row.id }
              rowOriginal={ row.original }
              enableRowSelection={ enableRowSelection }
              onSelectionChange={ handleRowSelectionChange }
              isSelected={ row.getIsSelected() }
              isSomeSelected={ row.getIsSomeSelected() }
              canSelect={ row.getCanSelect() }
              rowSelectionColumnWidth={ rowSelectionColumnWidth }
            />
            <RowNumberCell
              enableRowNumber={ enableRowNumber }
              rowNumber={ rowNumber }
              rowNumberColumnWidth={ rowNumberColumnWidth }
            />
            { row.getVisibleCells().map((cell) => {
              const columnDef = cell.column.columnDef
              const cellAlign = (columnDef as { cellAlign?: TextAlign }).cellAlign ?? defaultCellAlign
              const alignClassName = getFlexAlignClassName(cellAlign)

              return (
                <td
                  key={ cell.id }
                  className={ cn(
                    'px-6 py-4 flex items-center overflow-hidden min-w-0',
                    alignClassName,
                  ) }
                  style={ {
                    width: cell.column.getSize(),
                  } }
                >
                  <TableCellRenderer
                    cell={ cell }
                    rowOriginal={ row.original }
                    enableEditing={ enableEditing }
                    onEditStart={ onEditStart }
                    onEditCancel={ onEditCancel }
                    onEditSave={ onEditSave }
                  />
                </td>
              )
            }) }
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
