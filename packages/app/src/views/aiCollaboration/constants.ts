import type { AiCollaborationStore } from './types'

/**
 * 协作页面默认配置
 */
export const DEFAULT_SESSION_CONFIG: AiCollaborationStore['config'] = {
  discussionRounds: 1,
  schemeCount: 3,
  contextSessionIds: [],
  enableContextCompression: true,
  enableParallelAgents: false,
  maxCandidateCount: 5,
  decisionPolicy: 'manual',
  autoArchiveResolvedThreads: true,
}

/**
 * 允许的讨论轮数范围
 */
export const DISCUSSION_ROUND_OPTIONS = [1, 2, 3, 4, 5] as const

/**
 * 允许的方案数量范围
 */
export const SCHEME_COUNT_OPTIONS = [1, 2, 3, 4, 5] as const

/**
 * 模拟存储 key
 */
export const HISTORY_STORAGE_KEY = 'ai-collaboration-history'


