import type { Row } from '@tanstack/react-table'
import type { ChangeEvent } from 'react'
import { flexRender } from '@tanstack/react-table'
import { memo } from 'react'
import { cn } from 'utils'
import { Checkbox } from '../../Checkbox'
import { EditableCell } from './EditableCell'

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
   * 是否启用编辑功能
   */
  enableEditing?: boolean
  onSelectionChange: () => void
  /**
   * 开始编辑时的事件回调
   */
  onEditStart?: (params: { row: TData, columnId: string, value: unknown }) => void
  /**
   * 取消编辑时的事件回调
   */
  onEditCancel?: (params: { row: TData, columnId: string, originalValue: unknown }) => void
  /**
   * 确认编辑时的事件回调
   */
  onEditSave?: (params: { row: TData, columnId: string, newValue: unknown, originalValue: unknown }) => void
}

function TableBodyInner<TData extends object>(props: TableBodyProps<TData>) {
  const {
    rows,
    enableRowSelection = false,
    enableEditing = false,
    onSelectionChange,
    onEditStart,
    onEditCancel,
    onEditSave,
  } = props

  const onCheckboxChange = (row: Row<TData>, e: ChangeEvent<HTMLInputElement>) => {
    if (!enableRowSelection)
      return

    const handler = row.getToggleSelectedHandler()
    handler(e)
    onSelectionChange()
  }

  return (
    <tbody>
      { rows.map(row => (
        <tr
          key={ row.id }
          className={ cn(
            'flex w-full bg-backgroundPrimary border-b border-border hover:bg-backgroundSecondar hover:bg-backgroundSecondary transition-all duration-300',
            enableRowSelection && 'cursor-pointer',
          ) }
          onClick={ e => onCheckboxChange(row, e as any) }
        >
          { enableRowSelection && (
            <td
              className="px-2 py-4 flex items-center justify-center"
              style={ { width: '48px' } }
            >
              <Checkbox
                checked={ row.getIsSelected() }
                indeterminate={ row.getIsSomeSelected() }
                disabled={ !row.getCanSelect() }
                onChange={ (_checked, e) => onCheckboxChange(row, e) }
                size={ 18 }
              />
            </td>
          ) }
          { row.getVisibleCells().map(cell => (
            <td
              key={ cell.id }
              className="px-6 py-4 flex items-center"
              style={ { width: cell.column.getSize() } }
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
                    <>{ flexRender(cell.column.columnDef.cell, cell.getContext()) }</>
                  ) }
            </td>
          )) }
        </tr>
      )) }
    </tbody>
  )
}

export const TableBody = memo(TableBodyInner) as <TData extends object>(
  props: TableBodyProps<TData>,
) => React.ReactElement

TableBodyInner.displayName = 'TableBody'
