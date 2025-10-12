/**
 * Store 相关类型定义
 */

import type { Question, WorkflowSession, WorkflowStage } from './workflow.types'

/**
 * 生成日志
 */
export type GenerationLog = {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
}

/**
 * AI Workflow Store
 */
export type AiWorkflowStore = {
  /** 当前会话 */
  currentSession: WorkflowSession | null
  /** 历史会话列表 */
  historyList: WorkflowSession[]
  /** 选中的历史会话 ID */
  selectedHistoryId: string
  /** 当前阶段 */
  stage: WorkflowStage
  /** 是否正在生成 */
  isGenerating: boolean
  /** 生成进度 (0-1) */
  generationProgress: number
  /** 当前步骤描述 */
  currentStep: string
  /** 生成日志 */
  generationLogs: GenerationLog[]
  /** 当前问题列表 */
  currentQuestions: Question[]
  /** 是否显示问题对话框 */
  showQuestionDialog: boolean
  /** 是否显示讨论对话框 */
  showDiscussionDialog: boolean
  /** 错误信息 */
  error?: string | null
}

/**
 * 页面 Props
 */
export type AiWorkflowPageProps = {
  className?: string
  style?: React.CSSProperties
}
