import type React from 'react'

export type AiCollaborationPageProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/**
 * 描述协作页面所处的阶段
 */
export enum CollaborationPhase {
  Idle = 'idle',
  Requirement = 'requirement',
  Analysis = 'analysis',
  Planning = 'planning',
  Discussion = 'discussion',
  Decision = 'decision',
  Completed = 'completed',
  Archived = 'archived',
}

/**
 * 会话配置项
 */
export type SessionConfig = {
  discussionRounds: number
  schemeCount: number
  contextSessionIds: string[]
  enableContextCompression?: boolean
  enableParallelAgents?: boolean
  maxCandidateCount?: number
  decisionPolicy?: 'manual' | 'score-based'
  autoArchiveResolvedThreads?: boolean
}

export type RequirementAttachment = {
  id: string
  type: 'link' | 'document' | 'image' | 'file' | 'note'
  name: string
  url?: string
  description?: string
}

export type RequirementMetadata = {
  goals?: string[]
  constraints?: string[]
  successCriteria?: string[]
  references?: RequirementAttachment[]
}

export type ContextSummary = {
  id: string
  sourceSessionId: string
  title: string
  summary: string
  importance: 'low' | 'medium' | 'high'
  tokens?: {
    original: number
    compressed: number
  }
  updatedAt: number
}

export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'error'

export type AnalysisSnapshot = {
  id: string
  phase: CollaborationPhase
  title: string
  highlights: string[]
  risks?: string[]
  status: AnalysisStatus
  createdAt: number
  updatedAt: number
  metadata?: Record<string, unknown>
}

export type ExecutionStatus = 'pending' | 'in-progress' | 'blocked' | 'done'

export type PlanExecutionStep = {
  id: string
  title: string
  description: string
  estimatedDays?: number
  owners?: string[]
  dependencies?: string[]
  status: ExecutionStatus
}

export type RiskItem = {
  id: string
  type: 'technical' | 'product' | 'timeline' | 'resource' | 'unknown'
  description: string
  mitigation?: string
  severity: 'low' | 'medium' | 'high'
}

export type ResourceEstimate = {
  effortInPersonDays?: number
  team?: {
    role: string
    count: number
  }[]
  budget?: number
  tools?: string[]
}

export type PlanScoreMetric = {
  key: string
  label: string
  score: number
  weight?: number
  rationale?: string
}

export type PlanScorecard = {
  overall: number
  metrics: PlanScoreMetric[]
  summary?: string
}

export type PlanCandidateStatus
  = | 'draft'
    | 'refining'
    | 'ready'
    | 'selected'
    | 'rejected'
    | 'archived'

export type PlanCandidate = {
  id: string
  title: string
  problemStatement: string
  approach: string
  keySteps: PlanExecutionStep[]
  risks: RiskItem[]
  resources: ResourceEstimate
  scorecard: PlanScorecard
  status: PlanCandidateStatus
  discussionThreadId: string | null
  createdAt: number
  updatedAt: number
  tags?: string[]
}

export type Scheme = PlanCandidate

export type DiscussionAttachment = {
  id: string
  type: 'link' | 'document' | 'image' | 'file' | 'code' | 'other'
  name: string
  url?: string
  description?: string
}

export type DiscussionMessageRole
  = | 'question'
    | 'analysis'
    | 'critique'
    | 'refinement'
    | 'decision'
    | 'note'

export type DiscussionAuthor = 'user' | 'assistant' | 'system' | 'stakeholder'

export type DiscussionMessage = {
  id: string
  author: DiscussionAuthor
  role: DiscussionMessageRole
  content: string
  createdAt: number
  attachments?: DiscussionAttachment[]
  metadata?: Record<string, unknown>
}

export type DiscussionThreadStatus = 'active' | 'resolved' | 'archived'

export type DiscussionThread = {
  id: string
  candidateId?: string
  title: string
  summary?: string
  messages: DiscussionMessage[]
  status: DiscussionThreadStatus
  updatedAt: number
}

export type SelectionDecisionStatus = 'draft' | 'confirmed' | 'dismissed'

export type SelectionDecision = {
  id: string
  preferredCandidateId: string
  backupCandidateIds?: string[]
  rationale: string
  decidedBy: string
  status: SelectionDecisionStatus
  createdAt: number
  confirmedAt?: number
  scorecardSnapshot?: PlanScorecard
}

type TimelineEventBase = {
  id: string
  phase: CollaborationPhase
  createdAt: number
  actor?: string
}

export type CollaborationTimelineEvent
  = | (TimelineEventBase & {
    type: 'analysis'
    snapshotId: string
    summary: string
  })
  | (TimelineEventBase & {
    type: 'candidate'
    candidateId: string
    action: 'generated' | 'updated' | 'selected' | 'archived'
    note?: string
  })
  | (TimelineEventBase & {
    type: 'discussion'
    threadId: string
    messageId: string
    excerpt: string
    author: DiscussionAuthor
  })
  | (TimelineEventBase & {
    type: 'decision'
    decisionId: string
    outcome: SelectionDecisionStatus
    summary: string
  })
  | (TimelineEventBase & {
    type: 'milestone'
    title: string
    description?: string
  })

export type PhaseRecord = {
  phase: CollaborationPhase
  enteredAt: number
}

export type CollaborationSession = {
  id: string
  title: string
  requirement: string
  requirementMetadata?: RequirementMetadata
  config: SessionConfig
  phase: CollaborationPhase
  phaseHistory: PhaseRecord[]
  contextSummaries: ContextSummary[]
  analysisSnapshots: AnalysisSnapshot[]
  planCandidates: PlanCandidate[]
  discussionThreads: DiscussionThread[]
  decisions: SelectionDecision[]
  timeline: CollaborationTimelineEvent[]
  selectedSchemeId: string
  createdAt: number
  updatedAt: number
  archivedAt?: number
  tags?: string[]
  notes?: string
}

export type AiCollaborationStore = {
  currentSession: CollaborationSession | null
  historyList: CollaborationSession[]
  selectedHistoryId: string
  selectedContextIds: string[]
  isGenerating: boolean
  generationProgress: number
  requirementDraft: string
  config: SessionConfig
  phase: CollaborationPhase
  analysisSnapshots: AnalysisSnapshot[]
  planCandidates: PlanCandidate[]
  discussionThreads: DiscussionThread[]
  timeline: CollaborationTimelineEvent[]
  decisionDraft: SelectionDecision | null
  selectedSchemeId: string
  error?: string | null
}

export type HistoryManagerResult = {
  loadHistory: () => Promise<CollaborationSession[]>
  saveSession: (session: CollaborationSession) => Promise<void>
  removeSession: (sessionId: string) => Promise<void>
  clearAll: () => Promise<void>
}
