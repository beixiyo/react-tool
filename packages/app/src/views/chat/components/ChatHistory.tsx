import type { AutoScrollAnimateRef } from 'comps'
import type { ChatMessage } from '../types'
import { AutoScrollAnimate } from 'comps'
import { memo, useEffect, useRef } from 'react'
import { cn } from 'utils'
import { ChatEvent, ChatEventBus } from '../constants'
import { MessageItem } from './MessageItem'

export const ChatHistory = memo<ChatHistoryProps>((
  {
    style,
    className,
    messages = [],
    onDeleteMessage,
  },
) => {
  const autoScrollRef = useRef<AutoScrollAnimateRef>(null)

  useEffect(
    () => {
      ChatEventBus.on(ChatEvent.SetScrollToBottom, () => {
        autoScrollRef.current?.scrollToBottom()
        autoScrollRef.current?.setAutoScroll(true)
      })

      return () => {
        ChatEventBus.off(ChatEvent.SetScrollToBottom)
      }
    },
    [],
  )

  return <AutoScrollAnimate
    className={ cn(
      'space-y-8',
      'flex flex-col items-center',
      className,
    ) }
    style={ style }
    updateBy={ messages }
    fadeInMask={ false }
    ref={ autoScrollRef }
  >
    { messages.map((message, index) => {
      const prevMessage = index > 0
        ? messages[index - 1]
        : null
      const isSameSender = prevMessage && prevMessage.sender === message.sender

      return (
        <MessageItem
          key={ message.id }
          message={ message }
          onDelete={ () => onDeleteMessage?.(message.id) }
          className={ cn(
            'w-full',
            isSameSender
              ? 'mt-3'
              : '',
          ) }
        />
      )
    }) }
  </AutoScrollAnimate>
})

ChatHistory.displayName = 'ChatHistory'

export type ChatHistoryProps = {
  /**
   * 消息列表
   * @default []
   */
  messages?: ChatMessage[]
  /**
   * 删除消息时触发
   */
  onDeleteMessage?: (messageId: string) => void
} & React.HTMLAttributes<HTMLDivElement>
