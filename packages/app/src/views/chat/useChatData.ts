import type { ChatMessage, ReportData } from './types'
import { typewriterEffect, uniqueId } from '@jl-org/tool'
import { useRef } from 'react'
import { useImmer } from 'use-immer'
import { mockChatHistory, mockReportData } from './mockData'

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

export function useChatData() {
  /** 测试各种类型的消息 */
  const [messages, setMessages] = useImmer<ChatMessage[]>(mockChatHistory)
  /** 当前报告数据 */
  const [currentReport, setCurrentReport] = useImmer<ReportData | null>(mockReportData)
  /** 流式传输控制器 */
  const streamingControllers = useRef<Map<string, { stop: () => void }>>(new Map())
  /** 动画配置 */
  const [animationConfig, setAnimationConfig] = useImmer({
    /** 是否跳过所有动画 */
    skipAnimations: false,
    /** 流式传输速度 */
    streamSpeed: {
      thinking: 20,
      answer: 16,
    },
    /** 消息显示延迟 */
    messageDelay: 300,
  })

  const createQuestion = (content: string) => {
    const message = createBaseMessage({
      content,
      sender: 'user',
    })
    setMessages((draft) => {
      draft.push(message)
    })
    return message
  }

  const createLoading = () => {
    const message = createBaseMessage({ type: 'loading' })
    setMessages((draft) => {
      draft.push(message)
    })
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
    setMessages((draft) => {
      draft.push(message)
    })
    return message
  }

  function removeMessage(id: string) {
    setMessages(prev => prev.filter(message => message.id !== id))
  }

  const updateById = (id: string, partialMessage: Partial<ChatMessage>) => {
    setMessages((draft) => {
      const message = draft.find(m => m.id === id)
      if (message)
        Object.assign(message, partialMessage)
    })
  }

  const thinkEnd = (id: string, content?: string) => {
    updateById(id, {
      type: 'thinking-end',
      ...(content && { content }),
    })
  }

  /**
   * 流式更新消息内容
   */
  const streamUpdateMessage = async (
    messageId: string,
    fullContent: string,
    speed = 16,
    continueFromIndex = 0,
  ) => {
    /** 如果跳过动画，直接设置完整内容 */
    if (animationConfig.skipAnimations) {
      updateById(messageId, { content: fullContent })
      return
    }

    /** 停止之前的流式传输（如果存在） */
    const existingController = streamingControllers.current.get(messageId)
    if (existingController) {
      existingController.stop()
      streamingControllers.current.delete(messageId)
    }

    const controller = typewriterEffect({
      content: fullContent,
      speed,
      continueFromIndex,
      onUpdate: (partialContent) => {
        updateById(messageId, { content: partialContent })
      },
    })

    streamingControllers.current.set(messageId, controller)

    try {
      await controller.promise
    }
    finally {
      streamingControllers.current.delete(messageId)
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim())
      return

    createQuestion(content)

    const loadingMessage = createLoading()

    const thinkingContent = `我正在思考如何回应您的问题："${content}"...\n\n需要考虑的因素：\n1. 用户的具体需求\n2. 相关的市场数据\n3. 可能的解决方案`
    const thinkingMessage = createThink('')

    /** 使用渐进式显示替换加载消息 */
    setMessages(prev => [
      ...prev.filter(msg => msg.id !== loadingMessage.id),
      thinkingMessage,
    ])

    /** 流式显示思考内容 */
    await streamUpdateMessage(
      thinkingMessage.id,
      thinkingContent,
      animationConfig.streamSpeed.thinking,
    )

    /** 显示思考完成 - 使用 continueFromIndex 优化 */
    const additionalContent = `\n\n我已分析完您的问题："${content}"\n\n基于分析，我将从以下几个方面为您提供建议：\n1. 市场定位\n2. 竞争优势\n3. 发展策略`
    const finalThinkingContent = thinkingContent + additionalContent

    await streamUpdateMessage(
      thinkingMessage.id,
      finalThinkingContent,
      animationConfig.streamSpeed.thinking,
      thinkingContent.length, // 从已显示内容的长度开始继续
    )

    thinkEnd(thinkingMessage.id)

    const answerContent = `感谢您的问题。根据您提供的信息，我建议您考虑以下几点：\n\n1. 针对您的具体需求，可以...\n2. 从市场数据来看，目前趋势是...\n3. 建议您采取的解决方案包括...`

    /** 先创建一个空内容的回复消息 */
    const answerMessage = createAnswer({
      content: '',
      type: 'markdown',
    })

    /** 流式显示回复内容 */
    await streamUpdateMessage(
      answerMessage.id,
      answerContent,
      animationConfig.streamSpeed.answer,
    )

    updateById(answerMessage.id, {
      images: [
        {
          url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          caption: '相关解决方案示意图',
        },
      ],
      files: [
        {
          name: '解决方案详细说明.docx',
          size: 1548576,
          url: '#',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    })
  }

  /**
   * 停止所有流式传输
   */
  const stopAllStreaming = () => {
    streamingControllers.current.forEach(controller => controller.stop())
    streamingControllers.current.clear()
  }

  /**
   * 切换动画模式
   */
  const toggleAnimations = (skipAnimations?: boolean) => {
    setAnimationConfig((draft) => {
      draft.skipAnimations = skipAnimations ?? !draft.skipAnimations
    })
  }

  /**
   * 更新动画配置
   */
  const updateAnimationConfig = (config: Partial<typeof animationConfig>) => {
    setAnimationConfig((draft) => {
      Object.assign(draft, config)
    })
  }

  return {
    messages,
    setMessages,
    removeMessage,
    sendMessage,
    createQuestion,
    createLoading,
    createThink,
    createAnswer,
    updateById,
    thinkEnd,
    currentReport,
    setCurrentReport,
    stopAllStreaming,
    animationConfig,
    toggleAnimations,
    updateAnimationConfig,
  }
}
