import { useCallback, useEffect, useRef } from 'react'
import { http } from '@/api/httpInstance'

/**
 * SSE 事件回调类型
 */
interface SSEEvents {
  onThinking?: (data: { content: string, stage?: string }) => void
  onThinkingDone?: () => void
  onAnswerStart?: (data: { messageId?: string }) => void
  onAnswerChunk?: (data: { char: string, isFirst: boolean, isLast: boolean }) => void
  onAnswerDone?: (data: { success: boolean }) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

/**
 * Chat SSE Hook
 */
export function useChatSSE() {
  const abortRef = useRef<(() => void) | null>(null)

  /**
   * 发送聊天请求并接收流式响应
   */
  const sendChatMessage = useCallback(async (
    question: string,
    events: SSEEvents,
  ) => {
    /** 取消之前的请求 */
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
    }

    const { promise, cancel } = await http.fetchSSE('/chat', {
      method: 'POST',
      body: { question },
      /** 是否解析 JSON（默认为 true） */
      needParseJSON: true,
      /** 是否解析数据，删除 data: 前缀（默认为 true） */
      needParseData: true,
      /** SSE 分割符 */
      separator: '\n\n',
      onMessage: ({ currentJson }) => {
        /** 处理数组或单个对象 */
        const eventsArray = Array.isArray(currentJson)
          ? currentJson
          : [currentJson]

        eventsArray.forEach((item) => {
          if (!item || typeof item !== 'object')
            return

          const data = item as { type: string, data: unknown }

          switch (data.type) {
            case 'thinking_start':
              break
            case 'thinking':
              events.onThinking?.(data.data as { content: string, stage?: string })
              break
            case 'thinking_done':
              events.onThinkingDone?.()
              break
            case 'answer_start':
              events.onAnswerStart?.(data.data as { messageId?: string })
              break
            case 'answer_chunk':
              events.onAnswerChunk?.(data.data as { char: string, isFirst: boolean, isLast: boolean })
              break
            case 'answer_done':
              events.onAnswerDone?.(data.data as { success: boolean })
              break
          }
        })
      },
      onError: (error) => {
        events.onError?.(error as Error)
      },
    })

    abortRef.current = cancel

    await promise
    events.onComplete?.()
    abortRef.current = null
  }, [])

  /**
   * 停止当前请求
   */
  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
    }
  }, [])

  /** 卸载时中止在途 SSE：否则 reader 持续向常驻 store 写入并钉住整个回调闭包 */
  useEffect(() => () => {
    abortRef.current?.()
    abortRef.current = null
  }, [])

  return {
    sendChatMessage,
    stop,
  }
}
