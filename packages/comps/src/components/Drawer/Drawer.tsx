'use client'

import type { DrawerProps } from './types'
import { useComposedRef, useKeyboardLayer } from 'hooks'
import { X } from 'lucide-react'
import { forwardRef, memo } from 'react'
import { Z } from '../../constants/z-index'
import { getDrawerClasses } from './tool'
import { useDrawerFocus } from './useDrawerFocus'

export const Drawer = memo(forwardRef<HTMLDivElement, DrawerProps>((
  {
    className = '',
    children,
    position = 'right',
    open = false,
    onClose,
    overlay = true,
    closeButton = true,
    closeOnOverlayClick = true,
    closeIcon,
    closeButtonLabel = 'Close drawer',
    ariaLabel,
    ariaLabelledby,
  },
  ref,
) => {
  const { setRef, elementRef } = useComposedRef<HTMLDivElement>({ ref })
  useDrawerFocus(open, elementRef)

  // Calc transform and opacity classes for different positions
  const getTransformClass = () => {
    if (!open) {
      switch (position) {
        case 'top':
          return '-translate-y-full'
        case 'bottom':
          return 'translate-y-full'
        case 'left':
          return '-translate-x-full'
        case 'right':
          return 'translate-x-full'
      }
    }
    return 'translate-0'
  }

  // Handle overlay click
  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onClose) {
      onClose()
    }
  }

  useKeyboardLayer({
    active: open,
    keys: ['Escape'],
    priority: Z.overlay + 1,
    allowRepeat: false,
    onKeyDown: onClose,
  })

  const drawerClasses = getDrawerClasses(position, 'absolute bg-background shadow-lg transition-all duration-300 ease-in-out')
  const transformClass = getTransformClass()

  return (
    <>
      { overlay && (
        <div
          className={ `absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ${open
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
          }` }
          onClick={ handleOverlayClick }
          aria-hidden="true"
        />
      ) }
      <div
        ref={ setRef }
        role="dialog"
        aria-modal="true"
        aria-label={ ariaLabel }
        aria-labelledby={ ariaLabelledby }
        tabIndex={ -1 }
        className={ `${drawerClasses} ${transformClass} ${className} ${open
          ? 'visible'
          : 'invisible'}` }
        style={ {
          zIndex: Z.overlay + 1,
        } }
      >
        { closeButton && (
          <button
            onClick={ onClose }
            className="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden"
            aria-label={ closeButtonLabel }
          >
            { closeIcon ?? <X className="h-5 w-5" /> }
            <span className="sr-only">{ closeButtonLabel }</span>
          </button>
        ) }
        { children }
      </div>
    </>
  )
}))

Drawer.displayName = 'Drawer'
