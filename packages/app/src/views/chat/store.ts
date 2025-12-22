import { createUseAtoms } from 'hooks'
import type { ChatMessage, ReportData } from './types'
import { mockChatHistory, mockReportData } from './mockData'
import { atomWithReset } from 'jotai/utils'

/**
 * 动画配置类型
 */
export type AnimationConfig = {
  /** 是否跳过所有动画 */
  skipAnimations: boolean
  /** 流式传输速度 */
  streamSpeed: {
    thinking: number
    answer: number
  }
  /** 消息显示延迟 */
  messageDelay: number
}

/**
 * Chat 相关的 atoms
 */
export const chatAtoms = {
  /** 消息列表 */
  messages: atomWithReset<ChatMessage[]>(mockChatHistory),
  /** 当前报告数据 */
  currentReport: atomWithReset<ReportData | null>(mockReportData),
  /** 动画配置 */
  animationConfig: atomWithReset<AnimationConfig>({
    skipAnimations: false,
    streamSpeed: {
      thinking: 20,
      answer: 16,
    },
    messageDelay: 300,
  }),
} as const

/**
 * 创建 chat 相关的全局状态 hooks
 */
export const { useAtoms: useChatAtoms, useReset: useChatReset } = createUseAtoms(chatAtoms)

