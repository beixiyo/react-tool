import type { Cell, Row } from '@tanstack/react-table'
import type { ExtendedColumnDef } from '../types'
import { flexRender } from '@tanstack/react-table'
import { memo, useRef, useEffect } from 'react'
import { Input } from '../../Input/Input'
import { useEditableCell } from '../hooks/useEditableCell'
import { cn } from 'utils'

export type EditableCellProps<TData extends object, TValue = unknown> = {
  cell: Cell<TData, TValue>
  row: Row<TData>
  columnDef: ExtendedColumnDef<TData, TValue>
  enableEditing?: boolean
}

function EditableCellInner<TData extends object, TValue = unknown>(
  props: EditableCellProps<TData, TValue>,
) {
  const { cell, row, columnDef, enableEditing = false } = props

  const {
    isEditable,
    isEditing,
    editingValue,
    startEditing,
    saveEditing,
    cancelEditing,
    updateEditingValue,
  } = useEditableCell(cell, row, columnDef)

  const inputRef = useRef<HTMLInputElement>(null)

  // 进入编辑模式时自动聚焦
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // 如果不启用编辑功能或不可编辑，直接渲染普通单元格
  if (!enableEditing || !isEditable) {
    return <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
  }

  // 如果正在编辑，渲染编辑组件
  if (isEditing) {
    const editConfig = columnDef.editConfig

    // 如果提供了自定义编辑组件，使用自定义组件
    if (editConfig?.editComponent) {
      return (
        <>
          {editConfig.editComponent({
            value: editingValue as TValue,
            row: row.original,
            onSave: saveEditing,
            onCancel: cancelEditing,
          })}
        </>
      )
    }

    // 默认使用 Input 组件
    return (
      <div className="w-full">
        <Input
          ref={inputRef}
          value={editingValue !== undefined && editingValue !== null ? String(editingValue) : ''}
          onChange={(value) => {
            // 尝试保持原始类型
            let newValue: TValue
            if (typeof editingValue === 'number') {
              newValue = (Number.parseFloat(value) || 0) as TValue
            }
            else {
              newValue = value as TValue
            }
            updateEditingValue(newValue)
          }}
          onPressEnter={() => {
            if (editingValue !== undefined) {
              saveEditing(editingValue)
            }
          }}
          onBlur={() => {
            // 延迟取消，以便点击保存按钮时能触发
            setTimeout(() => {
              if (editingValue !== undefined) {
                saveEditing(editingValue)
              }
            }, 200)
          }}
          size="sm"
          className="h-8"
        />
      </div>
    )
  }

  // 非编辑状态，显示可点击的单元格
  return (
    <div
      className={cn(
        'w-full cursor-pointer hover:bg-backgroundSecondary/50 rounded px-2 py-1 transition-colors',
      )}
      onClick={startEditing}
      onDoubleClick={startEditing}
      title="单击或双击开始编辑"
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  )
}

export const EditableCell = memo(EditableCellInner) as <TData extends object, TValue = unknown>(
  props: EditableCellProps<TData, TValue>,
) => React.ReactElement

EditableCellInner.displayName = 'EditableCell'

