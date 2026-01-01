import type { ChangeEvent } from 'react'
import type { TableProps } from '../types'
import { Checkbox } from '../../Checkbox'

export type RowSelectionCellProps<TData extends object> = {
  /** 行 ID */
  rowId: string
  /** 行原始数据 */
  rowOriginal: TData
  enableRowSelection: boolean
  onSelectionChange: (rowId: string, rowOriginal: TData, e: ChangeEvent<HTMLInputElement>) => void
  /** 行是否被选中，提取为独立 prop 以便 React Compiler 追踪变化 */
  isSelected: boolean
  /** 行是否部分选中（用于树形结构），提取为独立 prop 以便 React Compiler 追踪变化 */
  isSomeSelected: boolean
  /** 行是否可选择，提取为独立 prop 以便 React Compiler 追踪变化 */
  canSelect: boolean
} & Pick<TableProps<TData>, 'rowSelectionColumnWidth'>

export function RowSelectionCell<TData extends object>({
  rowId,
  rowOriginal,
  enableRowSelection,
  onSelectionChange,
  isSelected,
  isSomeSelected,
  canSelect,
  rowSelectionColumnWidth = 48,
}: RowSelectionCellProps<TData>) {
  if (!enableRowSelection) {
    return null
  }

  const handleChange = (_checked: boolean, e: ChangeEvent<HTMLInputElement>) => {
    onSelectionChange(rowId, rowOriginal, e)
  }

  return (
    <td
      className="px-2 py-4 flex items-center justify-center"
      style={ { width: `${rowSelectionColumnWidth}px` } }
    >
      <Checkbox
        checked={ isSelected }
        indeterminate={ isSomeSelected }
        disabled={ !canSelect }
        onChange={ handleChange }
        size={ 18 }
      />
    </td>
  )
}

RowSelectionCell.displayName = 'RowSelectionCell'
