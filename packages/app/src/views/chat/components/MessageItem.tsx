import type { ChatMessage } from '../types'
import { memo } from 'react'
import { cn } from 'utils'
import {
  AssistantMessage,
  LoadingMessage,
  ThinkingMessage,
  UserMessage,
} from './messages'

export const MessageItem = memo<MessageItemProps>(({
  message,
  onDelete,
  className,
}) => {
  const isUser = message.sender === 'user'

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
      { isUser
        ? <UserMessage message={ message } />
        : <div className="w-full">
            { (message.type === 'thinking-start' || message.type === 'thinking-end') && (
              <ThinkingMessage message={ message } />
            ) }

            { message.type === 'loading' && (
              <LoadingMessage message={ message } />
            ) }

            { message.type !== 'thinking-start' && message.type !== 'thinking-end' && message.type !== 'loading' && (
              <AssistantMessage message={ message } onDelete={ onDelete } />
            ) }
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
