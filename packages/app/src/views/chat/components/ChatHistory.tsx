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
    density = 'comfortable',
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
      const isSystemType = (t?: ChatMessage['type']) => t === 'thinking-start' || t === 'thinking-end' || t === 'loading'
      const scale = density === 'compact'
        ? { tiny: 'mt-1', small: 'mt-2', normal: 'mt-3', medium: 'mt-4', large: 'mt-6', xlarge: 'mt-8' }
        : { tiny: 'mt-2', small: 'mt-3', normal: 'mt-4', medium: 'mt-6', large: 'mt-8', xlarge: 'mt-10' }

      const topMarginClass = (() => {
        if (index === 0)
          return ''

        const prevType = prevMessage?.type
        const curType = message.type

        /** 思考/加载类信息整体更紧凑 */
        if (isSystemType(curType)) {
          if (prevMessage && isSystemType(prevType) && isSameSender)
            return scale.tiny
          return scale.small
        }

        /** 卡片与其他类型需要更大的留白 */
        if (curType === 'card' || prevType === 'card')
          return scale.xlarge

        /** 说话人切换需要更明显的分隔 */
        if (!isSameSender)
          return scale.large

        /** 同一说话人的常规消息 */
        return scale.normal
      })()

      return (
        <MessageItem
          key={ message.id }
          message={ message }
          onDelete={ () => onDeleteMessage?.(message.id) }
          className={ cn(
            'w-full',
            topMarginClass,
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
  /**
   * 间距密度，控制整体疏密度
   * - comfortable：默认风格，更宽松
   * - compact：更紧凑，适合“思考过程 / 正文”连续展示
   * @default 'comfortable'
   */
  density?: 'comfortable' | 'compact'
} & React.HTMLAttributes<HTMLDivElement>
