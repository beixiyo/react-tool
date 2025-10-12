/**
 * 工作流相关类型定义
 * 从 newRequirement/newType.ts 迁移并扩展
 */

/**
 * 工作流阶段
 */
export enum WorkflowStage {
  /** 信息收集阶段 */
  INFO_COLLECTION = 'info_collection',
  /** 简略方案生成阶段 */
  BRIEF_SOLUTION_GENERATION = 'brief_solution_generation',
  /** 方案选择阶段 */
  SOLUTION_SELECTION = 'solution_selection',
  /** 方案讨论阶段 */
  SOLUTION_DISCUSSION = 'solution_discussion',
  /** 详细方案生成阶段 */
  DETAILED_SOLUTION_GENERATION = 'detailed_solution_generation',
  /** 完成 */
  COMPLETE = 'complete',
}

/**
 * 缺失方面
 */
export type MissingAspect = {
  /** 缺失的方面 */
  aspect: string
  /** 缺失原因 */
  reason: string
}

/**
 * 问题选项
 */
export type Question = {
  /** 问题唯一标识 */
  id: string
  /** 问题内容 */
  question: string
  /** 问题所属方面 */
  aspect: string
  /** 是否必填 */
  isRequired: boolean
}

/**
 * 问题列表
 */
export type QuestionList = {
  /** 引导消息 */
  message: string
  /** 问题列表 */
  questions: Question[]
}

/**
 * 完整性检查结果
 */
export type CompletenessCheckResult = {
  /** 是否完整 */
  isComplete: boolean
  /** 缺失的方面（如果不完整） */
  missingAspects: MissingAspect[]
  /** 对当前需求的简短分析（2-3 句话） */
  analysis: string
}

/**
 * 简略方案
 */
export type BriefSolution = {
  /** 方案唯一标识 */
  id: string
  /** 方案名称 */
  name: string
  /** 核心思路（2-3 句话） */
  coreConcept: string
  /** 主要技术栈 */
  techStack: string[]
  /** 优势（2-3 条） */
  advantages: string[]
  /** 劣势/风险（2-3 条） */
  disadvantages: string[]
  /** 适用场景 */
  suitableFor: string
  /** 预估复杂度 */
  complexity?: 'low' | 'medium' | 'high'
}

/**
 * 简略方案列表（LLM 自由决定数量）
 */
export type BriefSolutionList = {
  /** 方案列表（1-N 个） */
  solutions: BriefSolution[]
  /** 总结性说明 */
  summary: string
}

/**
 * 详细方案
 */
export type DetailedSolution = {
  /** 方案名称 */
  name: string
  /** 方案概述 */
  overview: string
  /** 技术架构描述 */
  architecture: string
  /** 技术选型（键值对，如 "前端框架": "React"） */
  techStack: Record<string, string>
  /** 实施步骤 */
  implementationSteps: string[]
  /** 优势分析 */
  advantages: string[]
  /** 劣势分析 */
  disadvantages: string[]
  /** 风险列表 */
  risks: string[]
  /** 开发成本估算 */
  developmentCost: string
  /** 维护成本估算 */
  maintenanceCost: string
}

/**
 * SSE 流式事件类型
 */
export enum SseEventType {
  /** 思考过程 */
  THINKING = 'thinking',
  /** 内容增量 */
  CONTENT = 'content',
  /** 完成事件 */
  DONE = 'done',
  /** 错误事件 */
  ERROR = 'error',
}

/**
 * SSE 流式事件
 */
export type SseEvent
  = | {
    type: SseEventType.THINKING
    delta: string
  }
  | {
    type: SseEventType.CONTENT
    delta: string
  }
  | {
    type: SseEventType.DONE
    result: any
  }
  | {
    type: SseEventType.ERROR
    message: string
  }

/**
 * 讨论消息
 */
export type DiscussionMessage = {
  /** 消息 ID */
  id: string
  /** 发送者 */
  sender: 'user' | 'assistant'
  /** 消息内容 */
  content: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 工作流会话
 */
export type WorkflowSession = {
  /** 会话 ID */
  id: string
  /** 工作流 ID（后端返回） */
  workflowId?: string
  /** 标题 */
  title: string
  /** 原始需求 */
  requirement: string
  /** 当前阶段 */
  stage: WorkflowStage
  /** 收集的答案 */
  collectedAnswers: Record<string, string>
  /** 完整性检查结果 */
  completenessCheck?: CompletenessCheckResult
  /** 简略方案列表 */
  briefSolutions?: BriefSolution[]
  /** 选中的简略方案 ID */
  selectedBriefSolutionId?: string
  /** 讨论消息列表 */
  discussionMessages: DiscussionMessage[]
  /** 详细方案 */
  detailedSolution?: DetailedSolution
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}
