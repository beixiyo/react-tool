import type { ChatMessage } from '../../types'
import { Icon } from 'comps'
import { Trash2 } from 'lucide-react'
import { memo } from 'react'
import { getMessageBackgroundClasses } from '../../messages/utils/styles'
import { MessageContent } from './MessageContent'

type AssistantMessageProps = {
  message: ChatMessage
  onDelete?: (messageId: string) => void
}

export const AssistantMessage = memo<AssistantMessageProps>(({ message, onDelete }) => {
  const bgCls = getMessageBackgroundClasses(message, false)

  return (
    <div className="w-full">
      <MessageContent message={ message } isUser={ false } bgCls={ bgCls } />

      { onDelete
        && <Icon
          icon={ Trash2 }
          size={ 14 }
          className="absolute top-1 size-6 opacity-0 -right-8 group-hover:opacity-100"
          onClick={ () => onDelete?.(message.id) }
        /> }
    </div>
  )
})

AssistantMessage.displayName = 'AssistantMessage'
