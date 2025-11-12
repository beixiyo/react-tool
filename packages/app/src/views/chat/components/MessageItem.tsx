import type { ChatMessage } from '../types'
import { formatDate } from '@jl-org/tool'
import { AnimateShow, Button, Checkmark, Icon, LazyImg, LoadingIcon, MdToHtml } from 'comps'

import { motion } from 'framer-motion'
import { useInsertStyle } from 'hooks'
import { ChevronDown, Download, Paperclip, Sparkles, Trash2 } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { formatFileSize } from '../tool'

type MessageContentProps = {
  message: ChatMessage
  isUser: boolean
  bgCls: (string | false | undefined)[]
}

const MessageContent = memo<MessageContentProps>(({ message, isUser, bgCls }) => {
  /** 纯文本内容 */
  if (message.content && message.type === 'text') {
    return (
      <div
        className={ cn(
          'whitespace-pre-wrap break-words',
          !isUser && 'py-2 text-slate-800 dark:text-slate-200',
        ) }
      >
        { message.content }
      </div>
    )
  }

  // Markdown 内容
  if (message.type === 'markdown') {
    return (
      <MdToHtml
        content={ message.content }
        className={ cn(
          isUser
            ? bgCls
            : 'py-2',
        ) }
      />
    )
  }

  /** 图片内容 */
  if (message.images && message.images.length > 0) {
    return (
      <div className={ cn(
        'flex flex-wrap gap-2',
        !isUser && 'rounded-lg bg-slate-100 py-2 dark:bg-slate-800',
      ) }>
        { message.images.map((image, index) => (
          <div
            key={ `${image.url}-${index}` }
            className="flex flex-1 flex-col"
          >
            <LazyImg
              lazy={ false }
              src={ image.url }
              alt={ image.caption || '图片消息' }
              className={ cn('rounded-lg', isUser && 'max-h-[200px] max-w-full') }
            />
            { image.caption && (
              <div className="mt-1 text-center text-xs opacity-80">{ image.caption }</div>
            ) }
          </div>
        )) }
      </div>
    )
  }

  /** 文件内容 */
  if (message.files && message.files.length > 0) {
    return (
      <div className={ cn('flex flex-col space-y-2', !isUser && 'py-2') }>
        { message.files.map((file, index) => (
          <div
            key={ index }
            className="flex items-center rounded-lg bg-slate-200/50 p-2 ring-slate-300 transition-all duration-300 space-x-3 dark:bg-slate-700/30 hover:ring-.5 dark:ring-slate-700"
          >
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              <Paperclip strokeWidth={ 1.5 } />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{ file.name }</div>
              <div className="text-xs opacity-70">{ formatFileSize(file.size) }</div>
            </div>
            <Icon asChild>
              <a
                href={ file.url }
                download={ file.name }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download strokeWidth={ 1.5 } size={ 18 } />
              </a>
            </Icon>
          </div>
        )) }
      </div>
    )
  }

  /** 卡片内容 */
  if (message.type === 'card' && message.card) {
    const { card } = message
    return (
      <div className={ cn(
        'rounded-xl border transition-all duration-200',
        isUser && 'h-full',
        !isUser && 'my-2 w-fit',
        card.bordered !== false && 'border-slate-200 dark:border-slate-700',
        !card.bordered && 'border-transparent',
        card.variant === 'info' && 'border-blue-200 dark:border-blue-800',
        card.variant === 'success' && 'border-green-200 dark:border-green-800',
        card.variant === 'warning' && 'border-amber-200 dark:border-amber-800',
        card.variant === 'error' && 'border-red-200 dark:border-red-800',
        (!card.variant || card.variant === 'default') && 'border-slate-200 dark:border-slate-700',
      ) }>
        {/* 卡片头部 */ }
        { (card.title || card.icon) && (
          <div className="flex items-center p-4 pb-2 space-x-3">
            { card.icon && (
              <div className={ cn(
                'flex items-center justify-center',
                card.variant === 'info' && 'text-blue-600 dark:text-blue-400',
                card.variant === 'success' && 'text-green-600 dark:text-green-400',
                card.variant === 'warning' && 'text-amber-600 dark:text-amber-400',
                card.variant === 'error' && 'text-red-600 dark:text-red-400',
                (!card.variant || card.variant === 'default') && 'text-slate-600 dark:text-slate-400',
              ) }>
                { card.icon }
              </div>
            ) }
            { card.title && (
              <h3 className={ cn(
                'font-semibold text-sm',
                card.variant === 'info' && 'text-blue-900 dark:text-blue-100',
                card.variant === 'success' && 'text-green-900 dark:text-green-100',
                card.variant === 'warning' && 'text-amber-900 dark:text-amber-100',
                card.variant === 'error' && 'text-red-900 dark:text-red-100',
                (!card.variant || card.variant === 'default') && 'text-slate-900 dark:text-slate-100',
              ) }>
                { card.title }
              </h3>
            ) }
          </div>
        ) }

        {/* 卡片描述 */ }
        { card.description && (
          <div className={ cn(
            'px-4 text-sm',
            !card.title && !card.icon && 'pt-4',
            card.variant === 'info' && 'text-blue-700 dark:text-blue-300',
            card.variant === 'success' && 'text-green-700 dark:text-green-300',
            card.variant === 'warning' && 'text-amber-700 dark:text-amber-300',
            card.variant === 'error' && 'text-red-700 dark:text-red-300',
            (!card.variant || card.variant === 'default') && 'text-slate-600 dark:text-slate-300',
          ) }>
            { card.description }
          </div>
        ) }

        {/* 卡片内容 */ }
        { card.content && (
          <div className={ cn(
            isUser
              ? 'px-4'
              : 'p-4',
            !card.title && !card.icon && !card.description && 'pt-4',
            card.description && 'pt-2',
            (!card.description && (card.title || card.icon)) && 'pt-1',
          ) }>
            { card.content }
          </div>
        ) }

        {/* 卡片操作按钮 */ }
        { card.actions && card.actions.length > 0 && (
          <div className={ cn('flex flex-wrap gap-2', isUser
            ? 'p-4 pt-3'
            : 'px-4 pb-4') }>
            { card.actions.map((action, index) => (
              <Button
                key={ `${action.label}-${index}` }
                onClick={ action.onClick }
                disabled={ action.disabled }
                variant={ action.type }
                size="sm"
              >
                { action.label }
              </Button>
            )) }
          </div>
        ) }
      </div>
    )
  }

  return null
})
MessageContent.displayName = 'MessageContent'

export const MessageItem = memo<MessageItemProps>(({
  message,
  onDelete,
  className,
}) => {
  const isUser = message.sender === 'user'
  const bgCls = [
    'bg-slate-50 dark:bg-slate-800',
    isUser
      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tr-none'
      : 'text-slate-800 dark:text-slate-200',
    message.type === 'thinking-start' && 'bg-slate-50/70 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50',
    message.type === 'thinking-end' && 'bg-slate-50/70 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50',
    message.type === 'loading' && 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  ]

  /** 新增状态来控制思考过程的展开/收起 */
  const [thinkingExpanded, setThinkingExpanded] = useState(true)

  return (
    <div
      className={ cn(
        'flex group',
        isUser
          ? 'justify-end'
          : 'justify-center',
        className,
      ) }
    >
      {/* 用户消息保持气泡样式，AI消息去掉气泡样式 */ }
      { isUser
        ? <div
            className={ cn(
              message.type === 'card'
                ? 'rounded-2xl relative'
                : 'p-3 rounded-2xl relative',
              message.type === 'card' && [
                'bg-white dark:bg-gray-800',
                message.card?.variant === 'info' && 'border-l-4 border-l-blue-500',
                message.card?.variant === 'success' && 'border-l-4 border-l-green-500',
                message.card?.variant === 'warning' && 'border-l-4 border-l-amber-500',
                message.card?.variant === 'error' && 'border-l-4 border-l-red-500',
                (!message.card?.variant || message.card?.variant === 'default') && 'border-l-4 border-l-emerald-500',
              ],
              message.type !== 'card' && bgCls,
            ) }
          >
            <div className={ cn(
              'message-content',
              message.type === 'card'
                ? ''
                : 'space-y-3',
            ) }>
              <MessageContent message={ message } isUser={ isUser } bgCls={ bgCls } />
            </div>

            {/* 时间戳 */ }
            { message.type !== 'card' && (
              <div className="mt-1 text-right text-xs opacity-70">
                { formatDate('HH:mm') }
              </div>
            ) }
          </div>

        : <div className="w-full">
            { (message.type === 'thinking-start' || message.type === 'thinking-end') && (
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
            ) }

            {/* 加载中 */ }
            { message.type === 'loading' && (
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
            ) }

            <MessageContent message={ message } isUser={ isUser } bgCls={ bgCls } />

            { onDelete
              && <Icon
                icon={ Trash2 }
                size={ 14 }
                className="absolute top-1 size-6 opacity-0 -right-8 group-hover:opacity-100"
                onClick={ () => onDelete?.(message.id) }
              /> }
          </div> }
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

export type MessageItemProps = {
  message: ChatMessage
  onDelete?: (messageId: string) => void
  /** 自定义样式类名 */
  className?: string
}
