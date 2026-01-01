import type { Cell, ColumnDef } from '@tanstack/react-table'
import { useCallback, useState } from 'react'

/**
 * 可编辑单元格的状态
 */
export type EditableCellState<TValue = unknown> = {
  /**
   * 是否正在编辑
   */
  isEditing: boolean
  /**
   * 编辑中的值
   */
  editingValue: TValue
  /**
   * 原始值
   */
  originalValue: TValue
}

/**
 * 可编辑单元格的 Hook
 */
export function useEditableCell<TData extends object, TValue = unknown>(
  cell: Cell<TData, TValue>,
  rowOriginal: TData,
  columnDef: ColumnDef<TData, TValue>,
) {
  const editConfig = columnDef.editConfig
  const isEditable = editConfig?.editable !== false
    && (typeof editConfig?.editable === 'function'
      ? editConfig.editable(rowOriginal)
      : editConfig?.editable ?? false)

  const [editingState, setEditingState] = useState<EditableCellState<TValue> | null>(null)

  const startEditing = useCallback(() => {
    if (!isEditable)
      return
    const currentValue = cell.getValue()
    setEditingState({
      isEditing: true,
      editingValue: currentValue,
      originalValue: currentValue,
    })
  }, [isEditable, cell])

  const saveEditing = useCallback(async (newValue: TValue) => {
    if (!editingState)
      return

    try {
      if (editConfig?.onCellEdit && rowOriginal) {
        await editConfig.onCellEdit(newValue, rowOriginal, cell.column.id)
      }
      setEditingState(null)
    }
    catch (error) {
      console.error('保存单元格编辑失败:', error)
      /** 保存失败时保持编辑状态 */
    }
  }, [editingState, editConfig, rowOriginal, cell])

  const cancelEditing = useCallback(() => {
    setEditingState(null)
  }, [])

  const updateEditingValue = useCallback((newValue: TValue) => {
    if (!editingState)
      return
    setEditingState(prev => prev
      ? { ...prev, editingValue: newValue }
      : null)
  }, [editingState])

  return {
    isEditable,
    isEditing: editingState?.isEditing ?? false,
    editingValue: editingState?.editingValue,
    originalValue: editingState?.originalValue,
    startEditing,
    saveEditing,
    cancelEditing,
    updateEditingValue,
  }
}
