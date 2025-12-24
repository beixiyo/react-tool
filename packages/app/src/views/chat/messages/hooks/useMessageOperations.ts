import type { ChatMessage } from '../../types'
import { uniqueId } from '@jl-org/tool'
import { useChatAtoms } from '../../store'

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
  const { messages, setMessages } = useChatAtoms(['messages'] as const)

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
    messages,
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
