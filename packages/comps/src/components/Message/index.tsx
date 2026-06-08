'use client'

import type { MessageProps, MessageRef, MessageType } from './types'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Z } from '../../constants/z-index'
import { DURATION } from './constants'
import { extendMessage } from './extendMessage'
import { MessageView } from './MessageView'

const InnerMessage = forwardRef<MessageRef, MessageProps>((props, ref) => {
  const {
    className,
    style,
    variant = 'default',
    content,
    icon,
    showClose = false,
    showIcon,
    duration = DURATION,
    onClose,
    onShow,
    zIndex = Z.toast,
  } = props

  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
          className="fixed top-16"
        >
          <MessageView
            variant={ variant }
            content={ content }
            icon={ icon }
            showClose={ showClose }
            showIcon={ showIcon }
            onClose={ handleClose }
            className={ className }
          />
        </motion.div>
      ) }
    </AnimatePresence>
  )
})

export const Message = memo(InnerMessage) as unknown as MessageType<typeof InnerMessage>
Message.displayName = 'Message'

extendMessage()
