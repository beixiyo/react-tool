import type { Row, Table as TableInstance } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Checkbox } from '../../Checkbox'
import { EditableCell } from './EditableCell'

export function VirtualizedBody<TData extends object>({ table, container, enableRowSelection = false, enableEditing = false }: { table: TableInstance<TData>, container: HTMLDivElement | null, enableRowSelection?: boolean, enableEditing?: boolean }) {
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
            { row.getVisibleCells().map(cell => (
              <td
                key={ cell.id }
                className="px-6 py-4 flex items-center"
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
                      />
                    )
                  : (
                      <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
                    ) }
              </td>
            )) }
          </tr>
        )
      }) }
    </tbody>
  )
}
