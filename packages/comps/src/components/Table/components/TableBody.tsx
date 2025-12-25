import type { Row } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { memo } from 'react'
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
}

function TableBodyInner<TData extends object>(props: TableBodyProps<TData>) {
  const {
    rows,
    enableRowSelection = false,
    enableEditing = false,
    onSelectionChange,
  } = props

  return (
    <tbody>
      { rows.map(row => (
        <tr
          key={ row.id }
          className="flex w-full bg-backgroundPrimary border-b border-border hover:bg-backgroundSecondar"
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
                onChange={ (_checked, e) => {
                  const handler = row.getToggleSelectedHandler()
                  handler(e as unknown as React.ChangeEvent<HTMLInputElement>)
                  onSelectionChange()
                } }
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
                    />
                  )
                : (
                    <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
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
