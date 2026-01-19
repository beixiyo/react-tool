'use client'

import type { DrawerProps } from './types'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from 'utils'
import { Mask } from '../Mask'
import { getDrawerClasses } from './tool'

export const DrawerFramer = memo(forwardRef<HTMLDivElement, DrawerProps>(
  (
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
    const maskRef = useRef<HTMLDivElement>(null)

    // Calculate initial and animate values for different positions
    const getMotionProps = () => {
      switch (position) {
        case 'top':
          return { initial: { y: '-100%' }, animate: { y: 0 } }
        case 'bottom':
          return { initial: { y: '100%' }, animate: { y: 0 } }
        case 'left':
          return { initial: { x: '-100%' }, animate: { x: 0 } }
        case 'right':
          return { initial: { x: '100%' }, animate: { x: 0 } }
      }
    }

    // Handle overlay click
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnOverlayClick) {
        return
      }

      if (e.target === maskRef.current) {
        onClose?.()
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

    const drawerClasses = getDrawerClasses(position, 'absolute bg-white dark:bg-slate-800 shadow-lg')
    const motionProps = getMotionProps()

    const Content = <motion.div
      ref={ ref }
      className={ cn(drawerClasses, className) }
      initial={ motionProps.initial }
      animate={ motionProps.animate }
      exit={ motionProps.initial }
      transition={ { type: 'spring', damping: 30, stiffness: 300 } }
      style={ { zIndex: 10 } }
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
    </motion.div>

    return (
      <AnimatePresence>
        { open && <>
          { overlay
            ? <Mask
                onClick={ handleOverlayClick }
                ref={ maskRef }
              >
                { Content }
              </Mask>

            : Content }

        </> }
      </AnimatePresence>
    )
  },
))

DrawerFramer.displayName = 'DrawerFramer'
