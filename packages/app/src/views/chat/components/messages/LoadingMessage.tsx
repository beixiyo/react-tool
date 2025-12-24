import type { ChatMessage } from '../../types'
import { motion } from 'framer-motion'
import { memo } from 'react'

type LoadingMessageProps = {
  message: ChatMessage
}

export const LoadingMessage = memo<LoadingMessageProps>(({ message }) => {
  return (
    <div className="flex items-center p-2 space-x-2">
      <motion.div
        className="flex space-x-1"
        initial={ { opacity: 0.3 } }
        animate={ { opacity: 1 } }
        transition={ { duration: 0.8, repeat: Infinity, repeatType: 'reverse' } }
      >
        <motion.div
          className="h-2 w-2 rounded-full bg-current text-slate-500 dark:text-slate-400"
          animate={ { y: [0, -5, 0] } }
          transition={ { duration: 0.8, repeat: Infinity, repeatDelay: 0.2 } }
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-current text-slate-500 dark:text-slate-400"
          animate={ { y: [0, -5, 0] } }
          transition={ { duration: 0.8, delay: 0.2, repeat: Infinity, repeatDelay: 0.2 } }
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-current text-slate-500 dark:text-slate-400"
          animate={ { y: [0, -5, 0] } }
          transition={ { duration: 0.8, delay: 0.4, repeat: Infinity, repeatDelay: 0.2 } }
        />
      </motion.div>
      <span className="ml-4 text-sm text-slate-500 dark:text-slate-400">{ message.content || 'Loading...' }</span>
    </div>
  )
})

LoadingMessage.displayName = 'LoadingMessage'
