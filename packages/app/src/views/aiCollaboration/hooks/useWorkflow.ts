/**
 * AI Workflow 状态管理
 */

import type {
  AiWorkflowStore,
  BriefSolution,
  DetailedSolution,
  DiscussionMessage,
  Question,
  WorkflowSession,
  WorkflowStage,
} from '../types'
import { createProxy } from 'hooks'
import { WorkflowStage as Stage } from '../types'

const initialState: AiWorkflowStore = {
  currentSession: null,
  historyList: [],
  selectedHistoryId: '',
  stage: Stage.INFO_COLLECTION,
  isGenerating: false,
  generationProgress: 0,
  currentStep: '',
  generationLogs: [],
  currentQuestions: [],
  showQuestionDialog: false,
  showDiscussionDialog: false,
  error: null,
}

export const workflowStore = createProxy(initialState)

/**
 * 创建新的工作流会话
 */
export function createNewWorkflow(requirement: string) {
  const now = Date.now()
  const session: WorkflowSession = {
    id: crypto.randomUUID(),
    title: requirement.slice(0, 30) + (requirement.length > 30
      ? '...'
      : ''),
    requirement,
    stage: Stage.INFO_COLLECTION,
    collectedAnswers: {},
    discussionMessages: [],
    createdAt: now,
    updatedAt: now,
  }

  workflowStore.currentSession = session
  workflowStore.stage = Stage.INFO_COLLECTION
  workflowStore.selectedHistoryId = ''
  workflowStore.error = null

  /** 添加到历史列表 */
  workflowStore.historyList.unshift(session)

  return session
}

/**
 * 更新会话阶段
 */
export function updateStage(stage: WorkflowStage) {
  workflowStore.stage = stage
  if (workflowStore.currentSession) {
    workflowStore.currentSession.stage = stage
    workflowStore.currentSession.updatedAt = Date.now()
  }
}

/**
 * 显示问题对话框
 */
export function showQuestions(questions: Question[]) {
  workflowStore.currentQuestions = questions
  workflowStore.showQuestionDialog = true
}

/**
 * 关闭问题对话框
 */
export function closeQuestionDialog() {
  workflowStore.showQuestionDialog = false
}

/**
 * 提交答案
 */
export function submitAnswers(answers: Record<string, string>) {
  if (!workflowStore.currentSession)
    return

  workflowStore.currentSession.collectedAnswers = {
    ...workflowStore.currentSession.collectedAnswers,
    ...answers,
  }
  workflowStore.currentSession.updatedAt = Date.now()
  closeQuestionDialog()
}

/**
 * 设置简略方案列表
 */
export function setBriefSolutions(solutions: BriefSolution[], summary: string) {
  if (!workflowStore.currentSession)
    return

  workflowStore.currentSession.briefSolutions = solutions
  workflowStore.currentSession.updatedAt = Date.now()
  updateStage(Stage.SOLUTION_SELECTION)
}

/**
 * 选择简略方案
 */
export function selectBriefSolution(solutionId: string) {
  if (!workflowStore.currentSession)
    return

  workflowStore.currentSession.selectedBriefSolutionId = solutionId
  workflowStore.currentSession.updatedAt = Date.now()
}

/**
 * 开始讨论
 */
export function startDiscussion() {
  workflowStore.showDiscussionDialog = true
  updateStage(Stage.SOLUTION_DISCUSSION)
}

/**
 * 关闭讨论对话框
 */
export function closeDiscussionDialog() {
  workflowStore.showDiscussionDialog = false
}

/**
 * 添加讨论消息
 */
export function addDiscussionMessage(content: string, sender: 'user' | 'assistant') {
  if (!workflowStore.currentSession)
    return

  const message: DiscussionMessage = {
    id: crypto.randomUUID(),
    sender,
    content,
    timestamp: Date.now(),
  }

  workflowStore.currentSession.discussionMessages.push(message)
  workflowStore.currentSession.updatedAt = Date.now()
}

/**
 * 设置详细方案
 */
export function setDetailedSolution(solution: DetailedSolution) {
  if (!workflowStore.currentSession)
    return

  workflowStore.currentSession.detailedSolution = solution
  workflowStore.currentSession.updatedAt = Date.now()
  updateStage(Stage.COMPLETE)
}

/**
 * 开始生成（显示进度）
 */
export function startGenerating(step: string) {
  workflowStore.isGenerating = true
  workflowStore.generationProgress = 0
  workflowStore.currentStep = step
  workflowStore.generationLogs = []
}

/**
 * 更新生成进度
 */
export function updateProgress(progress: number, step: string, log?: string, logType?: 'info' | 'success' | 'warning' | 'error') {
  workflowStore.generationProgress = progress
  workflowStore.currentStep = step

  if (log) {
    workflowStore.generationLogs.push({
      id: crypto.randomUUID(),
      message: log,
      type: logType || 'info',
      timestamp: Date.now(),
    })
  }
}

/**
 * 完成生成
 */
export function finishGenerating() {
  workflowStore.isGenerating = false
  workflowStore.generationProgress = 1
}

/**
 * 设置错误
 */
export function setError(error: string) {
  workflowStore.error = error
}

/**
 * 清除错误
 */
export function clearError() {
  workflowStore.error = null
}

/**
 * 加载历史会话
 */
export function loadHistorySession(sessionId: string) {
  const session = workflowStore.historyList.find(s => s.id === sessionId)
  if (!session)
    return

  workflowStore.currentSession = session
  workflowStore.selectedHistoryId = sessionId
  workflowStore.stage = session.stage
}
