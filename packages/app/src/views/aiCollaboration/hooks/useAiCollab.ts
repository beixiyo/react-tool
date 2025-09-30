import type {
  AiCollaborationStore,
  CollaborationSession,
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
  aiCollaborationStore.generationProgress = 0.1
  aiCollaborationStore.planCandidates = []
  aiCollaborationStore.selectedSchemeId = ''
}

export function setPlanCandidates(candidates: PlanCandidate[]) {
  aiCollaborationStore.planCandidates = candidates
  aiCollaborationStore.isGenerating = false
  aiCollaborationStore.generationProgress = 1
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
