import type { Row } from '@tanstack/react-table'
import type { ChangeEvent } from 'react'
import type { TableProps, TextAlign } from '../types'
import { memo } from 'react'
import { cn } from 'utils'
import { getFlexAlignClassName } from '../utils/alignUtils'
import { calculateRowNumber } from '../utils/rowNumberUtils'
import { RowNumberCell } from './RowNumberCell'
import { RowSelectionCell } from './RowSelectionCell'
import { TableCellRenderer } from './TableCellRenderer'

export type TableBodyProps<TData extends object> = {
  /**
   * 表格行数据
   */
  rows: Row<TData>[]
  /**
   * 是否启用行选择功能
   */
  enableRowSelection?: boolean
  /**
   * 是否启用自动行号功能
   */
  enableRowNumber?: boolean
  /**
   * 是否启用编辑功能
   */
  enableEditing?: boolean
  /**
   * 分页状态，用于计算行号
   */
  pagination?: { pageIndex: number, pageSize: number }
  /** Just rerender the table when the checkbox is changed */
  onCheckboxChange: () => void
} & Pick<
  TableProps<TData>,
  | 'onEditStart'
  | 'onEditCancel'
  | 'onEditSave'
  | 'getRowProps'
  | 'defaultCellAlign'
  | 'rowSelectionColumnWidth'
  | 'rowNumberColumnWidth'
>

function TableBodyInner<TData extends object>(props: TableBodyProps<TData>) {
  const {
    rows,
    enableRowSelection = false,
    enableRowNumber = false,
    enableEditing = false,
    pagination,
    onEditStart,
    onEditCancel,
    onEditSave,
    getRowProps,
    defaultCellAlign = 'left',
    rowSelectionColumnWidth = 48,
    rowNumberColumnWidth = 60,
    onCheckboxChange,
  } = props

  /** 处理行选择变化 */
  const handleRowSelectionChange = (rowId: string, _rowOriginal: TData, e: ChangeEvent<HTMLInputElement>) => {
    if (!enableRowSelection) {
      return
    }
    const row = rows.find(r => r.id === rowId)
    if (row) {
      const handler = row.getToggleSelectedHandler()
      handler(e)
    }
    onCheckboxChange()
  }

  return (
    <tbody>
      { rows.map((row, index) => {
        const rowProps = getRowProps
          ? getRowProps(row.original, index)
          : {}
        const { className: rowClassName, onClick: rowOnClick, ...restRowProps } = rowProps
        const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
          if (enableRowSelection) {
            row.toggleSelected()
            handleRowSelectionChange(row.id, row.original, e as unknown as ChangeEvent<HTMLInputElement>)
          }
          rowOnClick?.(e)
        }
        const rowNumber = calculateRowNumber(index, pagination)
        return (
          <tr
            key={ row.id }
            className={ cn(
              'flex w-full bg-backgroundPrimary border-b border-border hover:bg-backgroundSecondar hover:bg-background2 transition-all duration-300',
              enableRowSelection && 'cursor-pointer',
              rowClassName,
            ) }
            onClick={ handleClick }
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
                  style={ { width: cell.column.getSize() } }
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
    </tbody>
  )
}

export const TableBody = memo(TableBodyInner) as <TData extends object>(
  props: TableBodyProps<TData>,
) => React.ReactElement

TableBodyInner.displayName = 'TableBody'
