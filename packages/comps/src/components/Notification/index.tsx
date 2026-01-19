'use client'

import type { NotificationProps, NotificationRef, NotificationType } from './types'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { DURATION, positionStyles, variantStyles } from './constants'
import { extendNotification } from './extendNotification'

const InnerNotification = forwardRef<NotificationRef, NotificationProps>((props, ref) => {
  const {
    className,
    style,
    variant = 'default',
    position = 'topRight',
    content,
    icon,
    showClose = false,
    duration = DURATION,
    onClose,
    onShow,
    zIndex = 50,
  } = props

  const [visible, setVisible] = useState(true)
  const timerRef = useRef<NodeJS.Timeout>(null)

  const styles = variantStyles[variant]
  const Icon = icon || styles.icon
  const positionStyle = positionStyles[position]

  useImperativeHandle(ref, () => ({
    hide: () => {
      setVisible(false)
    },
  }))

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setVisible(false)
    onClose?.()
  }

  useEffect(() => {
    onShow?.()

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose()
      }, duration)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [duration, onShow, onClose])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={ positionStyle.initial }
          animate={ positionStyle.animate }
          exit={ positionStyle.initial }
          transition={ { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
          style={ { zIndex, ...style } }
          className={ cn(
            'fixed',
            positionStyle.container,
            'flex items-start gap-3 px-4 py-3 min-w-[320px] max-w-[420px]',
            'rounded-lg shadow-card border border-border',
            styles.bg,
            className,
          ) }
        >
          <div
            className={ cn(
              'flex size-5 items-center justify-center rounded-full flex-shrink-0 mt-0.5',
              styles.iconBg,
              variant === 'loading' && 'animate-spin',
            ) }
          >
            <Icon
              className={ cn(
                'size-full',
                styles.accent,
                variant === 'loading' && 'size-4',
              ) }
            />
          </div>
          <div className={ cn('flex-1 text-sm', styles.accent) }>{content}</div>
          {showClose && (
            <button
              onClick={ handleClose }
              className={ cn(
                'flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 mt-0.5',
                'hover:bg-backgroundTertiary',
                'transition-colors',
              ) }
            >
              <X className="h-3 w-3 text-textSecondary" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export const Notification = memo(InnerNotification) as unknown as NotificationType<
  typeof InnerNotification
>
Notification.displayName = 'Notification'

extendNotification()
