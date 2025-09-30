import { fakerZH_CN as faker } from '@faker-js/faker'
import { DEFAULT_SESSION_CONFIG } from './constants'
import { aiCollaborationStore } from './hooks/useAiCollab'
import {
  CollaborationPhase,
  type AiCollaborationStore,
  type AnalysisSnapshot,
  type CollaborationSession,
  type CollaborationTimelineEvent,
  type ContextSummary,
  type DiscussionMessage,
  type DiscussionThread,
  type PhaseRecord,
  type PlanCandidate,
  type PlanCandidateStatus,
  type PlanExecutionStep,
  type PlanScoreMetric,
  type PlanScorecard,
  type RequirementMetadata,
  type ResourceEstimate,
  type RiskItem,
  type SelectionDecision,
  type SessionConfig,
} from './types'

type MockCandidateBundle = {
  candidate: PlanCandidate
  thread: DiscussionThread
}

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

const PHASE_SEQUENCE: CollaborationPhase[] = [
  CollaborationPhase.Requirement,
  CollaborationPhase.Analysis,
  CollaborationPhase.Planning,
  CollaborationPhase.Discussion,
  CollaborationPhase.Decision,
]

const TOOL_PRESETS = ['Jira', 'Notion', 'Confluence', 'Figma', 'Storybook', 'Linear', 'Postman']

function generateSentences(min = 1, max = 2, separator = ' ') {
  const count = faker.number.int({ min, max })
  return Array.from({ length: count }).map(() => faker.lorem.sentence()).join(separator)
}

function generateParagraphs(min = 1, max = 2) {
  const count = faker.number.int({ min, max })
  return Array.from({ length: count }).map(() => faker.lorem.paragraph()).join('\n\n')
}

function nanoid(prefix: string) {
  return `${prefix}-${faker.string.nanoid(10)}`
}

function createRequirementMetadata(): RequirementMetadata {
  return {
    goals: faker.helpers.arrayElements(
      ['提升 DAU', '缩短交付周期', '增强协作透明度', '提升客户满意度', '降低运营成本'],
      { min: 2, max: 3 },
    ),
    constraints: faker.helpers.arrayElements(
      ['预算受限', '需兼容现有系统', '安全合规要求', '交付周期不得超过两个月'],
      { min: 1, max: 2 },
    ),
    successCriteria: faker.helpers.arrayElements(
      ['用户满意度达到 4.5', '交付后缺陷率低于 0.5%', '首周留存率提升 15%'],
      { min: 2, max: 3 },
    ),
    references: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }).map(() => ({
      id: nanoid('ref'),
      type: 'link',
      name: faker.company.catchPhrase(),
      url: faker.internet.url(),
      description: faker.lorem.sentence(),
    })),
  }
}

function createContextSummary(index: number): ContextSummary {
  return {
    id: nanoid('ctx'),
    sourceSessionId: nanoid(`session-${index}`),
    title: `上下文总结 ${index + 1}`,
    summary: faker.lorem.paragraph(),
    importance: faker.helpers.arrayElement(['low', 'medium', 'high']),
    tokens: {
      original: faker.number.int({ min: 800, max: 2400 }),
      compressed: faker.number.int({ min: 300, max: 900 }),
    },
    updatedAt: Date.now() - faker.number.int({ min: 60_000, max: 2_160_000 }),
  }
}

function createPlanExecutionStep(index: number, previousStepId?: string): PlanExecutionStep {
  const id = nanoid(`step-${index}`)
  const statusPool: PlanExecutionStep['status'][] = ['pending', 'in-progress', 'done']
  return {
    id,
    title: `阶段 ${index + 1}: ${faker.company.buzzPhrase()}`,
    description: generateSentences(1, 2),
    estimatedDays: faker.number.int({ min: 3, max: 12 }),
    owners: faker.helpers.arrayElements([
      faker.person.fullName(),
      faker.person.fullName(),
      faker.person.fullName(),
    ], { min: 1, max: 2 }),
    dependencies: previousStepId ? [previousStepId] : [],
    status: faker.helpers.arrayElement(statusPool),
  }
}

function createRiskItem(): RiskItem {
  return {
    id: nanoid('risk'),
    type: faker.helpers.arrayElement(['technical', 'product', 'timeline', 'resource']),
    description: faker.lorem.sentence(),
    mitigation: faker.lorem.sentence(),
    severity: faker.helpers.arrayElement(['low', 'medium', 'high']),
  }
}

function createResourceEstimate(): ResourceEstimate {
  const roles = ['产品经理', '前端工程师', '后端工程师', 'QA', '设计师']
  return {
    effortInPersonDays: faker.number.int({ min: 45, max: 120 }),
    team: faker.helpers.arrayElements(roles, { min: 3, max: 5 }).map(role => ({
      role,
      count: faker.number.int({ min: 1, max: role === '产品经理' ? 1 : 3 }),
    })),
    budget: faker.number.int({ min: 80_000, max: 300_000 }),
    tools: faker.helpers.arrayElements(TOOL_PRESETS, { min: 3, max: 5 }),
  }
}

function createScoreMetrics(): PlanScoreMetric[] {
  const metrics: Array<Omit<PlanScoreMetric, 'score'>> = [
    { key: 'impact', label: '业务影响', weight: 0.35 },
    { key: 'effort', label: '实施成本', weight: 0.25 },
    { key: 'risk', label: '风险水平', weight: 0.2 },
    { key: 'innov', label: '创新程度', weight: 0.2 },
  ]

  return metrics.map(metric => ({
    ...metric,
    score: faker.number.float({ min: 60, max: 95, fractionDigits: 1 }),
    rationale: faker.lorem.sentence(),
  }))
}

function createScorecard(): PlanScorecard {
  const metrics = createScoreMetrics()
  const weightedScore = metrics.reduce((acc, metric) => {
    const weight = metric.weight ?? 0.25
    return acc + metric.score * weight
  }, 0)

  return {
    overall: Number(weightedScore.toFixed(1)),
    metrics,
    summary: generateSentences(1, 2),
  }
}

function createDiscussionMessages(candidateTitle: string): DiscussionMessage[] {
  const roles: DiscussionMessage['role'][] = ['analysis', 'critique', 'refinement']
  const authors: DiscussionMessage['author'][] = ['assistant', 'stakeholder', 'user']

  return Array.from({ length: 3 }).map((_, index) => ({
    id: nanoid(`msg-${index}`),
    author: authors[index] ?? 'assistant',
    role: roles[index] ?? 'analysis',
    content:
      index === 0
        ? `初步分析：${candidateTitle} 可以解决核心痛点，重点关注交付节奏。`
        : generateSentences(1, 2),
    createdAt: Date.now() - (3 - index) * 60_000,
    metadata: {
      sentiment: faker.helpers.arrayElement(['positive', 'neutral', 'concerned']),
    },
  }))
}

function createDiscussionThread(candidate: PlanCandidate, index: number): DiscussionThread {
  const isSelected = candidate.status === 'selected'
  return {
    id: nanoid(`thread-${index}`),
    candidateId: candidate.id,
    title: `${candidate.title} 讨论串`,
    summary: faker.lorem.sentence(),
    messages: createDiscussionMessages(candidate.title),
    status: isSelected ? 'resolved' : faker.helpers.arrayElement(['active', 'archived']),
    updatedAt: candidate.updatedAt,
  }
}

function createAnalysisSnapshot(phase: CollaborationPhase, index: number): AnalysisSnapshot {
  const now = Date.now()
  return {
    id: nanoid(`snapshot-${index}`),
    phase,
    title: `${phase} 阶段洞察 ${index + 1}`,
    highlights: faker.helpers.arrayElements(
      [
        '识别到关键用户旅程存在断点',
        '当前流程需要自动化以提升效率',
        '需要引入跨团队协作仪表盘',
        '风险集中在数据同步准确性',
        '客户反馈对移动端体验期望更高',
      ],
      { min: 2, max: 3 },
    ),
    risks: faker.helpers.arrayElements(
      ['需求变更频繁', '团队资源不足', '技术实现存在不确定性'],
      { min: 0, max: 2 },
    ),
    status: 'completed',
    createdAt: now - (index + 2) * 120_000,
    updatedAt: now - (index + 1) * 90_000,
    metadata: {
      confidence: faker.number.float({ min: 0.6, max: 0.95, fractionDigits: 2 }),
    },
  }
}

function createPhaseHistory(targetPhase: CollaborationPhase): PhaseRecord[] {
  const now = Date.now()
  const phaseIndex = PHASE_SEQUENCE.indexOf(targetPhase)
  const effectiveIndex = phaseIndex === -1 ? PHASE_SEQUENCE.length - 1 : phaseIndex

  return PHASE_SEQUENCE.slice(0, effectiveIndex + 1).map((phase, index) => ({
    phase,
    enteredAt: now - (effectiveIndex - index + 1) * 180_000,
  }))
}

function buildTimeline(
  snapshots: AnalysisSnapshot[],
  bundles: MockCandidateBundle[],
  decisions: SelectionDecision[],
  phase: CollaborationPhase,
): CollaborationTimelineEvent[] {
  const analysisEvents: CollaborationTimelineEvent[] = snapshots.map(snapshot => ({
    id: nanoid('timeline'),
    type: 'analysis',
    phase: snapshot.phase,
    createdAt: snapshot.createdAt,
    snapshotId: snapshot.id,
    summary: snapshot.highlights[0] ?? '分析完成',
  }))

  const candidateEvents: CollaborationTimelineEvent[] = bundles.map(({ candidate }) => ({
    id: nanoid('timeline'),
    type: 'candidate',
    phase: CollaborationPhase.Planning,
    createdAt: candidate.createdAt,
    candidateId: candidate.id,
    action: candidate.status === 'selected' ? 'selected' : 'generated',
    note: candidate.status === 'selected' ? '标记为主要推荐方案' : faker.lorem.sentence(),
  }))

  const decisionEvents: CollaborationTimelineEvent[] = decisions.map(decision => ({
    id: nanoid('timeline'),
    type: 'decision',
    phase: phase,
    createdAt: decision.createdAt,
    decisionId: decision.id,
    outcome: decision.status,
    summary: decision.rationale,
  }))

  return [...analysisEvents, ...candidateEvents, ...decisionEvents].sort((a, b) => a.createdAt - b.createdAt)
}

function createMockCandidateBundle(index: number, total: number): MockCandidateBundle {
  const statusPool: PlanCandidateStatus[] = ['draft', 'refining', 'ready', 'selected']
  const status: PlanCandidateStatus = index === 0 ? 'selected' : faker.helpers.arrayElement(statusPool)
  const createdAt = Date.now() - faker.number.int({ min: 15, max: 45 }) * 60_000
  const updatedAt = createdAt + faker.number.int({ min: 5, max: 20 }) * 60_000

  const keyStepsCount = faker.number.int({ min: 3, max: 5 })
  const keySteps: PlanExecutionStep[] = []
  for (let stepIndex = 0; stepIndex < keyStepsCount; stepIndex += 1) {
    const previousStepId = stepIndex === 0 ? undefined : keySteps[stepIndex - 1]?.id
    keySteps.push(createPlanExecutionStep(stepIndex, previousStepId))
  }

  const candidate: PlanCandidate = {
    id: nanoid(`scheme-${index}`),
    title: `${faker.company.buzzPhrase()} 方案`,
    problemStatement: faker.lorem.paragraph(),
    approach: generateParagraphs(1, 2),
    keySteps,
    risks: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => createRiskItem()),
    resources: createResourceEstimate(),
    scorecard: createScorecard(),
    status,
    discussionThreadId: '',
    createdAt,
    updatedAt,
    tags: faker.helpers.arrayElements(
      ['敏捷迭代', '成本优化', '高风险', '创新驱动', '用户体验优先'],
      { min: 1, max: 2 },
    ),
  }

  const thread = createDiscussionThread(candidate, index)
  candidate.discussionThreadId = thread.id

  return {
    candidate,
    thread,
  }
}

export function createMockCandidateBundles(count: number): {
  candidates: PlanCandidate[]
  threads: DiscussionThread[]
  selectedCandidateId: string
} {
  const bundles = Array.from({ length: Math.max(1, count) }).map((_, index) => createMockCandidateBundle(index, count))
  const candidates = bundles.map(bundle => bundle.candidate)
  const threads = bundles.map(bundle => bundle.thread)
  const selectedCandidate = candidates.find(candidate => candidate.status === 'selected') ?? candidates[0]

  return {
    candidates,
    threads,
    selectedCandidateId: selectedCandidate ? selectedCandidate.id : '',
  }
}

export function createMockSession(overrides: Partial<CollaborationSession> = {}): CollaborationSession {
  const config: SessionConfig = {
    ...DEFAULT_SESSION_CONFIG,
    ...overrides.config,
  }

  if (!overrides.config?.discussionRounds)
    config.discussionRounds = faker.number.int({ min: 2, max: 4 })
  if (!overrides.config?.schemeCount)
    config.schemeCount = faker.number.int({ min: 2, max: 4 })
  if (!overrides.config?.contextSessionIds)
    config.contextSessionIds = []

  const { candidates, threads, selectedCandidateId } = createMockCandidateBundles(config.schemeCount)

  const phase = overrides.phase ?? CollaborationPhase.Decision
  const analysisSnapshots = overrides.analysisSnapshots ?? PHASE_SEQUENCE.slice(0, 3).map((phaseItem, index) =>
    createAnalysisSnapshot(phaseItem, index),
  )

  const decision: SelectionDecision = overrides.decisions?.[0] ?? {
    id: nanoid('decision'),
    preferredCandidateId: selectedCandidateId,
    backupCandidateIds: candidates.slice(1).map(candidate => candidate.id),
    rationale: generateSentences(1, 2),
    decidedBy: faker.person.fullName(),
    status: 'confirmed',
    createdAt: Date.now() - 5 * 60_000,
    confirmedAt: Date.now() - 4 * 60_000,
    scorecardSnapshot: candidates.find(candidate => candidate.id === selectedCandidateId)?.scorecard,
  }

  const contextSummaries = overrides.contextSummaries ?? [createContextSummary(0), createContextSummary(1)]

  const session: CollaborationSession = {
    id: overrides.id ?? nanoid('session'),
    title: overrides.title ?? `${faker.company.catchPhrase()} 协作会话`,
    requirement: overrides.requirement ?? faker.lorem.paragraph(),
    requirementMetadata: overrides.requirementMetadata ?? createRequirementMetadata(),
    config,
    phase,
    phaseHistory: overrides.phaseHistory ?? createPhaseHistory(phase),
    contextSummaries,
    analysisSnapshots,
    planCandidates: overrides.planCandidates ?? candidates,
    discussionThreads: overrides.discussionThreads ?? threads,
    decisions: overrides.decisions ?? [decision],
    timeline: overrides.timeline ?? buildTimeline(analysisSnapshots, bundlesFromCandidates(candidates, threads), [decision], phase),
    selectedSchemeId: overrides.selectedSchemeId ?? selectedCandidateId,
    createdAt: overrides.createdAt ?? Date.now() - 6 * 60_000,
    updatedAt: overrides.updatedAt ?? Date.now() - 60_000,
    archivedAt: overrides.archivedAt,
    tags: overrides.tags ?? faker.helpers.arrayElements(['产品策略', 'Beta 测试', '高优先级'], { min: 1, max: 2 }),
    notes: overrides.notes ?? faker.lorem.sentence(),
  }

  return session
}

function bundlesFromCandidates(candidates: PlanCandidate[], threads: DiscussionThread[]): MockCandidateBundle[] {
  return candidates.map((candidate, index) => ({
    candidate,
    thread: threads[index] ?? {
      id: candidate.discussionThreadId || nanoid('thread'),
      candidateId: candidate.id,
      title: `${candidate.title} 讨论`,
      summary: faker.lorem.sentence(),
      messages: createDiscussionMessages(candidate.title),
      status: 'active',
      updatedAt: candidate.updatedAt,
    },
  }))
}

export function createMockSessions(count = 3): CollaborationSession[] {
  return Array.from({ length: Math.max(1, count) }).map((_, index) =>
    createMockSession({
      title: `AI 协作演示 ${index + 1}`,
      createdAt: Date.now() - (index + 1) * 3600_000,
      updatedAt: Date.now() - index * 1800_000,
      phase: faker.helpers.arrayElement([
        CollaborationPhase.Analysis,
        CollaborationPhase.Planning,
        CollaborationPhase.Discussion,
        CollaborationPhase.Decision,
      ]),
    }),
  )
}

export function createMockStoreSlice(options: { sessionCount?: number } = {}): MockStoreSlice {
  const sessions = createMockSessions(options.sessionCount ?? 3)
  const currentSession = sessions[0]

  return {
    currentSession,
    historyList: sessions,
    selectedHistoryId: currentSession?.id ?? '',
    selectedContextIds: currentSession?.contextSummaries?.map(summary => summary.id) ?? [],
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

  aiCollaborationStore.currentSession = slice.currentSession
  aiCollaborationStore.historyList = slice.historyList
  aiCollaborationStore.selectedHistoryId = slice.selectedHistoryId
  aiCollaborationStore.selectedContextIds = slice.selectedContextIds
  aiCollaborationStore.requirementDraft = slice.requirementDraft
  aiCollaborationStore.config = slice.config
  aiCollaborationStore.phase = slice.phase
  aiCollaborationStore.analysisSnapshots = slice.analysisSnapshots
  aiCollaborationStore.planCandidates = slice.planCandidates
  aiCollaborationStore.discussionThreads = slice.discussionThreads
  aiCollaborationStore.timeline = slice.timeline
  aiCollaborationStore.decisionDraft = slice.decisionDraft
  aiCollaborationStore.selectedSchemeId = slice.selectedSchemeId
  aiCollaborationStore.isGenerating = slice.isGenerating
  aiCollaborationStore.generationProgress = slice.generationProgress
  aiCollaborationStore.error = slice.error
}


