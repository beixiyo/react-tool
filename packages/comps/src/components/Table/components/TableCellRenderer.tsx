import type { Cell } from '@tanstack/react-table'
import type { EditCallbacks } from '../types'
import { flexRender } from '@tanstack/react-table'
import { memo } from 'react'
import { Tooltip } from '../../Tooltip'
import { EditableCell } from './EditableCell'
import { TableCellContent } from './TableCellContent'

export type TableCellRendererProps<TData extends object, TValue = unknown> = {
  cell: Cell<TData, TValue>
  /** 行原始数据 */
  rowOriginal: TData
  enableEditing: boolean
  onEditStart?: EditCallbacks<TData>['onEditStart']
  onEditCancel?: EditCallbacks<TData>['onEditCancel']
  onEditSave?: EditCallbacks<TData>['onEditSave']
}

function TableCellRendererInner<TData extends object, TValue = unknown>({
  cell,
  rowOriginal,
  enableEditing,
  onEditStart,
  onEditCancel,
  onEditSave,
}: TableCellRendererProps<TData, TValue>) {
  if (enableEditing) {
    return (
      <EditableCell
        cell={ cell }
        rowOriginal={ rowOriginal }
        columnDef={ cell.column.columnDef }
        enableEditing={ enableEditing }
        onEditStart={ onEditStart }
        onEditCancel={ onEditCancel }
        onEditSave={ onEditSave }
      />
    )
  }

  const cellTooltip = cell.column.columnDef.cellTooltip
  const rendered = flexRender(cell.column.columnDef.cell, cell.getContext())

  if (cellTooltip) {
    const tooltipContent = cellTooltip({ row: rowOriginal })
    return (
      <Tooltip content={ tooltipContent } placement="top">
        { rendered }
      </Tooltip>
    )
  }

  return (
    <TableCellContent>
      { rendered }
    </TableCellContent>
  )
}

export const TableCellRenderer = memo(TableCellRendererInner) as <TData extends object, TValue = unknown>(
  props: TableCellRendererProps<TData, TValue>,
) => React.ReactElement

TableCellRendererInner.displayName = 'TableCellRenderer'
