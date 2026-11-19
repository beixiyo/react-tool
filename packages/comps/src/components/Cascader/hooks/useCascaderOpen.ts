import { useClickOutside, useLatestCallback } from 'hooks'
import type { RefObject } from 'react'
import { useImperativeHandle } from 'react'
import { useFloatingTrigger } from '../../../hooks/useFloatingTrigger'

const DEFAULT_HOVER_CLOSE_DELAY = 150

/**
 * Cascader 开关状态：受控 / 非受控、点击切换、hover 延迟关闭与点击外部关闭
 *
 * 开关与 hover 延迟复用 `useFloatingTrigger`；点击模式不使用其 click 处理器，
 * 因为触发器点击还要先回调 `onTriggerClick`，且 hover 模式下点击不切换
 */
export function useCascaderOpen(
  triggerRef: RefObject<HTMLDivElement | null>,
  dropdownRef: RefObject<HTMLDivElement | null>,
  options: {
    controlledOpen: boolean | undefined
    onOpenChange?: (open: boolean) => void
    onClickOutside?: () => void
    handleBlur: () => void
    disabled: boolean
    onTriggerClick?: () => void
    /** 命中时视为“内部”不关闭（如子 Popover 内容） */
    clickOutsideIgnoreSelector?: string
    triggerMode?: 'click' | 'hover'
    hoverCloseDelay?: number
  },
  ref: React.Ref<{ open: () => void; close: () => void }> | undefined,
) {
  const isHover = options.triggerMode === 'hover'

  const {
    isOpen,
    setOpen,
    toggle,
    triggerProps,
    floatingProps,
  } = useFloatingTrigger({
    trigger: isHover
      ? 'hover'
      : 'manual',
    disabled: options.disabled,
    open: options.controlledOpen,
    hideDelay: options.hoverCloseDelay ?? DEFAULT_HOVER_CLOSE_DELAY,
    onOpenChange: options.onOpenChange,
  })

  useClickOutside(
    [triggerRef, dropdownRef],
    () => {
      setOpen(false)
      options.onClickOutside?.()
      options.handleBlur()
    },
    {
      enabled: isOpen,
      additionalSelectors: options.clickOutsideIgnoreSelector
        ? [options.clickOutsideIgnoreSelector]
        : undefined,
    },
  )

  const handleTriggerClick = useLatestCallback(() => {
    if (options.disabled) return
    options.onTriggerClick?.()
    if (!isHover) toggle()
  })

  useImperativeHandle(ref, () => ({
    open: () => {
      if (options.disabled || isOpen) return
      setOpen(true)
    },
    close: () => {
      setOpen(false)
    },
  }), [options.disabled, isOpen, setOpen])

  return {
    isOpen,
    setOpen,
    handleTriggerClick,
    handleTriggerMouseEnter: triggerProps.onMouseEnter,
    handleTriggerMouseLeave: triggerProps.onMouseLeave,
    handleDropdownMouseEnter: floatingProps.onMouseEnter,
    handleDropdownMouseLeave: floatingProps.onMouseLeave,
  }
}
