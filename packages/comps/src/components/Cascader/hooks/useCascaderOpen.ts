import type { RefObject } from 'react'
import { useCallback, useEffect, useImperativeHandle, useState } from 'react'

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
  },
  ref: React.ForwardedRef<{ open: () => void, close: () => void }>,
) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = options.isControlled
    ? options.controlledOpen!
    : internalOpen

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      triggerRef.current && !triggerRef.current.contains(event.target as Node)
      && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
    ) {
      if (options.isControlled) {
        options.onOpenChange?.(false)
      }
      else {
        setInternalOpen(false)
      }
      options.onClickOutside?.()
      options.handleBlur()
    }
  }, [triggerRef, dropdownRef, options.isControlled, options.onOpenChange, options.onClickOutside, options.handleBlur])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  const setOpen = useCallback((open: boolean) => {
    if (options.isControlled) {
      options.onOpenChange?.(open)
    }
    else {
      setInternalOpen(open)
    }
  }, [options.isControlled, options.onOpenChange])

  const handleTriggerClick = useCallback(() => {
    if (options.disabled)
      return
    options.onTriggerClick?.()
    if (options.isControlled) {
      options.onOpenChange?.(!isOpen)
    }
    else {
      setInternalOpen(prev => !prev)
    }
  }, [options.disabled, options.isControlled, options.onOpenChange, options.onTriggerClick, isOpen])

  useImperativeHandle(ref, () => ({
    open: () => {
      if (options.disabled || isOpen)
        return
      setOpen(true)
    },
    close: () => {
      setOpen(false)
    },
  }), [options.disabled, isOpen, setOpen])

  return { isOpen, setOpen, handleTriggerClick }
}
