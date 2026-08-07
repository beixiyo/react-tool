import type { RefObject } from 'react'
import type { PopoverProps, PopoverRef } from './types'
import { onUnmounted, useClickOutside, useKeyboardLayer, useRestoreFocus } from 'hooks'
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Z } from '../../constants/z-index'

/** 管理 Popover 的开关状态、触发方式、关闭策略与命令式 API */
export function usePopoverInteractions(options: UsePopoverInteractionsOptions) {
  const {
    popoverRef,
    triggerRef,
    contentRef,
    trigger,
    disabled,
    removeDelay,
    showDelay,
    clickOutsideToClose,
    closeKeys,
    clickOutsideIgnoreSelector,
    restoreFocusOnOpen,
    contentStyle,
    onOpen,
    onClose,
  } = options
  const [isOpen, setIsOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasOpenRef = useRef(false)
  const { activeElementRef: activeElementBeforeOpenRef } = useRestoreFocus(
    isOpen && restoreFocusOnOpen,
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  useClickOutside(
    [triggerRef, contentRef] as RefObject<HTMLElement>[],
    handleClose,
    {
      enabled: isOpen && (trigger === 'click' || trigger === 'command') && clickOutsideToClose,
      additionalSelectors: clickOutsideIgnoreSelector
        ? [clickOutsideIgnoreSelector]
        : [],
    },
  )

  useKeyboardLayer({
    active: isOpen,
    keys: closeKeys,
    priority: typeof contentStyle?.zIndex === 'number'
      ? contentStyle.zIndex
      : Z.popover,
    allowRepeat: false,
    onKeyDown: handleClose,
  })

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true
      onOpen?.()
    }
    else if (wasOpenRef.current) {
      wasOpenRef.current = false
      onClose?.()
    }
  }, [isOpen, onOpen, onClose])

  onUnmounted(() => {
    if (closeTimeoutRef.current)
      clearTimeout(closeTimeoutRef.current)
    if (showTimeoutRef.current)
      clearTimeout(showTimeoutRef.current)
  })

  const handleClick = () => {
    if (!disabled && trigger === 'click')
      setIsOpen(current => !current)
  }

  const handleMouseEnter = () => {
    if (disabled || trigger !== 'hover')
      return

    clearTimer(closeTimeoutRef)
    clearTimer(showTimeoutRef)
    if (showDelay <= 0) {
      setIsOpen(true)
      return
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, showDelay)
  }

  const removePopover = () => {
    if (removeDelay <= 0) {
      setIsOpen(false)
      return
    }

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, removeDelay)
  }

  const handleMouseLeave = () => {
    if (disabled || trigger !== 'hover')
      return

    clearTimer(showTimeoutRef)
    removePopover()
  }

  const handleContentMouseEnter = () => {
    if (!disabled && trigger === 'hover')
      clearTimer(closeTimeoutRef)
  }

  const handleContentMouseLeave = () => {
    if (!disabled && trigger === 'hover')
      removePopover()
  }

  useImperativeHandle(popoverRef, () => ({
    open: () => {
      if (disabled || isOpen)
        return

      if (restoreFocusOnOpen) {
        activeElementBeforeOpenRef.current = document.activeElement as HTMLElement | null
      }
      setIsOpen(true)
    },
    close: handleClose,
  }), [
    activeElementBeforeOpenRef,
    disabled,
    handleClose,
    isOpen,
    restoreFocusOnOpen,
  ])

  return {
    isOpen,
    setIsOpen,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleContentMouseEnter,
    handleContentMouseLeave,
  }
}

function clearTimer(timerRef: RefObject<ReturnType<typeof setTimeout> | null>) {
  if (!timerRef.current)
    return

  clearTimeout(timerRef.current)
  timerRef.current = null
}

type UsePopoverInteractionsOptions = {
  popoverRef: React.ForwardedRef<PopoverRef>
  triggerRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  trigger: NonNullable<PopoverProps['trigger']>
  disabled: PopoverProps['disabled']
  removeDelay: number
  showDelay: number
  clickOutsideToClose: boolean
  closeKeys: string[]
  clickOutsideIgnoreSelector: PopoverProps['clickOutsideIgnoreSelector']
  restoreFocusOnOpen: boolean
  contentStyle: PopoverProps['contentStyle']
  onOpen: PopoverProps['onOpen']
  onClose: PopoverProps['onClose']
}
