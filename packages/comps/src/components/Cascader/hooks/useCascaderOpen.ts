import type { RefObject } from 'react'
import { useLatestCallback } from 'hooks'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'

const DEFAULT_HOVER_CLOSE_DELAY = 150

export function useCascaderOpen(
  triggerRef: RefObject<HTMLDivElement | null>,
  dropdownRef: RefObject<HTMLDivElement | null>,
  options: {
    isControlled: boolean
    controlledOpen: boolean | undefined
    onOpenChange?: (open: boolean) => void
    onClickOutside?: () => void
    handleBlur: () => void
    disabled: boolean
    onTriggerClick?: () => void
    /** 命中时视为”内部”不关闭（如子 Popover 内容） */
    clickOutsideIgnoreSelector?: string
    triggerMode?: 'click' | 'hover'
    hoverCloseDelay?: number
  },
  ref: React.ForwardedRef<{ open: () => void, close: () => void }>,
) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = options.isControlled
    ? options.controlledOpen!
    : internalOpen

  const isHover = options.triggerMode === 'hover'
  const hoverCloseDelay = options.hoverCloseDelay ?? DEFAULT_HOVER_CLOSE_DELAY
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClickOutside = useLatestCallback((event: MouseEvent) => {
    const target = event.target as Node
    if (triggerRef.current?.contains(target))
      return
    if (dropdownRef.current?.contains(target))
      return
    if (
      options.clickOutsideIgnoreSelector
      && (event.target as Element).closest(options.clickOutsideIgnoreSelector!)
    ) {
      return
    }
    if (options.isControlled) {
      options.onOpenChange?.(false)
    }
    else {
      setInternalOpen(false)
    }
    options.onClickOutside?.()
    options.handleBlur()
  })

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const setOpen = useLatestCallback((open: boolean) => {
    if (options.isControlled) {
      options.onOpenChange?.(open)
    }
    else {
      setInternalOpen(open)
    }
  })

  const handleTriggerClick = useLatestCallback(() => {
    if (options.disabled)
      return
    options.onTriggerClick?.()
    if (isHover)
      return
    if (options.isControlled) {
      options.onOpenChange?.(!isOpen)
    }
    else {
      setInternalOpen(prev => !prev)
    }
  })

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = useLatestCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
    }, hoverCloseDelay)
  })

  const handleTriggerMouseEnter = useLatestCallback(() => {
    if (options.disabled || !isHover)
      return
    clearCloseTimer()
    setOpen(true)
  })

  const handleTriggerMouseLeave = useLatestCallback(() => {
    if (options.disabled || !isHover)
      return
    scheduleClose()
  })

  const handleDropdownMouseEnter = useLatestCallback(() => {
    if (!isHover)
      return
    clearCloseTimer()
  })

  const handleDropdownMouseLeave = useLatestCallback(() => {
    if (options.disabled || !isHover)
      return
    scheduleClose()
  })

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  useImperativeHandle(ref, () => ({
    open: () => {
      if (options.disabled || isOpen)
        return
      setOpen(true)
    },
    close: () => {
      setOpen(false)
    },
  }), [options.disabled, isOpen])

  return {
    isOpen,
    setOpen,
    handleTriggerClick,
    handleTriggerMouseEnter,
    handleTriggerMouseLeave,
    handleDropdownMouseEnter,
    handleDropdownMouseLeave,
  }
}
