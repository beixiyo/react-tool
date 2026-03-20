import type { ChatMessage } from '../../types'
import { Button, Icon, LazyImg } from 'comps'
import { Download, Paperclip } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import {
  getCardClasses,
  getCardContentClasses,
  getCardDescriptionClasses,
  getCardHeaderIconClasses,
  getCardTitleClasses,
} from '../../messages/utils/styles'
import { formatFileSize } from '../../tool'
import { StreamingMarkdown } from './StreamingMarkdown'

type MessageContentProps = {
  message: ChatMessage
  isUser: boolean
  bgCls: (string | false | undefined)[]
}

export const MessageContent = memo<MessageContentProps>(({ message, isUser, bgCls }) => {
  return <>
    {/* 纯文本内容 */}
    { message.content && message.type === 'text' && (
      <div
        className={ cn(
          'whitespace-pre-wrap wrap-break-word',
          !isUser && 'py-2 text-slate-800 dark:text-slate-200',
        ) }
      >
        { message.content }
      </div>
    ) }

    {/* Markdown 内容 - 流式渲染 */}
    { message.type === 'markdown' && (
      <StreamingMarkdown
        content={ message.content }
        isStreaming={ message.isStreaming }
        className={ cn(
          isUser
            ? bgCls
            : 'py-2',
        ) }
      />
    ) }

    {/* 图片内容 */}
    { message.images && message.images.length > 0 && (
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
    ) }

    {/* 文件内容 */}
    { message.files && message.files.length > 0 && (
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
    ) }

    {/* 卡片内容 */}
    { message.type === 'card' && message.card && (() => {
      const { card } = message
      return (
        <div className={ getCardClasses(message, isUser) }>
          {/* 卡片头部 */}
          { (card.title || card.icon) && (
            <div className="flex items-center p-4 pb-2 space-x-3">
              { card.icon && (
                <div className={ getCardHeaderIconClasses(card) }>
                  { card.icon }
                </div>
              ) }
              { card.title && (
                <h3 className={ getCardTitleClasses(card) }>
                  { card.title }
                </h3>
              ) }
            </div>
          ) }

          {/* 卡片描述 */}
          { card.description && (
            <div className={ getCardDescriptionClasses(card) }>
              { card.description }
            </div>
          ) }

          {/* 卡片内容 */}
          { card.content && (
            <div className={ getCardContentClasses(card, isUser) }>
              { card.content }
            </div>
          ) }

          {/* 卡片操作按钮 */}
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
    })() }
  </>
})

MessageContent.displayName = 'MessageContent'
