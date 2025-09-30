import type { AiCollaborationStore } from '../types'
import { DEFAULT_SESSION_CONFIG } from '../constants'
import { aiCollaborationStore } from '../hooks/useAiCollab'
import { CollaborationPhase } from '../types'
import { createMockSessions } from './sessions'

export { buildTimeline, createAnalysisSnapshot, createPhaseHistory, createSelectionDecision } from './analysis'
/** 导出所有mock创建函数 */
export { createMockCandidate, createMockCandidateBundles } from './candidates'
export { createMockSession, createMockSessions } from './sessions'
export { createContextSummary, createRequirementMetadata, nanoid } from './utils'

type MockStoreSlice = Pick<
  AiCollaborationStore,
  | 'currentSession'
  | 'historyList'
  | 'selectedHistoryId'
  | 'selectedContextIds'
  | 'requirementDraft'
  | 'config'
  | 'phase'
  | 'analysisSnapshots'
  | 'planCandidates'
  | 'discussionThreads'
  | 'timeline'
  | 'decisionDraft'
  | 'selectedSchemeId'
  | 'isGenerating'
  | 'generationProgress'
  | 'error'
>

export function createMockStoreSlice(options: { sessionCount?: number } = {}): MockStoreSlice {
  const sessions = createMockSessions(options.sessionCount ?? 5)
  const currentSession = sessions[0]

  return {
    currentSession,
    historyList: sessions,
    selectedHistoryId: currentSession?.id ?? '',
    selectedContextIds: [], // 不预选任何上下文，让用户手动选择
    requirementDraft: currentSession?.requirement ?? '',
    config: currentSession?.config ?? { ...DEFAULT_SESSION_CONFIG },
    phase: currentSession?.phase ?? CollaborationPhase.Requirement,
    analysisSnapshots: currentSession?.analysisSnapshots ?? [],
    planCandidates: currentSession?.planCandidates ?? [],
    discussionThreads: currentSession?.discussionThreads ?? [],
    timeline: currentSession?.timeline ?? [],
    decisionDraft: currentSession?.decisions?.[0] ?? null,
    selectedSchemeId: currentSession?.selectedSchemeId ?? '',
    isGenerating: false,
    generationProgress: 1,
    error: null,
  }
}

export function loadMockData(options: { sessionCount?: number } = {}) {
  const slice = createMockStoreSlice(options)

  /** 批量更新store状态 */
  Object.assign(aiCollaborationStore, slice)

  console.log(`🎭 Mock数据已加载: ${slice.historyList.length} 个历史会话, 当前会话包含 ${slice.planCandidates.length} 个方案`)
}

/** 开发环境自动加载mock数据的便捷函数 */
export function loadDevMockData() {
  if (process.env.NODE_ENV === 'development') {
    loadMockData({ sessionCount: 5 })
  }
}
