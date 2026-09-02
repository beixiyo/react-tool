'use client'

import { useTheme } from 'hooks'
import { X } from 'lucide-react'
import { forwardRef, memo, useRef } from 'react'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { FloatingArrow, useFloatingLayer } from '../FloatingArrow'
import { SafePortal } from '../SafePortal'
import type { PopoverProps, PopoverRef } from './types'
import { usePopoverInteractions } from './usePopoverInteractions'
import { useScrollPortal } from './useScrollPortal'
import { getVariantByPlacement } from './variants'

const DEFAULT_CLOSE_KEYS = ['Escape']

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
    closeKeys = DEFAULT_CLOSE_KEYS,
    showCloseBtn = false,
    onOpen,
    onClose,

    virtualReferenceRect,
    clickOutsideIgnoreSelector,
    followScroll = false,
    restoreFocusOnOpen = false,
    exitSetMode = false,
    bordered = theme !== 'light',
    arrow = true,
  } = props
  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const {
    isOpen,
    setIsOpen,
    triggerProps,
    floatingProps,
  } = usePopoverInteractions({
    popoverRef: ref,
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
  })

  const { scrollPortalTarget, scrollContainerRef } = useScrollPortal(
    triggerRef,
    followScroll,
    isOpen,
  )

  const {
    style: floatingStyle,
    placement: actualPosition,
    arrowProps,
  } = useFloatingLayer(triggerRef, contentRef, {
    enabled: isOpen,
    placement: align === 'center'
      ? position
      : `${position}-${align}`,
    offset: offsetProp,
    arrow,
    bordered,
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

  const variants = getVariantByPlacement(actualPosition)
  return (
    <>
      <div
        style={ style }
        ref={ triggerRef }
        className={ className }
        { ...triggerProps }
      >
        { children }
      </div>

      <SafePortal
        target={ followScroll
          ? scrollPortalTarget
          : undefined }
      >
        <AnimateShow
          show={ isOpen }
          ref={ contentRef }
          className={ cn(
            'z-popover rounded-2xl bg-background drop-shadow-card',
            bordered && 'border border-border',
            contentClassName,
            arrowProps && 'overflow-visible',
          ) }
          style={ {
            ...floatingStyle,
            ...contentStyle,
          } }
          variants={ variants }
          exitSetMode={ exitSetMode }
          { ...floatingProps }
        >
          { showCloseBtn && (
            <button
              type="button"
              className={ `absolute top-1 right-2 z-popover cursor-pointer text-red-400 font-bold
          duration-300 hover:text-lg hover:text-red-600` }
              aria-label="Close popover"
              onClick={ () => {
                setIsOpen(false)
              } }
            >
              <X aria-hidden="true" />
            </button>
          ) }

          { arrowProps && <FloatingArrow { ...arrowProps } /> }

          { content }
        </AnimateShow>
      </SafePortal>
    </>
  )
}))

Popover.displayName = 'Popover'

export type { PopoverAlign, PopoverPosition, PopoverProps, PopoverRef, PopoverTrigger } from './types'
