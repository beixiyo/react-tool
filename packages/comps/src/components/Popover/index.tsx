'use client'

import type { PopoverProps, PopoverRef } from './types'
import { useFloatingPosition, useTheme } from 'hooks'
import { X } from 'lucide-react'
import { forwardRef, memo, useRef } from 'react'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { FloatingArrow, useFloatingArrowState } from '../FloatingArrow'
import { SafePortal } from '../SafePortal'
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
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleContentMouseEnter,
    handleContentMouseLeave,
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

  const {
    options: arrowOptions,
    centerOffset: arrowCenterOffset,
    fill: arrowFill,
    style: arrowStyle,
  } = useFloatingArrowState({
    arrow,
    enabled: isOpen,
    placement: actualPosition,
    floatingStyle,
    referenceRef: triggerRef,
    floatingRef: contentRef,
    virtualReferenceRect,
  })

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

      <SafePortal target={ followScroll
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
            className={ `absolute top-1 right-2 cursor-pointer text-red-400 font-bold z-popover
          hover:text-red-600 duration-300 hover:text-lg` }
            onClick={ () => {
              setIsOpen(false)
            } }
          /> }

          { arrowOptions && (
            <FloatingArrow
              placement={ actualPosition }
              centerOffset={ arrowCenterOffset }
              size={ arrowOptions.size }
              bordered={ bordered }
              fill={ arrowFill }
              className={ arrowOptions.className }
              style={ arrowStyle }
            />
          ) }

          { content }
        </AnimateShow>
      </SafePortal>
    </>
  )
}))

Popover.displayName = 'Popover'

export type { PopoverAlign, PopoverPosition, PopoverProps, PopoverRef, PopoverTrigger } from './types'
