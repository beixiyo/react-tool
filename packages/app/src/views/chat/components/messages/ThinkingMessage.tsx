import type { ChatMessage } from '../../types'
import { AnimateShow, Checkmark, LoadingIcon } from 'comps'
import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { memo, useState } from 'react'

type ThinkingMessageProps = {
  message: ChatMessage
}

export const ThinkingMessage = memo<ThinkingMessageProps>(({ message }) => {
  const [thinkingExpanded, setThinkingExpanded] = useState(true)

  return (
    <div className="mb-2 flex flex-col space-y-2">
      <div
        className="w-fit flex cursor-pointer items-center rounded-2xl bg-slate-100 px-3 py-1.5 text-slate-500 space-x-2 dark:bg-slate-600 dark:text-slate-300"
        onClick={ () => setThinkingExpanded(!thinkingExpanded) }
      >
        <Sparkles size={ 14 } className="text-slate-400 dark:text-slate-400" />
        <span className="text-xs font-medium">
          { message.type === 'thinking-start'
            ? '思考过程'
            : '思考完成' }
        </span>

        { message.type === 'thinking-start'
          ? <LoadingIcon size={ 14 } />
          : <Checkmark size={ 14 } /> }
        <motion.div
          animate={ {
            rotate: thinkingExpanded
              ? 180
              : 0,
          } }
          transition={ { duration: 0.2 } }
          className="ml-auto"
        >
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </motion.div>
      </div>

      <AnimateShow show={ thinkingExpanded }>
        <div className="whitespace-pre-wrap border-l border-slate-200 pl-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          { message.content }
        </div>
      </AnimateShow>
    </div>
  )
})

ThinkingMessage.displayName = 'ThinkingMessage'
