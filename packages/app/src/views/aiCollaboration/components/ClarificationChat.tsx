import type { ClarificationMessage } from '../types'
import { Button, LoadingIcon } from 'comps'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Send, SkipForward, X } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { aiCollaborationStore } from '../hooks/useAiCollab'

export type ClarificationChatProps = {
  /** 关闭对话框 */
  onClose: () => void
  /** 发送消息 */
  onSendMessage: (content: string) => void
  /** 跳过澄清 */
  onSkip: () => void
  /** 完成澄清 */
  onComplete: () => void
  /** 自定义样式类名 */
  className?: string
}

/**
 * 澄清对话框组件
 * 用于在需求不明确时，通过对话收集更多信息
 */
export const ClarificationChat = memo<ClarificationChatProps>((props) => {
  const {
    onClose,
    onSendMessage,
    onSkip,
    onComplete,
    className,
  } = props

  const snap = aiCollaborationStore.use()
  const { showClarificationDialog, clarificationSession, isGenerating } = snap
  const messages = clarificationSession?.messages || []

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /** 自动滚动到底部 */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim() || isGenerating)
      return
    onSendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      { showClarificationDialog && (
        <>
          {/* 遮罩层 */ }
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            exit={ { opacity: 0 } }
            onClick={ onClose }
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* 对话框 */ }
          <motion.div
            initial={ { opacity: 0, scale: 0.95, y: 20 } }
            animate={ { opacity: 1, scale: 1, y: 0 } }
            exit={ { opacity: 0, scale: 0.95, y: 20 } }
            transition={ { duration: 0.2 } }
            className={ cn(
              'fixed inset-x-4 top-[5%] z-50 mx-auto flex h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900',
              className,
            ) }
          >
            {/* 头部 */ }
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 dark:border-slate-700 dark:from-blue-950 dark:to-purple-950">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                  <MessageCircle size={ 20 } />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    需求澄清
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI 正在帮助你明确需求细节
                  </p>
                </div>
              </div>
              <button
                onClick={ onClose }
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <X size={ 20 } />
              </button>
            </div>

            {/* 消息列表 */ }
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                { messages.map(message => (
                  <MessageBubble key={ message.id } message={ message } />
                )) }

                {/* 加载指示器 */ }
                { isGenerating && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <LoadingIcon size={ 16 } />
                    <span className="text-sm">AI 正在思考...</span>
                  </div>
                ) }

                <div ref={ messagesEndRef } />
              </div>
            </div>

            {/* 底部输入区 */ }
            <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="flex gap-2">
                <textarea
                  value={ inputValue }
                  onChange={ e => setInputValue(e.target.value) }
                  onKeyDown={ handleKeyDown }
                  placeholder="输入你的回答..."
                  disabled={ isGenerating }
                  rows={ 2 }
                  className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={ handleSend }
                    disabled={ !inputValue.trim() || isGenerating }
                    size="sm"
                    className="h-full min-h-[40px]"
                  >
                    <Send size={ 16 } />
                  </Button>
                </div>
              </div>

              {/* 操作按钮 */ }
              <div className="mt-3 flex items-center justify-between">
                <Button
                  onClick={ onSkip }
                  size="sm"
                  disabled={ isGenerating }
                  className="text-slate-600 dark:text-slate-400"
                >
                  <SkipForward size={ 16 } />
                  跳过澄清
                </Button>
                <Button
                  onClick={ onComplete }
                  variant="primary"
                  size="sm"
                  disabled={ isGenerating || messages.length < 2 }
                >
                  <ArrowRight size={ 16 } />
                  完成澄清
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      ) }
    </AnimatePresence>
  )
})

ClarificationChat.displayName = 'ClarificationChat'

type MessageBubbleProps = {
  message: ClarificationMessage
}

const MessageBubble = memo<MessageBubbleProps>(({ message }) => {
  const isUser = message.sender === 'user'
  const isQuestion = message.type === 'question'

  return (
    <motion.div
      initial={ { opacity: 0, y: 10 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.2 } }
      className={ cn(
        'flex',
        isUser
          ? 'justify-end'
          : 'justify-start',
      ) }
    >
      <div
        className={ cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-blue-500 text-white'
            : isQuestion
              ? 'border border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-100'
              : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
          isUser && 'rounded-br-none',
          !isUser && 'rounded-bl-none',
        ) }
      >
        { isQuestion && !isUser && (
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400">
            <MessageCircle size={ 12 } />
            AI 的问题
          </div>
        ) }
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          { message.content }
        </p>
        <div
          className={ cn(
            'mt-1 text-right text-xs',
            isUser
              ? 'text-blue-100'
              : 'text-slate-500 dark:text-slate-400',
          ) }
        >
          { new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }) }
        </div>
      </div>
    </motion.div>
  )
})

MessageBubble.displayName = 'MessageBubble'
