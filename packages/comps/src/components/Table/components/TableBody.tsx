import type { Row } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { memo } from 'react'
import { Checkbox } from '../../Checkbox'

export type TableBodyProps<TData extends object> = {
  /**
   * 表格行数据
   */
  rows: Row<TData>[]
  /**
   * 是否启用行选择功能
   */
  enableRowSelection?: boolean
  onSelectionChange: () => void
}

function TableBodyInner<TData extends object>(props: TableBodyProps<TData>) {
  const {
    rows,
    enableRowSelection = false,
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
              { flexRender(cell.column.columnDef.cell, cell.getContext()) }
            </td>
          )) }
        </tr>
      )) }
    </tbody>
  )
}

export const TableBody = memo(TableBodyInner) as <TData extends object>(
  props: TableBodyProps<TData>
) => React.ReactElement

TableBodyInner.displayName = 'TableBody'

