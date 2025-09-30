import type {
  DiscussionMessage,
  DiscussionThread,
  PlanCandidate,
  PlanCandidateStatus,
  PlanExecutionStep,
  PlanScorecard,
  PlanScoreMetric,
  ResourceEstimate,
  RiskItem,
} from '../types'
import { fakerZH_CN as faker } from '@faker-js/faker'
import { generateParagraphs, generateSentences, nanoid, TOOL_PRESETS } from './utils'

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
    dependencies: previousStepId
      ? [previousStepId]
      : [],
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
      count: faker.number.int({ min: 1, max: role === '产品经理'
        ? 1
        : 3 }),
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
    status: isSelected
      ? 'resolved'
      : faker.helpers.arrayElement(['active', 'archived']),
    updatedAt: candidate.updatedAt,
  }
}

export function createMockCandidate(index: number, total: number): {
  candidate: PlanCandidate
  thread: DiscussionThread
} {
  const statusPool: PlanCandidateStatus[] = ['draft', 'refining', 'ready', 'selected']
  const status: PlanCandidateStatus = index === 0
    ? 'selected'
    : faker.helpers.arrayElement(statusPool)
  const createdAt = Date.now() - faker.number.int({ min: 15, max: 45 }) * 60_000
  const updatedAt = createdAt + faker.number.int({ min: 5, max: 20 }) * 60_000

  const keyStepsCount = faker.number.int({ min: 3, max: 5 })
  const keySteps: PlanExecutionStep[] = []
  for (let stepIndex = 0; stepIndex < keyStepsCount; stepIndex += 1) {
    const previousStepId = stepIndex === 0
      ? undefined
      : keySteps[stepIndex - 1]?.id
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

export function createMockCandidateBundles(count: number) {
  const bundles = Array.from({ length: Math.max(1, count) }).map((_, index) =>
    createMockCandidate(index, count),
  )
  const candidates = bundles.map(bundle => bundle.candidate)
  const threads = bundles.map(bundle => bundle.thread)
  const selectedCandidate = candidates.find(candidate => candidate.status === 'selected') ?? candidates[0]

  return {
    candidates,
    threads,
    selectedCandidateId: selectedCandidate
      ? selectedCandidate.id
      : '',
  }
}
