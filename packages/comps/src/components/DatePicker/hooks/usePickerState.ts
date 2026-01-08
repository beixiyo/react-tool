import type { Ref } from 'react'
import { useCallback, useImperativeHandle, useState } from 'react'

export interface PickerRef {
  open: () => void
  close: () => void
}

export interface UsePickerStateOptions {
  /** 打开状态（受控模式） */
  open?: boolean
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void
  /** 是否禁用 */
  disabled?: boolean
  /** ref 对象 */
  ref?: Ref<PickerRef>
}

export interface UsePickerStateReturn {
  /** 是否受控 */
  isControlled: boolean
  /** 内部打开状态（非受控模式使用） */
  internalOpen: boolean
  /** 实际使用的打开状态 */
  isOpen: boolean
  /** 设置打开状态 */
  setOpen: (open: boolean) => void
  /** 处理触发器点击 */
  handleTriggerClick: () => void
}

/**
 * 统一的 Picker 组件状态管理 Hook
 * 处理受控/非受控模式的状态管理
 */
export function usePickerState({
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  ref,
}: UsePickerStateOptions): UsePickerStateReturn {
  /** 判断是否为受控模式 */
  const isControlled = controlledOpen !== undefined

  /** 内部打开状态（非受控模式使用） */
  const [internalOpen, setInternalOpen] = useState(false)

  /** 实际使用的打开状态 */
  const isOpen = isControlled ? controlledOpen : internalOpen

  /** 设置打开状态 */
  const setOpen = useCallback((open: boolean) => {
    if (disabled && open)
      return

    if (isControlled) {
      onOpenChange?.(open)
    }
    else {
      setInternalOpen(open)
    }
  }, [disabled, isControlled, onOpenChange])

  /** 处理触发器点击 */
  const handleTriggerClick = useCallback(() => {
    if (disabled)
      return

    setOpen(!isOpen)
  }, [disabled, isOpen, setOpen])

  /** 暴露 ref 方法 */
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }), [setOpen])

  return {
    isControlled,
    internalOpen,
    isOpen,
    setOpen,
    handleTriggerClick,
  }
}
