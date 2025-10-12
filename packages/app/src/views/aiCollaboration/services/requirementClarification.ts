import { addClarificationMessage, aiCollaborationStore, createClarificationSession } from '../hooks/useAiCollab'
import {
  analyzRequirementClarity,
  shouldContinueClarification,
  synthesizeClarifiedRequirement,
} from './llmClarification'

/**
 * 需求澄清服务
 * 负责判断需求是否需要澄清，以及生成澄清问题
 */

/**
 * 启动需求澄清流程
 * @param requirement 用户输入的需求
 * @returns 是否启动了澄清流程
 */
export async function startRequirementClarification(requirement: string): Promise<boolean> {
  try {
    /** 使用 LLM 分析需求是否需要澄清 */
    const analysis = await analyzRequirementClarity(requirement)

    if (!analysis.needsClarification) {
      return false
    }

    /** 创建澄清会话，使用 LLM 生成的初始问题 */
    const initialQuestion = analysis.initialQuestion || '能否提供更多关于你的需求的细节？'
    createClarificationSession(requirement, initialQuestion)

    return true
  }
  catch (error) {
    console.error('启动需求澄清失败:', error)
    /** 出错时不启动澄清流程 */
    return false
  }
}

/**
 * 处理用户的澄清回答（调用 LLM 生成后续问题或总结）
 * @returns 是否需要继续澄清
 */
export async function processClarificationAnswer(): Promise<boolean> {
  const session = aiCollaborationStore.clarificationSession
  if (!session) {
    return false
  }

  try {
    /** 深拷贝会话数据传递给 LLM，避免 readonly 问题 */
    const sessionData = JSON.parse(JSON.stringify(session))

    /** 使用 LLM 判断是否需要继续澄清 */
    const result = await shouldContinueClarification(sessionData)

    if (!result.shouldContinue) {
      /** 生成总结 */
      const summary = result.summary || '感谢你的补充，我们现在可以开始生成方案了。'
      addClarificationMessage(summary, 'assistant', 'text')
      return false
    }

    /** 生成下一个问题 */
    const nextQuestion = result.nextQuestion || '还有其他需要补充的信息吗？'
    addClarificationMessage(nextQuestion, 'assistant', 'question')

    return true
  }
  catch (error) {
    console.error('处理澄清回答失败:', error)
    /** 出错时结束澄清 */
    addClarificationMessage('感谢你的补充信息，我们现在可以开始生成方案了。', 'assistant', 'text')
    return false
  }
}

/**
 * 从澄清会话中提取最终需求
 * @returns 最终明确的需求
 */
export async function extractClarifiedRequirement(): Promise<string> {
  const session = aiCollaborationStore.clarificationSession
  if (!session) {
    return ''
  }

  try {
    /** 深拷贝会话数据传递给 LLM，避免 readonly 问题 */
    const sessionData = JSON.parse(JSON.stringify(session))

    /** 使用 LLM 整合需求 */
    const synthesized = await synthesizeClarifiedRequirement(sessionData)
    return synthesized
  }
  catch (error) {
    console.error('提取澄清需求失败:', error)
    /** 出错时使用简单拼接 */
    const originalRequirement = session.originalRequirement
    const userAnswers = session.messages
      .filter(m => m.sender === 'user')
      .map(m => m.content)
      .join('\n\n')

    return `${originalRequirement}\n\n补充信息：\n${userAnswers}`
  }
}
