import type {
  AiCollaborationStore,
  CollaborationSession,
  ContextSummary,
  PlanCandidate,
  SessionConfig,
} from '../types'
import { createProxy } from 'hooks'
import { nanoid } from 'nanoid'
import { DEFAULT_SESSION_CONFIG } from '../constants'
import { CollaborationPhase } from '../types'

const initialState: AiCollaborationStore = {
  currentSession: null,
  historyList: [],
  selectedHistoryId: '',
  selectedContextIds: [],
  isGenerating: false,
  generationProgress: 0,
  currentStep: '',
  generationLogs: [],
  requirementDraft: '',
  config: {
    ...DEFAULT_SESSION_CONFIG,
  },
  phase: CollaborationPhase.Idle,
  analysisSnapshots: [],
  planCandidates: [],
  discussionThreads: [],
  timeline: [],
  decisionDraft: null,
  selectedSchemeId: '',
  error: null,
}

export const aiCollaborationStore = createProxy(initialState)

export function createEmptySession(config: SessionConfig): CollaborationSession {
  const now = Date.now()
  return {
    id: nanoid(),
    title: '新建协作',
    requirement: '',
    requirementMetadata: {
      goals: [],
      constraints: [],
      successCriteria: [],
      references: [],
    },
    config,
    phase: CollaborationPhase.Idle,
    phaseHistory: [{ phase: CollaborationPhase.Idle, enteredAt: now }],
    contextSummaries: [],
    analysisSnapshots: [],
    planCandidates: [],
    discussionThreads: [],
    decisions: [],
    timeline: [],
    selectedSchemeId: '',
    createdAt: now,
    updatedAt: now,
    tags: [],
    notes: '',
  }
}

export function startGeneratingRequirement(requirement: string) {
  aiCollaborationStore.isGenerating = true
  aiCollaborationStore.requirementDraft = requirement
  aiCollaborationStore.generationProgress = 0
  aiCollaborationStore.currentStep = '正在分析需求...'
  aiCollaborationStore.generationLogs = []
  aiCollaborationStore.planCandidates = []
  aiCollaborationStore.selectedSchemeId = ''
}

export function setPlanCandidates(candidates: PlanCandidate[]) {
  aiCollaborationStore.planCandidates = candidates
  aiCollaborationStore.isGenerating = false
  aiCollaborationStore.generationProgress = 1
  aiCollaborationStore.currentStep = '生成完成'
}

export function selectScheme(candidateId: string) {
  aiCollaborationStore.selectedSchemeId = candidateId
  aiCollaborationStore.timeline.push({
    id: nanoid(),
    type: 'candidate',
    phase: aiCollaborationStore.phase,
    createdAt: Date.now(),
    candidateId: candidateId ?? 'unknown',
    action: candidateId
      ? 'selected'
      : 'archived',
  })
}

/**
 * 创建新的协作会话，重置所有状态
 */
export function createNewCollaboration() {
  const newSession = createEmptySession({
    ...DEFAULT_SESSION_CONFIG,
  })

  aiCollaborationStore.currentSession = newSession
  aiCollaborationStore.selectedHistoryId = ''
  aiCollaborationStore.selectedContextIds = []
  aiCollaborationStore.requirementDraft = ''
  aiCollaborationStore.config = { ...DEFAULT_SESSION_CONFIG }
  aiCollaborationStore.phase = CollaborationPhase.Idle
  aiCollaborationStore.analysisSnapshots = []
  aiCollaborationStore.planCandidates = []
  aiCollaborationStore.discussionThreads = []
  aiCollaborationStore.timeline = []
  aiCollaborationStore.decisionDraft = null
  aiCollaborationStore.selectedSchemeId = ''
  aiCollaborationStore.isGenerating = false
  aiCollaborationStore.generationProgress = 0
  aiCollaborationStore.currentStep = ''
  aiCollaborationStore.generationLogs = []
  aiCollaborationStore.error = null
}

/**
 * 将历史会话转换为上下文摘要列表
 * @param sessions 历史会话列表
 * @returns 上下文摘要列表
 */
export function convertSessionsToContexts(sessions: CollaborationSession[]): ContextSummary[] {
  return sessions
    .filter(session => session.id !== aiCollaborationStore.currentSession?.id) // 排除当前会话
    .map((session) => {
      // 计算 token 数量（简单估算：需求长度 * 1.5）
      const originalTokens = Math.round(session.requirement.length * 1.5)
      const compressedTokens = Math.round(originalTokens * 0.6) // 假设压缩率 40%

      // 根据会话阶段和方案数量判断重要性
      let importance: 'low' | 'medium' | 'high' = 'medium'
      if (session.phase === CollaborationPhase.Decision || session.phase === CollaborationPhase.Completed) {
        importance = 'high'
      }
      else if (session.phase === CollaborationPhase.Idle || session.phase === CollaborationPhase.Requirement) {
        importance = 'low'
      }

      return {
        id: session.id,
        sourceSessionId: session.id,
        title: session.title,
        summary: session.requirement.slice(0, 100) + (session.requirement.length > 100 ? '...' : ''),
        importance,
        tokens: {
          original: originalTokens,
          compressed: compressedTokens,
        },
        updatedAt: session.updatedAt,
      }
    })
    .sort((a, b) => b.updatedAt - a.updatedAt) // 按更新时间倒序排序
}

/**
 * 确认选择的方案并同步到当前会话
 * @returns 是否有选中的方案
 */
export function confirmSchemeSelection(): boolean {
  if (!aiCollaborationStore.selectedSchemeId) {
    aiCollaborationStore.error = '请先选择一个方案'
    return false
  }

  if (!aiCollaborationStore.currentSession) {
    aiCollaborationStore.error = '当前没有活动会话'
    return false
  }

  // 更新当前会话的选中方案
  aiCollaborationStore.currentSession.selectedSchemeId = aiCollaborationStore.selectedSchemeId
  aiCollaborationStore.currentSession.phase = CollaborationPhase.Decision
  aiCollaborationStore.currentSession.updatedAt = Date.now()

  // 添加到阶段历史
  if (!aiCollaborationStore.currentSession.phaseHistory.find(p => p.phase === CollaborationPhase.Decision)) {
    aiCollaborationStore.currentSession.phaseHistory.push({
      phase: CollaborationPhase.Decision,
      enteredAt: Date.now(),
    })
  }

  // 更新 store 的阶段
  aiCollaborationStore.phase = CollaborationPhase.Decision

  // 清除错误
  aiCollaborationStore.error = null

  return true
}