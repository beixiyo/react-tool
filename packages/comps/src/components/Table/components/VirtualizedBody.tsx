import type { Row, Table as TableInstance } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedBody<TData extends object>({ table, container }: { table: TableInstance<TData>, container: HTMLDivElement | null }) {
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

  return (
    <tbody
      style={ {
        display: 'grid',
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative',
      } }
    >
      { rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<TData>
        return (
          <tr
            key={ row.id }
            data-index={ virtualRow.index }
            ref={ node => rowVirtualizer.measureElement(node) }
            className="flex"
            style={ {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            } }
          >
            { row.getVisibleCells().map(cell => (
              <td
                key={ cell.id }
                className="px-6 py-4 flex items-center"
                style={ {
                  width: cell.column.getSize(),
                } }
              >
                { flexRender(cell.column.columnDef.cell, cell.getContext()) }
              </td>
            )) }
          </tr>
        )
      }) }
    </tbody>
  )
}
