import { typewriterEffect } from '@jl-org/tool'
import { useEffect, useRef } from 'react'
import { updateById } from '../../actions'

/**
 * 流式传输相关的 Hook
 */
export function useMessageStreaming() {
  const streamingControllers = useRef<Map<string, { stop: () => void }>>(new Map())

  /**
   * 流式更新消息内容
   */
  const streamUpdateMessage = async (
    messageId: string,
    fullContent: string,
    speed = 16,
    continueFromIndex = 0,
    skipAnimations = false,
  ) => {
    /** 如果跳过动画，直接设置完整内容 */
    if (skipAnimations) {
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

  /**
   * 停止所有流式传输
   */
  const stopAllStreaming = () => {
    streamingControllers.current.forEach((controller) => controller.stop())
    streamingControllers.current.clear()
  }

  /** 卸载时停掉所有在途打字机：清 interval + 移除 document visibilitychange 监听 + 释放闭包 */
  useEffect(() => () => {
    stopAllStreaming()
  }, [])

  return {
    streamUpdateMessage,
    stopAllStreaming,
  }
}
