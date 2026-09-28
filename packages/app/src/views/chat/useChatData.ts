import {
  animationConfig,
  createAnswer,
  createLoading,
  createQuestion,
  createThink,
  currentReport,
  messages,
  removeMessage,
  setCurrentReport,
  setMessages,
  thinkEnd,
  toggleAnimations,
  updateAnimationConfig,
  updateById,
} from './actions'
import { useChatSSE } from './messages/hooks/useChatSSE'
import { messageTemplates } from './messageTemplates'
import type { ChatMessage } from './types'

/**
 * 统一的 Chat 数据管理 Hook
 *
 * 该 Hook 组合 signal actions 与 SSE 生命周期，提供完整的聊天功能：
 * - messageActions: 消息的 CRUD 操作
 * - useChatSSE: SSE 流式接口调用
 * - animationActions: 动画配置
 * - reportActions: 报告管理
 */
export function useChatData() {
  const sse = useChatSSE()

  async function sendMessage(content: string, files?: string[]) {
    if (!content.trim() && !files?.length) return

    createQuestion(content, files)

    const loadingMessage = createLoading()
    const thinkingMessage = createThink('')

    /** 使用 SSE 替换加载消息 */
    setMessages((prev: ChatMessage[]) => {
      const index = prev.findIndex((msg: ChatMessage) => msg.id === loadingMessage.id)
      if (index !== -1) {
        return [
          ...prev.slice(0, index),
          thinkingMessage,
          ...prev.slice(index + 1),
        ]
      }
      return [...prev, thinkingMessage]
    })

    let thinkingAccumulatedContent = ''
    let answerAccumulatedContent = ''
    let answerMessageId: string | null = null

    /** 调用 SSE 接口获取流式响应 */
    await sse.sendChatMessage(content, {
      onThinking: (data) => {
        thinkingAccumulatedContent = data.content
        updateById(thinkingMessage.id, {
          content: thinkingAccumulatedContent,
          type: data.stage === 'complete'
            ? 'thinking-end'
            : 'thinking-start',
        })
      },
      onThinkingDone: () => {
        thinkEnd(thinkingMessage.id)
      },
      onAnswerStart: () => {
        /** 创建 answer 消息，标记为流式输出中 */
        const answerMessage = createAnswer({
          content: '',
          type: 'markdown',
          isStreaming: true,
        })
        answerMessageId = answerMessage.id
      },
      onAnswerChunk: (data) => {
        /** 如果 answer_start 事件没有到来，在第一个 chunk 时创建 answer 消息 */
        if (!answerMessageId && data.isFirst) {
          const answerMessage = createAnswer({
            content: '',
            type: 'markdown',
            isStreaming: true,
          })
          answerMessageId = answerMessage.id
        }

        answerAccumulatedContent += data.char
        if (answerMessageId) {
          updateById(answerMessageId, {
            content: answerAccumulatedContent,
            type: 'markdown',
            isStreaming: true,
          })
        }
      },
      onAnswerDone: () => {
        if (answerMessageId) {
          updateById(answerMessageId, {
            content: answerAccumulatedContent,
            type: 'markdown',
            isStreaming: false,
            images: messageTemplates.generateExampleImages(),
            files: messageTemplates.generateExampleFiles(),
          })
        }
      },
      onError: (error) => {
        console.error('SSE Error:', error)
      },
    })
  }

  return {
    /** 消息操作 */
    messages: messages.value,
    setMessages,
    removeMessage,
    createQuestion,
    createLoading,
    createThink,
    createAnswer,
    updateById,
    thinkEnd,
    /** 消息发送 */
    sendMessage,
    /** SSE 控制 */
    stopAllStreaming: sse.stop,
    /** 动画配置 */
    animationConfig: animationConfig.value,
    toggleAnimations,
    updateAnimationConfig,
    /** 报告管理 */
    currentReport: currentReport.value,
    setCurrentReport,
  }
}
