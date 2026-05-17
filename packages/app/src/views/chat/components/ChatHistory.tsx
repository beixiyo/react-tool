import type { ChatScrollModifier, ChatVirtualListHandle } from 'comps'
import type { ChatMessage } from '../types'
import { uniqueId } from '@jl-org/tool'
import { ChatVirtualList } from 'comps'
import { useLatestCallback } from 'hooks'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { ChatEvent, ChatEventBus } from '../constants'
import { MessageItem } from './MessageItem'
import { useMessageHeightEstimator } from './useMessageHeightEstimator'

const LOAD_MORE_COUNT = 8

function generateOlderMessages(count: number, beforeTimestamp: number): ChatMessage[] {
  const templates = [
    { content: '这是一条历史消息，用于测试向上加载功能。', type: 'text' as const, sender: 'user' as const },
    { content: '收到，我来帮您分析一下这个问题。\n\n根据目前的数据来看，主要有以下几个方面需要关注：\n1. 市场趋势\n2. 用户反馈\n3. 技术可行性', type: 'markdown' as const, sender: 'assistant' as const },
    { content: '好的，请继续。', type: 'text' as const, sender: 'user' as const },
    { content: '让我思考一下最佳方案...', type: 'text' as const, sender: 'assistant' as const },
  ]

  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length]
    return {
      id: uniqueId(),
      content: `[历史 #${count - i}] ${template.content}`,
      sender: template.sender,
      timestamp: beforeTimestamp - (count - i) * 60000,
      type: template.type,
    }
  })
}

export const ChatHistory = memo<ChatHistoryProps>((
  {
    style,
    className,
    messages = [],
    onDeleteMessage,
    density = 'comfortable',
  },
) => {
  const listRef = useRef<ChatVirtualListHandle>(null)
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [scrollModifier, setScrollModifier] = useState<ChatScrollModifier | null>(null)
  const loadCountRef = useRef(0)
  const [containerWidth, setContainerWidth] = useState(600)

  const { estimateHeight, calibrate } = useMessageHeightEstimator(containerWidth)

  const allMessages = [...historyMessages, ...messages]

  const handleLoadMore = useLatestCallback(async () => {
    if (!hasMore)
      return

    setScrollModifier({ id: `prepend-${Date.now()}`, type: 'prepend' })
    setShowLoading(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const earliest = allMessages[0]?.timestamp ?? Date.now()
    const older = generateOlderMessages(LOAD_MORE_COUNT, earliest)
    setHistoryMessages(prev => [...older, ...prev])
    setShowLoading(false)

    loadCountRef.current += 1
    if (loadCountRef.current >= 5) {
      setHasMore(false)
    }
  })

  useEffect(
    () => {
      ChatEventBus.on(ChatEvent.SetScrollToBottom, () => {
        listRef.current?.scrollToBottom('smooth')
      })

      return () => {
        ChatEventBus.off(ChatEvent.SetScrollToBottom)
      }
    },
    [],
  )

  useEffect(() => {
    const el = document.querySelector('.ChatHistoryContainer')
    if (!el)
      return
    setContainerWidth(el.clientWidth)
    calibrate(el as HTMLElement)

    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.round(entry.contentRect.width))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return <ChatVirtualList<ChatMessage>
    ref={ listRef }
    data={ allMessages }
    computeItemKey={ (_, item) => item.id }
    estimatedItemSize={ 100 }
    getItemEstimate={ (item, index) => estimateHeight(item, index) }
    overscan={ 8 }
    followOutput="auto"
    showLoading={ showLoading }
    scrollModifier={ scrollModifier }
    onStartReached={ handleLoadMore }
    startReachedThreshold={ 100 }
    initialAlignment="bottom"
    className={ cn('ChatHistoryContainer', className) }
    style={ style }
    itemContent={ (index, message) => {
      const prevMessage = index > 0
        ? allMessages[index - 1]
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
    } }
  />
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
   * - compact：更紧凑，适合"思考过程 / 正文"连续展示
   * @default 'comfortable'
   */
  density?: 'comfortable' | 'compact'
} & React.HTMLAttributes<HTMLDivElement>
