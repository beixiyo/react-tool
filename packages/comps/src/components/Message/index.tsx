'use client'

import type { MessageProps, MessageRef, MessageType } from './types'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { DURATION, variantStyles } from './constants'
import { extendMessage } from './extendMessage'

const InnerMessage = forwardRef<MessageRef, MessageProps>((props, ref) => {
  const {
    className,
    style,
    variant = 'default',
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
  const showIcon = !!(icon || variant === 'loading' || (variant !== 'neutral' && styles.icon))

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
      { visible && (
        <motion.div
          initial={ { opacity: 0, y: -20, scale: 0.95, x: '-50%' } }
          animate={ { opacity: 1, y: 0, scale: 1, x: '-50%' } }
          exit={ { opacity: 0, y: -20, scale: 0.95, x: '-50%' } }
          transition={ { duration: 0.3, ease: 'easeOut' } }
          style={ { zIndex, left: '50%', ...style } }
          className={ cn(
            'fixed top-16',
            'flex items-center gap-3 px-4 py-3',
            'rounded-2xl shadow-lg',
            styles.bg,
            className,
          ) }
        >
          { showIcon && Icon && (
            <div className={ cn(
              'flex size-5 items-center justify-center rounded-full',
              styles.iconBg,
              variant === 'loading' && 'animate-spin',
            ) }>
              <Icon className={ cn(
                'size-full',
                styles.accent,
                variant === 'loading' && 'size-4',
              ) } />
            </div>
          ) }
          <div className={ cn('text-sm', styles.accent) }>{ content }</div>
          { showClose && (
            <button
              onClick={ handleClose }
              className={ cn(
                'ml-2 flex h-5 w-5 items-center justify-center rounded-full',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'transition-colors',
              ) }
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          ) }
        </motion.div>
      ) }
    </AnimatePresence>
  )
})

export const Message = memo(InnerMessage) as unknown as MessageType<typeof InnerMessage>
Message.displayName = 'Message'

extendMessage()
