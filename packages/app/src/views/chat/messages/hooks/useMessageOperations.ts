import type { ChatMessage } from '../../types'
import { uniqueId } from '@jl-org/tool'
import { MAX_LIVE_MESSAGES, messages } from '../../store'

function createBaseMessage(partialMessage: Partial<ChatMessage>): ChatMessage {
  return {
    id: uniqueId(),
    timestamp: Date.now(),
    content: '',
    sender: 'assistant',
    type: 'text',
    ...partialMessage,
  }
}

/**
 * 消息 CRUD 操作的 Hook
 */
export function useMessageOperations() {
  /** 统一写入口：支持值或 updater，并裁掉超出上限的最旧消息 */
  const setMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    const next = typeof updater === 'function'
      ? updater(messages.value)
      : updater
    messages.value = next.length > MAX_LIVE_MESSAGES
      ? next.slice(-MAX_LIVE_MESSAGES)
      : next
  }

  const createQuestion = (content: string, images?: string[]) => {
    const message = createBaseMessage({
      content,
      sender: 'user',
      images: images?.map(url => ({ url })),
    })
    setMessages(prev => [...prev, message])
    return message
  }

  const createLoading = () => {
    const message = createBaseMessage({ type: 'loading' })
    setMessages(prev => [...prev, message])
    return message
  }

  const createThink = (content: string) => {
    const message = createBaseMessage({
      content,
      type: 'thinking-start',
    })
    return message
  }

  const createAnswer = (partialMessage: Partial<ChatMessage>) => {
    const message = createBaseMessage(partialMessage)
    setMessages(prev => [...prev, message])
    return message
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id))
  }

  const updateById = (id: string, partialMessage: Partial<ChatMessage>) => {
    setMessages((prev) => {
      const index = prev.findIndex(m => m.id === id)
      if (index === -1)
        return prev
      return [
        ...prev.slice(0, index),
        { ...prev[index], ...partialMessage },
        ...prev.slice(index + 1),
      ]
    })
  }

  const thinkEnd = (id: string, content?: string) => {
    updateById(id, {
      type: 'thinking-end',
      ...(content && { content }),
    })
  }

  return {
    messages: messages.value,
    setMessages,
    createQuestion,
    createLoading,
    createThink,
    createAnswer,
    removeMessage,
    updateById,
    thinkEnd,
  }
}
