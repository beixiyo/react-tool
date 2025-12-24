import type { ChatMessage } from './types'
import {
  useAnimationConfig,
  useMessageOperations,
  useMessageStreaming,
  useReport,
} from './messages/hooks'
import { messageTemplates } from './messageTemplates'

/**
 * 统一的 Chat 数据管理 Hook
 *
 * 该 Hook 组合了多个专用 Hook，提供完整的聊天功能：
 * - useMessageOperations: 消息的 CRUD 操作
 * - useMessageStreaming: 流式传输相关
 * - useAnimationConfig: 动画配置
 * - useReport: 报告管理
 */
export function useChatData() {
  const messageOps = useMessageOperations()
  const streaming = useMessageStreaming()
  const animation = useAnimationConfig()
  const report = useReport()

  async function sendMessage(content: string, files?: string[]) {
    if (!content.trim() && !files?.length)
      return

    messageOps.createQuestion(content, files)

    const loadingMessage = messageOps.createLoading()

    const thinkingContent = messageTemplates.generateThinkingContent(content)
    const thinkingMessage = messageOps.createThink('')

    /** 使用渐进式显示替换加载消息 */
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

    /** 流式显示思考内容 */
    await streaming.streamUpdateMessage(
      thinkingMessage.id,
      thinkingContent,
      animation.animationConfig.streamSpeed.thinking,
      0,
      animation.animationConfig.skipAnimations,
    )

    /** 显示思考完成 - 使用 continueFromIndex 优化 */
    const finalThinkingContent = messageTemplates.generateThinkingCompleteContent(content, thinkingContent)

    await streaming.streamUpdateMessage(
      thinkingMessage.id,
      finalThinkingContent,
      animation.animationConfig.streamSpeed.thinking,
      thinkingContent.length, // 从已显示内容的长度开始继续
      animation.animationConfig.skipAnimations,
    )

    messageOps.thinkEnd(thinkingMessage.id)

    const answerContent = messageTemplates.generateAnswerContent()

    /** 先创建一个空内容的回复消息 */
    const answerMessage = messageOps.createAnswer({
      content: '',
      type: 'markdown',
    })

    /** 流式显示回复内容 */
    await streaming.streamUpdateMessage(
      answerMessage.id,
      answerContent,
      animation.animationConfig.streamSpeed.answer,
      0,
      animation.animationConfig.skipAnimations,
    )

    messageOps.updateById(answerMessage.id, {
      images: messageTemplates.generateExampleImages(),
      files: messageTemplates.generateExampleFiles(),
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
    /** 流式传输 */
    stopAllStreaming: streaming.stopAllStreaming,
    /** 动画配置 */
    animationConfig: animation.animationConfig,
    toggleAnimations: animation.toggleAnimations,
    updateAnimationConfig: animation.updateAnimationConfig,
    /** 报告管理 */
    currentReport: report.currentReport,
    setCurrentReport: report.setCurrentReport,
  }
}
