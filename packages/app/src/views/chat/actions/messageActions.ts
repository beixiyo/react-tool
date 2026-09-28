import { uniqueId } from '@jl-org/tool'
import { MAX_LIVE_MESSAGES, messages } from '../store'
import type { ChatMessage } from '../types'
import type { Updater } from './updater'
import { resolveUpdater } from './updater'

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

/** 统一写入消息，并裁掉超出上限的最旧消息 */
export function setMessages(updater: Updater<ChatMessage[]>) {
  const next = resolveUpdater(messages.value, updater)
  messages.value = next.length > MAX_LIVE_MESSAGES
    ? next.slice(-MAX_LIVE_MESSAGES)
    : next
}

/** 创建并追加用户问题 */
export function createQuestion(content: string, images?: string[]) {
  const message = createBaseMessage({
    content,
    sender: 'user',
    images: images?.map((url) => ({ url })),
  })
  setMessages((prev) => [...prev, message])
  return message
}

/** 创建并追加加载占位消息 */
export function createLoading() {
  const message = createBaseMessage({ type: 'loading' })
  setMessages((prev) => [...prev, message])
  return message
}

/** 创建尚未写入列表的思考消息 */
export function createThink(content: string) {
  const message = createBaseMessage({
    content,
    type: 'thinking-start',
  })
  return message
}

/** 创建并追加助手回答 */
export function createAnswer(partialMessage: Partial<ChatMessage>) {
  const message = createBaseMessage(partialMessage)
  setMessages((prev) => [...prev, message])
  return message
}

/** 删除指定消息 */
export function removeMessage(id: string) {
  setMessages((prev) => prev.filter((message) => message.id !== id))
}

/** 按 ID 合并更新消息 */
export function updateById(id: string, partialMessage: Partial<ChatMessage>) {
  setMessages((prev) => {
    const index = prev.findIndex((m) => m.id === id)
    if (index === -1) return prev
    return [
      ...prev.slice(0, index),
      { ...prev[index], ...partialMessage },
      ...prev.slice(index + 1),
    ]
  })
}

/** 将思考消息切换为完成状态 */
export function thinkEnd(id: string, content?: string) {
  updateById(id, {
    type: 'thinking-end',
    ...(content && { content }),
  })
}

/** Chat 消息列表 signal */
export { messages }
