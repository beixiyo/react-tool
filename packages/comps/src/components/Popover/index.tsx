'use client'

import type { RefObject } from 'react'
import type { PopoverProps, PopoverRef } from './types'
import { onUnmounted, useClickOutside, useFloatingPosition, useShortCutKey } from 'hooks'
import { X } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { useScrollPortal } from './useScrollPortal'
import { getVariantByPlacement } from './variants'

/**
 * Popover 组件，用于在触发器元素旁边显示浮动内容
 */
export const Popover = memo(forwardRef<PopoverRef, PopoverProps>((
  {
    style,
    className,
    contentClassName,

    children,
    content,
    position = 'top',
    trigger = 'hover',
    disabled,
    removeDelay = 200,
    showDelay = 0,
    offset: offsetProp = 8,

    clickOutsideToClose = true,
    showCloseBtn = false,
    onOpen,
    onClose,

    virtualReferenceRect,
    clickOutsideIgnoreSelector,
    followScroll = false,
  },
  ref,
) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { scrollPortalTarget, scrollContainerRef } = useScrollPortal(
    triggerRef,
    followScroll,
    isOpen,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    style: floatingStyle,
    placement: actualPosition,
  } = useFloatingPosition(triggerRef, contentRef, {
    enabled: isOpen,
    placement: position,
    offset: offsetProp,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
    virtualReferenceRect,
    containerRef: followScroll
      ? scrollContainerRef
      : undefined,
  })

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

  useShortCutKey({
    key: 'Escape',
    fn: handleClose,
    el: isOpen && typeof document !== 'undefined'
      ? document as unknown as HTMLElement
      : null,
  })

  useEffect(() => {
    if (isOpen) {
      onOpen?.()
    }
    else {
      onClose?.()
    }
  }, [isOpen, onOpen, onClose])

  onUnmounted(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
    }
  })

  const handleClick = () => {
    if (disabled)
      return
    if (trigger === 'click') {
      setIsOpen(!isOpen)
    }
  }

  const handleMouseEnter = () => {
    if (disabled)
      return

    if (trigger === 'hover') {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current)
        showTimeoutRef.current = null
      }

      if (showDelay <= 0) {
        setIsOpen(true)
      }
      else {
        showTimeoutRef.current = setTimeout(() => {
          setIsOpen(true)
        }, showDelay)
      }
    }
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
    if (disabled)
      return

    if (trigger === 'hover') {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current)
        showTimeoutRef.current = null
      }
      removePopover()
    }
  }

  const handleContentMouseEnter = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }

  const handleContentMouseLeave = () => {
    if (disabled)
      return
    if (trigger === 'hover') {
      removePopover()
    }
  }

  useImperativeHandle(ref, () => ({
    open: () => {
      if (disabled || isOpen)
        return

      setIsOpen(true)
    },
    close: () => {
      setIsOpen(false)
    },
  }), [disabled, isOpen])

  const variants = getVariantByPlacement(actualPosition)

  return (
    <>
      <div
        style={ style }
        ref={ triggerRef }
        onClick={ handleClick }
        onMouseEnter={ handleMouseEnter }
        onMouseLeave={ handleMouseLeave }
        className={ className }
      >
        { children }
      </div>

      { mounted && (!followScroll || scrollPortalTarget) && createPortal(
        <AnimateShow
          show={ isOpen }
          ref={ contentRef }
          className={ cn('z-50 rounded-2xl shadow-lg bg-background', contentClassName) }
          style={ floatingStyle }
          variants={ variants }
          onMouseEnter={ handleContentMouseEnter }
          onMouseLeave={ handleContentMouseLeave }
        >
          { showCloseBtn && <X
            className={ `absolute top-1 right-2 cursor-pointer text-red-400 font-bold z-50
          hover:text-red-600 duration-300 hover:text-lg` }
            onClick={ () => {
              setIsOpen(false)
            } }
          /> }

          { content }
        </AnimateShow>,
        followScroll
          ? scrollPortalTarget!
          : document.body,
      ) }
    </>
  )
}))

Popover.displayName = 'Popover'

export type { PopoverPosition, PopoverProps, PopoverRef, PopoverTrigger } from './types'
