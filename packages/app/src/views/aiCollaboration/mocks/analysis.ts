import type {
  AnalysisSnapshot,
  CollaborationTimelineEvent,
  DiscussionThread,
  PhaseRecord,
  PlanCandidate,
  SelectionDecision,
} from '../types'
import { fakerZH_CN as faker } from '@faker-js/faker'
import { CollaborationPhase } from '../types'
import { generateSentences, nanoid } from './utils'

const PHASE_SEQUENCE: CollaborationPhase[] = [
  CollaborationPhase.Requirement,
  CollaborationPhase.Analysis,
  CollaborationPhase.Planning,
  CollaborationPhase.Discussion,
  CollaborationPhase.Decision,
]

export function createAnalysisSnapshot(phase: CollaborationPhase, index: number): AnalysisSnapshot {
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

export function createPhaseHistory(targetPhase: CollaborationPhase): PhaseRecord[] {
  const now = Date.now()
  const phaseIndex = PHASE_SEQUENCE.indexOf(targetPhase)
  const effectiveIndex = phaseIndex === -1
    ? PHASE_SEQUENCE.length - 1
    : phaseIndex

  return PHASE_SEQUENCE.slice(0, effectiveIndex + 1).map((phase, index) => ({
    phase,
    enteredAt: now - (effectiveIndex - index + 1) * 180_000,
  }))
}

export function createSelectionDecision(
  candidates: PlanCandidate[],
  selectedCandidateId: string,
): SelectionDecision {
  return {
    id: nanoid('decision'),
    preferredCandidateId: selectedCandidateId,
    backupCandidateIds: candidates.filter(c => c.id !== selectedCandidateId).map(c => c.id),
    rationale: generateSentences(1, 2),
    decidedBy: faker.person.fullName(),
    status: 'confirmed',
    createdAt: Date.now() - 5 * 60_000,
    confirmedAt: Date.now() - 4 * 60_000,
    scorecardSnapshot: candidates.find(candidate => candidate.id === selectedCandidateId)?.scorecard,
  }
}

export function buildTimeline(
  snapshots: AnalysisSnapshot[],
  candidates: PlanCandidate[],
  threads: DiscussionThread[],
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

  const candidateEvents: CollaborationTimelineEvent[] = candidates.map(candidate => ({
    id: nanoid('timeline'),
    type: 'candidate',
    phase: CollaborationPhase.Planning,
    createdAt: candidate.createdAt,
    candidateId: candidate.id,
    action: candidate.status === 'selected'
      ? 'selected'
      : 'generated',
    note: candidate.status === 'selected'
      ? '标记为主要推荐方案'
      : faker.lorem.sentence(),
  }))

  const decisionEvents: CollaborationTimelineEvent[] = decisions.map(decision => ({
    id: nanoid('timeline'),
    type: 'decision',
    phase,
    createdAt: decision.createdAt,
    decisionId: decision.id,
    outcome: decision.status,
    summary: decision.rationale,
  }))

  return [...analysisEvents, ...candidateEvents, ...decisionEvents]
    .sort((a, b) => a.createdAt - b.createdAt)
}
