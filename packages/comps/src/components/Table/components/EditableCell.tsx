import type { Cell, Row } from '@tanstack/react-table'
import type { ExtendedColumnDef } from '../types'
import { flexRender } from '@tanstack/react-table'
import { memo, useRef, useEffect, useCallback } from 'react'
import { Input } from '../../Input/Input'
import { NumberInput } from '../../Input/NumberInput'
import { Popover } from '../../Popover'
import type { PopoverRef } from '../../Popover'
import { Button } from '../../Button'
import { useEditableCell } from '../hooks/useEditableCell'
import { cn } from 'utils'

export type EditableCellProps<TData extends object, TValue = unknown> = {
  cell: Cell<TData, TValue>
  row: Row<TData>
  columnDef: ExtendedColumnDef<TData, TValue>
  enableEditing?: boolean
  /**
   * 开始编辑时的事件回调
   */
  onEditStart?: (params: { row: TData; columnId: string; value: unknown }) => void
  /**
   * 取消编辑时的事件回调
   */
  onEditCancel?: (params: { row: TData; columnId: string; originalValue: unknown }) => void
  /**
   * 确认编辑时的事件回调
   */
  onEditSave?: (params: { row: TData; columnId: string; newValue: unknown; originalValue: unknown }) => void
}

function EditableCellInner<TData extends object, TValue = unknown>(
  props: EditableCellProps<TData, TValue>,
) {
  const { cell, row, columnDef, enableEditing = false, onEditStart, onEditCancel, onEditSave } = props

  const {
    isEditable,
    isEditing,
    editingValue,
    originalValue,
    startEditing: originalStartEditing,
    saveEditing: originalSaveEditing,
    cancelEditing: originalCancelEditing,
    updateEditingValue,
  } = useEditableCell(cell, row, columnDef)

  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<PopoverRef>(null)
  // 用于跟踪保存操作的信息
  const pendingSaveRef = useRef<{ newValue: TValue; originalValue: TValue } | null>(null)
  const prevIsEditingRef = useRef(false)

  // 包装开始编辑函数，触发事件
  const startEditing = useCallback(() => {
    const currentValue = cell.getValue()
    originalStartEditing()
    onEditStart?.({
      row: row.original,
      columnId: cell.column.id,
      value: currentValue,
    })
  }, [cell, row, originalStartEditing, onEditStart])

  // 包装保存编辑函数，触发事件
  const saveEditing = useCallback(async (newValue: TValue) => {
    if (!originalValue) return
    const originalVal = originalValue
    // 保存待触发的保存事件信息
    pendingSaveRef.current = {
      newValue,
      originalValue: originalVal,
    }
    // 调用原始的保存函数
    await originalSaveEditing(newValue)
    // 如果保存成功，originalSaveEditing 会清除编辑状态，触发 useEffect
  }, [originalValue, originalSaveEditing])

  // 包装取消编辑函数，触发事件
  const cancelEditing = useCallback(() => {
    if (!originalValue) return
    const originalVal = originalValue
    // 清除待触发的保存事件信息
    pendingSaveRef.current = null
    originalCancelEditing()
    onEditCancel?.({
      row: row.original,
      columnId: cell.column.id,
      originalValue: originalVal,
    })
  }, [originalValue, row, cell, originalCancelEditing, onEditCancel])

  // 监听编辑状态变化，触发保存事件
  useEffect(() => {
    const wasEditing = prevIsEditingRef.current
    const isCurrentlyEditing = isEditing

    // 如果从编辑状态变为非编辑状态，且有待触发的保存事件，说明保存成功
    if (wasEditing && !isCurrentlyEditing && pendingSaveRef.current) {
      const { newValue, originalValue: originalVal } = pendingSaveRef.current
      onEditSave?.({
        row: row.original,
        columnId: cell.column.id,
        newValue,
        originalValue: originalVal,
      })
      // 清除待触发的保存事件信息
      pendingSaveRef.current = null
    }

    // 更新上一次的编辑状态
    prevIsEditingRef.current = isCurrentlyEditing
  }, [isEditing, row, cell, onEditSave])

  // 进入编辑模式时自动聚焦并打开 Popover
  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
        setTimeout(() => {
          popoverRef.current?.open()
        })
      }
    }
    else {
      popoverRef.current?.close()
    }
  }, [isEditing])

  // 如果不启用编辑功能或不可编辑，直接渲染普通单元格
  if (!enableEditing || !isEditable) {
    return <>{ flexRender(cell.column.columnDef.cell, cell.getContext()) }</>
  }

  // 如果正在编辑，渲染编辑组件
  if (isEditing) {
    const editConfig = columnDef.editConfig

    // 如果提供了自定义编辑组件，使用自定义组件
    if (editConfig?.editComponent) {
      return (
        <>
          { editConfig.editComponent({
            value: editingValue as TValue,
            row: row.original,
            onSave: saveEditing,
            onCancel: cancelEditing,
          }) }
        </>
      )
    }

    // 根据数据类型自动选择 Input 或 NumberInput
    const isNumberType = typeof originalValue === 'number' || typeof editingValue === 'number'

    // 处理保存
    const handleSave = () => {
      if (editingValue !== undefined) {
        saveEditing(editingValue)
      }
    }

    // 处理取消
    const handleCancel = () => {
      cancelEditing()
    }

    // Popover 内容：保存和取消按钮
    const popoverContent = (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={ handleSave }
          className="h-7 px-3 text-xs"
        >
          保存
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={ handleCancel }
          className="h-7 px-3 text-xs"
        >
          取消
        </Button>
      </div>
    )

    if (isNumberType) {
      // 使用 NumberInput 处理数字类型
      const numValue = editingValue !== undefined && editingValue !== null
        ? Number(editingValue)
        : undefined

      return (
        <Popover
          ref={ popoverRef }
          trigger="click"
          position="right"
          content={ popoverContent }
          clickOutsideToClose={ false }
        >
          <NumberInput
            ref={ inputRef }
            value={ numValue }
            onChange={ (value) => {
              updateEditingValue(value as TValue)
            } }
            onPressEnter={ handleSave }
            onStepperClick={ (e) => {
              e.stopPropagation()
            } }
            size="sm"
            className="h-8"
          />
        </Popover>
      )
    }

    // 使用 Input 处理其他类型
    return (
      <Popover
        ref={ popoverRef }
        trigger="command"
        position="right"
        content={ popoverContent }
        clickOutsideToClose={ false }
        disabled={ false }
        contentClassName="bg-background border border-border shadow-lg p-2"
      >
        <Input
          ref={ inputRef }
          value={ editingValue !== undefined && editingValue !== null ? String(editingValue) : '' }
          onChange={ (value) => {
            updateEditingValue(value as TValue)
          } }
          onPressEnter={ handleSave }
          size="sm"
          className="h-8"
        />
      </Popover>
    )
  }

  // 非编辑状态，显示可点击的单元格
  return (
    <div
      className={ cn(
        'w-full cursor-pointer hover:bg-backgroundSecondary/50 rounded px-2 py-1 transition-colors',
      ) }
      onClick={ startEditing }
      title="单击或双击开始编辑"
    >
      { flexRender(cell.column.columnDef.cell, cell.getContext()) }
    </div>
  )
}

export const EditableCell = memo(EditableCellInner) as <TData extends object, TValue = unknown>(
  props: EditableCellProps<TData, TValue>,
) => React.ReactElement

EditableCellInner.displayName = 'EditableCell'

