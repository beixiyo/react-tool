import type { Row, Table as TableInstance } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Checkbox } from '../../Checkbox'
import { EditableCell } from './EditableCell'

export type VirtualizedBodyProps<TData extends object> = {
  table: TableInstance<TData>
  container: HTMLDivElement | null
  enableRowSelection?: boolean
  enableEditing?: boolean
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

export function VirtualizedBody<TData extends object>({
  table,
  container,
  enableRowSelection = false,
  enableEditing = false,
  onEditStart,
  onEditCancel,
  onEditSave,
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
            className="flex bg-backgroundPrimary border-b border-border hover:bg-backgroundSecondary transition-all duration-300"
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
                        onEditStart={ onEditStart }
                        onEditCancel={ onEditCancel }
                        onEditSave={ onEditSave }
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
