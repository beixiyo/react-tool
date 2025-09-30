import type { AiCollaborationStore } from './types'

/**
 * 协作页面默认配置
 * @note 讨论轮数和方案数量已移除，由 AI 自动决定
 */
export const DEFAULT_SESSION_CONFIG: AiCollaborationStore['config'] = {
  contextSessionIds: [],
  mode: 'auto',
  enableContextCompression: true,
  enableParallelAgents: false,
  maxCandidateCount: 5,
  decisionPolicy: 'manual',
  autoArchiveResolvedThreads: true,
}

/**
 * 模拟存储 key
 */
export const HISTORY_STORAGE_KEY = 'ai-collaboration-history'
