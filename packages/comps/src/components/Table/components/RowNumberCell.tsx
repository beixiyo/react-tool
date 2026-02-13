import type { TableProps } from '../types'

export type RowNumberCellProps = {
  enableRowNumber: boolean
  rowNumber: number
} & Pick<TableProps<unknown>, 'rowNumberColumnWidth'>

export function RowNumberCell({ enableRowNumber, rowNumber, rowNumberColumnWidth = 60 }: RowNumberCellProps) {
  if (!enableRowNumber) {
    return null
  }

  return (
    <td
      className="px-2 py-4 flex items-center justify-center text-text2"
      style={ { width: `${rowNumberColumnWidth}px` } }
    >
      <span className="text-sm">{rowNumber}</span>
    </td>
  )
}
