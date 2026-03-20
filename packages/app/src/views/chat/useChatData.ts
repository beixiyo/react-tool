import type { ChatMessage } from './types'
import {
  useAnimationConfig,
  useMessageOperations,
  useReport,
} from './messages/hooks'
import { useChatSSE } from './messages/hooks/useChatSSE'
import { messageTemplates } from './messageTemplates'

/**
 * 统一的 Chat 数据管理 Hook
 *
 * 该 Hook 组合了多个专用 Hook，提供完整的聊天功能：
 * - useMessageOperations: 消息的 CRUD 操作
 * - useChatSSE: SSE 流式接口调用
 * - useAnimationConfig: 动画配置
 * - useReport: 报告管理
 */
export function useChatData() {
  const messageOps = useMessageOperations()
  const sse = useChatSSE()
  const animation = useAnimationConfig()
  const report = useReport()

  async function sendMessage(content: string, files?: string[]) {
    if (!content.trim() && !files?.length)
      return

    messageOps.createQuestion(content, files)

    const loadingMessage = messageOps.createLoading()
    const thinkingMessage = messageOps.createThink('')

    /** 使用 SSE 替换加载消息 */
    messageOps.setMessages((prev: ChatMessage[]) => {
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
        messageOps.updateById(thinkingMessage.id, {
          content: thinkingAccumulatedContent,
          type: data.stage === 'complete'
            ? 'thinking-end'
            : 'thinking-start',
        })
      },
      onThinkingDone: () => {
        messageOps.thinkEnd(thinkingMessage.id)
      },
      onAnswerStart: () => {
        /** 创建 answer 消息，标记为流式输出中 */
        const answerMessage = messageOps.createAnswer({
          content: '',
          type: 'markdown',
          isStreaming: true,
        })
        answerMessageId = answerMessage.id
      },
      onAnswerChunk: (data) => {
        /** 如果 answer_start 事件没有到来，在第一个 chunk 时创建 answer 消息 */
        if (!answerMessageId && data.isFirst) {
          const answerMessage = messageOps.createAnswer({
            content: '',
            type: 'markdown',
            isStreaming: true,
          })
          answerMessageId = answerMessage.id
        }

        answerAccumulatedContent += data.char
        if (answerMessageId) {
          messageOps.updateById(answerMessageId, {
            content: answerAccumulatedContent,
            type: 'markdown',
            isStreaming: true,
          })
        }
      },
      onAnswerDone: () => {
        if (answerMessageId) {
          messageOps.updateById(answerMessageId, {
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
    messages: messageOps.messages,
    setMessages: messageOps.setMessages,
    removeMessage: messageOps.removeMessage,
    createQuestion: messageOps.createQuestion,
    createLoading: messageOps.createLoading,
    createThink: messageOps.createThink,
    createAnswer: messageOps.createAnswer,
    updateById: messageOps.updateById,
    thinkEnd: messageOps.thinkEnd,
    /** 消息发送 */
    sendMessage,
    /** SSE 控制 */
    stopAllStreaming: sse.stop,
    /** 动画配置 */
    animationConfig: animation.animationConfig,
    toggleAnimations: animation.toggleAnimations,
    updateAnimationConfig: animation.updateAnimationConfig,
    /** 报告管理 */
    currentReport: report.currentReport,
    setCurrentReport: report.setCurrentReport,
  }
}
