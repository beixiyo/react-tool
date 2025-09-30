import { fakerZH_CN as faker } from '@faker-js/faker'
import { DEFAULT_SESSION_CONFIG } from '../constants'
import { CollaborationPhase } from '../types'
import type { CollaborationSession, SessionConfig } from '../types'
import { createRequirementMetadata, createContextSummary, nanoid } from './utils'
import { createMockCandidateBundles } from './candidates'
import { createAnalysisSnapshot, createPhaseHistory, createSelectionDecision, buildTimeline } from './analysis'

const PHASE_SEQUENCE: CollaborationPhase[] = [
  CollaborationPhase.Requirement,
  CollaborationPhase.Analysis,
  CollaborationPhase.Planning,
  CollaborationPhase.Discussion,
  CollaborationPhase.Decision,
]

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

  const decision = overrides.decisions?.[0] ?? createSelectionDecision(candidates, selectedCandidateId)
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
    timeline: overrides.timeline ?? buildTimeline(analysisSnapshots, candidates, threads, [decision], phase),
    selectedSchemeId: overrides.selectedSchemeId ?? selectedCandidateId,
    createdAt: overrides.createdAt ?? Date.now() - 6 * 60_000,
    updatedAt: overrides.updatedAt ?? Date.now() - 60_000,
    archivedAt: overrides.archivedAt,
    tags: overrides.tags ?? faker.helpers.arrayElements(['产品策略', 'Beta 测试', '高优先级'], { min: 1, max: 2 }),
    notes: overrides.notes ?? faker.lorem.sentence(),
  }

  return session
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
