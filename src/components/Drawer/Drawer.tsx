'use client'

import type { DrawerProps } from './types'
import { X } from 'lucide-react'
import { getDrawerClasses } from './tool'

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
  },
  ref,
) => {
  // Calculate transform and opacity classes for different positions
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

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [open, onClose])

  const drawerClasses = getDrawerClasses(position, 'absolute bg-white shadow-lg transition-all duration-300 ease-in-out')
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
        ref={ ref }
        className={ `${drawerClasses} ${transformClass} ${className} ${open
          ? 'visible'
          : 'invisible'}` }
        style={ {
          zIndex: 10, // Ensure drawer is above the overlay
        } }
      >
        { closeButton && (
          <button
            onClick={ onClose }
            className="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        ) }
        { children }
      </div>
    </>
  )
}))

Drawer.displayName = 'Drawer'
