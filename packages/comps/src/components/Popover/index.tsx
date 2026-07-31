'use client'

import type { RefObject } from 'react'
import type { PopoverAlign, PopoverArrowOptions, PopoverPosition, PopoverProps, PopoverRef } from './types'
import { onUnmounted, useClickOutside, useFloatingPosition, useRestoreFocus, useTheme } from 'hooks'
import { X } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { useEscapeLayer } from '../EscapeLayer'
import { SafePortal } from '../SafePortal'
import { useScrollPortal } from './useScrollPortal'
import { getVariantByPlacement } from './variants'

/**
 * Popover 组件，用于在触发器元素旁边显示浮动内容
 */
export const Popover = memo(forwardRef<PopoverRef, PopoverProps>((
  props,
  ref,
) => {
  const [theme] = useTheme()
  const {
    style,
    className,
    contentClassName,
    contentStyle,

    children,
    content,
    position = 'top',
    align = 'center',
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
    restoreFocusOnOpen = false,
    exitSetMode = false,
    bordered = theme !== 'light',
    arrow,
  } = props
  const [isOpen, setIsOpen] = useState(false)

  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasOpenRef = useRef(false)

  const { scrollPortalTarget, scrollContainerRef } = useScrollPortal(
    triggerRef,
    followScroll,
    isOpen,
  )

  const { activeElementRef: activeElementBeforeOpenRef } = useRestoreFocus(isOpen && restoreFocusOnOpen)

  const {
    style: floatingStyle,
    placement: actualPosition,
  } = useFloatingPosition(triggerRef, contentRef, {
    enabled: isOpen,
    placement: align === 'center'
      ? position
      : `${position}-${align}`,
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

  useEscapeLayer({
    open: isOpen,
    onEscape: handleClose,
  })

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true
      onOpen?.()
    }
    else {
      /** 仅在实际从打开变为关闭时调用 onClose，避免初次 mount 时 isOpen=false 误触发 */
      if (wasOpenRef.current) {
        wasOpenRef.current = false
        onClose?.()
      }
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

      if (restoreFocusOnOpen)
        activeElementBeforeOpenRef.current = document.activeElement as HTMLElement | null
      setIsOpen(true)
    },
    close: () => {
      setIsOpen(false)
    },
  }), [disabled, isOpen, restoreFocusOnOpen])

  const variants = getVariantByPlacement(actualPosition)
  const arrowOptions = normalizeArrowOptions(arrow)

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

      <SafePortal target={ followScroll
        ? scrollPortalTarget
        : undefined }
      >
        <AnimateShow
          show={ isOpen }
          ref={ contentRef }
          className={ cn(
            'z-dropdown rounded-2xl shadow-card bg-background',
            bordered && 'border border-border',
            contentClassName,
            arrowOptions && 'overflow-visible',
          ) }
          style={ {
            ...floatingStyle,
            ...contentStyle,
          } }
          variants={ variants }
          exitSetMode={ exitSetMode }
          onMouseEnter={ handleContentMouseEnter }
          onMouseLeave={ handleContentMouseLeave }
        >
          { showCloseBtn && <X
            className={ `absolute top-1 right-2 cursor-pointer text-red-400 font-bold z-dropdown
          hover:text-red-600 duration-300 hover:text-lg` }
            onClick={ () => {
              setIsOpen(false)
            } }
          /> }

          { arrowOptions && (
            <div
              className={ cn(
                'pointer-events-none absolute z-[-1] bg-background shadow-card',
                arrowOptions.className,
              ) }
              style={ {
                width: arrowOptions.size ?? DEFAULT_ARROW_SIZE,
                height: arrowOptions.size ?? DEFAULT_ARROW_SIZE,
                ...getArrowStyle(actualPosition, arrowOptions.offset ?? DEFAULT_ARROW_OFFSET),
                ...arrowOptions.style,
              } }
            />
          ) }

          { content }
        </AnimateShow>
      </SafePortal>
    </>
  )
}))

Popover.displayName = 'Popover'

const DEFAULT_ARROW_SIZE = 12
const DEFAULT_ARROW_OFFSET = 24

const normalizeArrowOptions = (arrow: PopoverProps['arrow']): PopoverArrowOptions | null => {
  if (!arrow)
    return null

  return arrow === true
    ? {}
    : arrow
}

const getArrowStyle = (
  placement: string,
  offset: number,
): React.CSSProperties => {
  const [position, align] = placement.split('-') as [PopoverPosition, PopoverAlign?]
  const crossAxisValue = getArrowCrossAxisValue(align, offset)

  switch (position) {
    case 'top':
      return {
        bottom: 0,
        left: crossAxisValue,
        transform: 'translate(-50%, 50%) rotate(45deg)',
      }
    case 'bottom':
      return {
        top: 0,
        left: crossAxisValue,
        transform: 'translate(-50%, -50%) rotate(45deg)',
      }
    case 'left':
      return {
        right: 0,
        top: crossAxisValue,
        transform: 'translate(50%, -50%) rotate(45deg)',
      }
    case 'right':
    default:
      return {
        left: 0,
        top: crossAxisValue,
        transform: 'translate(-50%, -50%) rotate(45deg)',
      }
  }
}

const getArrowCrossAxisValue = (
  align: PopoverAlign | undefined,
  offset: number,
) => {
  switch (align) {
    case 'start':
      return offset
    case 'end':
      return `calc(100% - ${offset}px)`
    default:
      return '50%'
  }
}

export type { PopoverAlign, PopoverArrowOptions, PopoverPosition, PopoverProps, PopoverRef, PopoverTrigger } from './types'
