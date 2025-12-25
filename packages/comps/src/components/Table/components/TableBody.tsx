import type { Row } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { memo } from 'react'

export type TableBodyProps<TData extends object> = {
  /**
   * 表格行数据
   */
  rows: Row<TData>[]
}

function TableBodyInner<TData extends object>(props: TableBodyProps<TData>) {
  const { rows } = props

  return (
    <tbody>
      { rows.map(row => (
        <tr
          key={ row.id }
          className="flex w-full bg-backgroundPrimary border-b border-border hover:bg-backgroundSecondary dark:bg-backgroundPrimary dark:border-border dark:hover:bg-backgroundSecondary"
        >
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

