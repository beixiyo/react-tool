'use client'

import type { FloatingPlacement } from 'hooks'
import { useKeyboardLayer, useTheme } from 'hooks'
import { memo, useRef } from 'react'
import { cn } from 'utils'
import { Z } from '../../../constants/z-index'
import { AnimateShow } from '../../Animate'
import type { FloatingArrowConfig } from '../../FloatingArrow'
import { FloatingArrow } from '../../FloatingArrow'
import { SafePortal } from '../../SafePortal'
import { CONTAINER_CLASSNAME } from '../constants'
import { useClickOutside } from '../hooks/useClickOutside'
import { usePickerFloating } from '../hooks/usePickerFloating'

interface PickerBaseProps {
  isOpen: boolean
  disabled?: boolean
  setOpen: (open: boolean) => void
  trigger: React.ReactNode
  dropdown: React.ReactNode
  placement?: FloatingPlacement
  offset?: number
  onClickOutside?: () => void
  onDismiss?: (reason: PickerDismissReason) => void
  onBlur?: () => void
  className?: string
  dropdownClassName?: string
  arrow?: FloatingArrowConfig
  dropdownZIndex?: number
  error?: boolean
  errorMessage?: React.ReactNode
  fullWidth?: boolean
}

export const PickerBase = memo<PickerBaseProps>(({
  isOpen,
  disabled = false,
  setOpen,
  trigger,
  dropdown,
  placement = 'bottom-start',
  offset = 8,
  onClickOutside,
  onDismiss,
  onBlur,
  className,
  dropdownClassName,
  arrow = true,
  dropdownZIndex,
  error,
  errorMessage,
  fullWidth = true,
}) => {
  const [theme] = useTheme()
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    style,
    shouldAnimate,
    arrowProps,
  } = usePickerFloating({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    placement,
    offset,
    arrow,
    bordered: theme !== 'light',
  })

  useClickOutside({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    onClickOutside,
    onClose: () => {
      if (onDismiss) onDismiss('outside')
      else setOpen(false)
      onBlur?.()
    },
  })

  useKeyboardLayer({
    active: isOpen && shouldAnimate && !disabled,
    keys: ['Escape'],
    priority: dropdownZIndex ?? Z.dropdown,
    allowRepeat: false,
    onKeyDown: () => {
      if (onDismiss) onDismiss('escape')
      else setOpen(false)
      onBlur?.()
    },
  })

  const dropdownContent = (
    <AnimateShow
      show={ isOpen && shouldAnimate }
      ref={ dropdownRef }
      variants="fade"
      animateOnMount={ false }
      style={ {
        ...style,
        zIndex: dropdownZIndex ?? Z.dropdown,
      } }
      className={ cn(
        CONTAINER_CLASSNAME,
        'relative',
        theme !== 'light' && 'border border-border',
        arrowProps && 'overflow-visible',
        dropdownClassName,
      ) }
    >
      { arrowProps && <FloatingArrow { ...arrowProps } /> }
      { dropdown }
    </AnimateShow>
  )

  return (
    <div className={ cn('inline-block', fullWidth && 'w-full', className) }>
      <div ref={ triggerRef } className={ cn(fullWidth && 'w-full') }>
        { trigger }
      </div>

      <SafePortal>{ dropdownContent }</SafePortal>

      { error && errorMessage && (
        <div className="mt-1 text-xs text-danger">
          { errorMessage }
        </div>
      ) }
    </div>
  )
})

PickerBase.displayName = 'PickerBase'

export type PickerDismissReason = 'outside' | 'escape'
