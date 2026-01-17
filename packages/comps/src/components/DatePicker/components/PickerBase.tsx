'use client'

import { useShortCutKey } from 'hooks'
import { memo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../../Animate'
import { useClickOutside } from '../hooks/useClickOutside'
import { usePickerFloating } from '../hooks/usePickerFloating'

interface PickerBaseProps {
  isOpen: boolean
  setOpen: (open: boolean) => void
  trigger: React.ReactNode
  dropdown: React.ReactNode
  placement?: any
  offset?: number
  onClickOutside?: () => void
  onBlur?: () => void
  className?: string
  dropdownClassName?: string
  error?: boolean
  errorMessage?: string
}

export const PickerBase = memo<PickerBaseProps>(({
  isOpen,
  setOpen,
  trigger,
  dropdown,
  placement = 'bottom-start',
  offset = 4,
  onClickOutside,
  onBlur,
  className,
  dropdownClassName,
  error,
  errorMessage,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { style, shouldAnimate } = usePickerFloating({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    placement,
    offset,
  })

  useClickOutside({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    onClickOutside,
    onClose: () => {
      setOpen(false)
      onBlur?.()
    },
  })

  useShortCutKey({
    key: 'Escape',
    fn: () => {
      if (isOpen) {
        setOpen(false)
        onBlur?.()
      }
    },
  })

  const dropdownContent = isOpen && (
    <AnimateShow
      show={ shouldAnimate }
      ref={ dropdownRef }
      variants="scale"
      visibilityMode
      animateOnMount={ false }
      display="block"
      style={ {
        ...style,
        zIndex: 50,
      } }
    >
      <div className={ cn('bg-background border border-border rounded-lg shadow-lg', dropdownClassName) }>
        {dropdown}
      </div>
    </AnimateShow>
  )

  return (
    <div className={ cn('inline-block w-full', className) }>
      <div ref={ triggerRef } className="w-full">
        {trigger}
      </div>
      {createPortal(dropdownContent, document.body)}
      {error && errorMessage && (
        <div className="mt-1 text-xs text-danger">
          {errorMessage}
        </div>
      )}
    </div>
  )
})

PickerBase.displayName = 'PickerBase'
