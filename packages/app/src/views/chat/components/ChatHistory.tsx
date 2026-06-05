import type { Components, VirtuosoHandle } from 'react-virtuoso'
import type { ChatMessage } from '../types'
import { uniqueId } from '@jl-org/tool'
import { useAutoScrollBottom, useLatestCallback } from 'hooks'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { cn } from 'utils'
import { ChatEvent, ChatEventBus } from '../constants'
import { MessageItem } from './MessageItem'

const LOAD_MORE_COUNT = 8
/** 最多向上加载几批（mock 数据边界） */
const MAX_LOADS = 5
/** firstItemIndex 起点：反向无限滚动约定，prepend 时按数量递减以维持滚动位 */
const START_INDEX = 1_000_000

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
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const loadingRef = useRef(false)
  const loadCountRef = useRef(0)
  /** load-more 的 mock 延时句柄 + 挂载标记：卸载时清理，避免卸载后 setState */
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  /** 智能跟随：基于用户滚轮意图决定要不要持续钉底，用户上滚后自动停止（与 AutoScrollAnimate 复用同款 hook） */
  const {
    shouldAutoScrollRef,
    isDownScrollRef,
    bindScrollEl,
    setShouldAutoScroll,
  } = useAutoScrollBottom({ threshold: 80 })

  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  /** 反向无限滚动锚点：prepend 时递减，virtuoso 据此维持滚动位（顶部加载不跳） */
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX)

  /** memo 化稳定 data 引用 */
  const allMessages = useMemo(() => [...historyMessages, ...messages], [historyMessages, messages])

  /** 预算每条消息的顶部间距（按相邻关系），用 id 索引避免依赖 virtuoso 的绝对 index */
  const marginById = useMemo(() => {
    const map = new Map<string, string>()
    allMessages.forEach((message, index) => {
      map.set(message.id, computeTopMargin(allMessages, index, density))
    })
    return map
  }, [allMessages, density])

  /** 向上滚到顶（startReached）/ 触发加载：拉一批更早的放到顶部 */
  const handleStartReached = useLatestCallback(() => {
    if (!hasMore || loadingRef.current)
      return
    loadingRef.current = true
    setShowLoading(true)

    /** mock 异步：真实接入时换成请求，拿到数据后同样「递减 firstItemIndex + prepend」 */
    loadTimerRef.current = setTimeout(() => {
      loadTimerRef.current = null
      if (!mountedRef.current)
        return

      const earliest = allMessages[0]?.timestamp ?? Date.now()
      const older = generateOlderMessages(LOAD_MORE_COUNT, earliest)

      setFirstItemIndex(i => i - older.length)
      setHistoryMessages(prev => [...older, ...prev])
      setShowLoading(false)
      loadingRef.current = false

      loadCountRef.current += 1
      if (loadCountRef.current >= MAX_LOADS)
        setHasMore(false)
    }, 800)
  })

  /** 外部（如输入框发送）请求置底：强制恢复跟随并滚到底 */
  useEffect(
    () => ChatEventBus.on(ChatEvent.SetScrollToBottom, () => {
      setShouldAutoScroll(true)
      isDownScrollRef.current = true
      virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth', align: 'end' })
    }),
    [],
  )

  /**
   * 流式回复 / 新消息：只要还应跟随就持续滚到底；用户滚轮上滚后 hook 自动停止，不打扰阅读。
   * 依赖 messages（而非 allMessages）：向上加载历史改的是 historyMessages，不会误触发置底。
   */
  useEffect(() => {
    if (shouldAutoScrollRef.current)
      virtuosoRef.current?.scrollToIndex({ index: 'LAST', align: 'end' })
  }, [messages])

  /** 初始置底：业务卡片含异步定高内容（图表/图片），首屏测量后高度会变、易漂移，前几帧重复钉底 */
  useEffect(() => {
    let raf = 0
    let frames = 0
    const pin = () => {
      virtuosoRef.current?.scrollToIndex({ index: 'LAST', align: 'end' })
      frames += 1
      if (frames < 6)
        raf = requestAnimationFrame(pin)
    }
    raf = requestAnimationFrame(pin)
    return () => cancelAnimationFrame(raf)
  }, [])

  /** 卸载：标记并清掉 load-more 在途定时器（StrictMode 重挂会把标记复位为 true） */
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current)
        loadTimerRef.current = null
      }
    }
  }, [])

  return (
    <Virtuoso<ChatMessage, ChatHistoryContext>
      ref={ virtuosoRef }
      data={ allMessages }
      firstItemIndex={ firstItemIndex }
      initialTopMostItemIndex={ Math.max(0, allMessages.length - 1) }
      startReached={ handleStartReached }
      scrollerRef={ bindScrollEl }
      computeItemKey={ (_, message) => message.id }
      increaseViewportBy={ { top: 400, bottom: 400 } }
      components={ CHAT_COMPONENTS }
      context={ { showLoading } }
      className={ cn('ChatHistoryContainer', className) }
      /** overflow-x 收起：业务卡片偶有超宽内容，避免出现横向滚动条（对齐旧实现的裁剪行为） */
      style={ { overflowX: 'hidden', ...style } }
      itemContent={ (_, message) => (
        <MessageItem
          message={ message }
          onDelete={ () => onDeleteMessage?.(message.id) }
          className={ cn('w-full', marginById.get(message.id)) }
        />
      ) }
    />
  )
})

ChatHistory.displayName = 'ChatHistory'

/** 顶部加载提示（prepend 时显示），通过 virtuoso context 控制显隐 */
const CHAT_COMPONENTS: Components<ChatMessage, ChatHistoryContext> = {
  Header: ({ context }) => (context?.showLoading
    ? <div className="py-3 text-center text-xs text-text2">加载更早…</div>
    : null),
}

/** 根据相邻消息关系算顶部间距（说话人切换 / 卡片 / 系统消息等留白不同） */
function computeTopMargin(messages: ChatMessage[], index: number, density: Density): string {
  if (index === 0)
    return ''

  const prev = messages[index - 1]
  const cur = messages[index]
  const isSameSender = prev && prev.sender === cur.sender
  const isSystemType = (t?: ChatMessage['type']) =>
    t === 'thinking-start' || t === 'thinking-end' || t === 'loading'

  /**
   * 用 padding 而非 margin：虚拟列表按 offsetHeight 测量条目，margin 不计入会导致总高被低估、
   * scrollToIndex 永远差一个 margin 高度到不了底（表现为最后一条被输入框裁掉）。
   */
  const scale = density === 'compact'
    ? { tiny: 'pt-1', small: 'pt-2', normal: 'pt-3', medium: 'pt-4', large: 'pt-6', xlarge: 'pt-8' }
    : { tiny: 'pt-2', small: 'pt-3', normal: 'pt-4', medium: 'pt-6', large: 'pt-8', xlarge: 'pt-10' }

  /** 思考/加载类信息整体更紧凑 */
  if (isSystemType(cur.type)) {
    if (prev && isSystemType(prev.type) && isSameSender)
      return scale.tiny
    return scale.small
  }

  /** 卡片与其他类型需要更大的留白 */
  if (cur.type === 'card' || prev?.type === 'card')
    return scale.xlarge

  /** 说话人切换需要更明显的分隔 */
  if (!isSameSender)
    return scale.large

  /** 同一说话人的常规消息 */
  return scale.normal
}

type Density = 'comfortable' | 'compact'

type ChatHistoryContext = {
  showLoading: boolean
}

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
  density?: Density
} & React.HTMLAttributes<HTMLDivElement>
