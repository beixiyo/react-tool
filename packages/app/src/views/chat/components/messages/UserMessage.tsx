import type { ChatMessage } from '../../types'
import { formatDate } from '@jl-org/tool'
import { memo } from 'react'
import { cn } from 'utils'
import { getMessageBackgroundClasses, getUserMessageContainerClasses } from '../../messages/utils/styles'
import { MessageContent } from './MessageContent'

type UserMessageProps = {
  message: ChatMessage
}

export const UserMessage = memo<UserMessageProps>(({ message }) => {
  const bgCls = getMessageBackgroundClasses(message, true)

  return (
    <div className={ getUserMessageContainerClasses(message) }>
      <div className={ cn(
        'message-content',
        message.type === 'card'
          ? ''
          : 'space-y-3',
      ) }>
        <MessageContent message={ message } isUser={ true } bgCls={ bgCls } />
      </div>

      {/* 时间戳 */}
      { message.type !== 'card' && (
        <div className="mt-1 text-right text-xs opacity-70">
          { formatDate('HH:mm') }
        </div>
      ) }
    </div>
  )
})

UserMessage.displayName = 'UserMessage'
