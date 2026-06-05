import type { ChatMessage, ReportData } from './types'
import { signal } from '@preact/signals-react'
import { mockChatHistory, mockReportData } from './mockData'

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

/** 动画配置默认值（供「新对话」重置回落） */
const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  skipAnimations: false,
  streamSpeed: {
    thinking: 20,
    answer: 16,
  },
  messageDelay: 300,
}

/** 单会话存活消息上限：超出后裁掉最旧的，防止 messages 无限增长（顶部加载的历史另存于 ChatHistory 本地态，不受此限） */
export const MAX_LIVE_MESSAGES = 200

/**
 * Chat 业务状态（signal）
 *
 * 取代原先借自 `jotaiTest/jotaiTool` 的 `createUseAtoms`：
 * 后者每个组件实例都新建一组 selectAtom selector 闭包，派生 atom 被
 * selectAtom 以 selector 身份缓存进模块级 WeakMap、永不回收，挂载/HMR 越多漏越多。
 * 直接用 signal：模块级单例、读 `.value` 自动订阅、写 `.value =` 即更新，无额外缓存层。
 */

/** 消息列表 */
export const messages = signal<ChatMessage[]>(mockChatHistory)

/** 当前报告数据 */
export const currentReport = signal<ReportData | null>(mockReportData)

/** 动画配置 */
export const animationConfig = signal<AnimationConfig>(DEFAULT_ANIMATION_CONFIG)

/**
 * 新对话：重置会话状态，释放累积的 messages（回到 mock 种子）并清理报告
 *
 * 取代原 jotai 的 `useChatReset` —— 普通函数，任意位置直接调用即可
 */
export function resetChat() {
  messages.value = mockChatHistory
  currentReport.value = mockReportData
  animationConfig.value = DEFAULT_ANIMATION_CONFIG
}
