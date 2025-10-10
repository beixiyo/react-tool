import type { ClarificationSession } from '../types'

/**
 * 基于规则的需求澄清服务（模拟 LLM 交互）
 * 使用简单规则来判断需求是否清晰，以及生成澄清问题
 */

/**
 * 判断需求是否需要澄清（使用简单规则模拟）
 * @param requirement 用户输入的需求
 * @returns 判断结果，包括是否需要澄清和原因
 */
export async function analyzRequirementClarity(requirement: string): Promise<{
  needsClarification: boolean
  reason?: string
  initialQuestion?: string
}> {
  /** 模拟 API 延迟 */
  await new Promise(resolve => setTimeout(resolve, 300))

  /** 1. 需求太短 */
  if (requirement.trim().length < 20) {
    return {
      needsClarification: true,
      reason: '需求描述过于简短，缺少必要的细节信息',
      initialQuestion: '能否详细描述一下你的需求？包括想要实现什么功能、面向什么用户等。',
    }
  }

  /** 2. 检查关键信息维度 */
  const hasGoalKeywords = /目标|目的|为了|希望|想要|需要|实现/.test(requirement)
  const hasUserKeywords = /用户|客户|使用者|角色|管理员/.test(requirement)
  const hasFeatureKeywords = /功能|特性|模块|系统|平台/.test(requirement)
  const hasConstraintKeywords = /时间|预算|技术栈|限制|要求|性能/.test(requirement)

  const hasInfo = [hasGoalKeywords, hasUserKeywords, hasFeatureKeywords, hasConstraintKeywords]
  const missingCount = hasInfo.filter(v => !v).length

  /** 缺少 2 个或以上维度的信息 */
  if (missingCount >= 2) {
    const questions = []

    if (!hasGoalKeywords) {
      questions.push('这个需求的主要目标是什么？希望解决什么问题？')
    }
    if (!hasUserKeywords) {
      questions.push('这个功能的目标用户是谁？他们的使用场景是什么？')
    }
    if (!hasFeatureKeywords) {
      questions.push('需要包含哪些主要功能模块？')
    }
    if (!hasConstraintKeywords) {
      questions.push('有什么技术限制、时间要求或性能要求吗？')
    }

    return {
      needsClarification: true,
      reason: `需求缺少关键信息维度（${missingCount} 个维度缺失）`,
      initialQuestion: questions[0],
    }
  }

  /** 3. 包含模糊词汇 */
  const vagueWords = ['可能', '也许', '大概', '差不多', '类似', '之类', '等等', '什么的', '或者']
  const hasVagueWords = vagueWords.some(word => requirement.includes(word))

  if (hasVagueWords) {
    return {
      needsClarification: true,
      reason: '需求中包含模糊表述，需要进一步明确',
      initialQuestion: '我注意到需求中有一些不太明确的表述，能否更具体地说明一下你的期望？',
    }
  }

  /** 需求足够清晰 */
  return {
    needsClarification: false,
    reason: '需求描述清晰完整，包含必要的信息',
  }
}

/**
 * 生成澄清问题（使用预定义问题模拟）
 * @param requirement 原始需求
 * @param conversationHistory 历史对话记录
 * @returns 下一个澄清问题
 */
export async function generateNextClarificationQuestion(
  requirement: string,
  conversationHistory: { role: 'user' | 'assistant', content: string }[],
): Promise<string> {
  /** 模拟 API 延迟 */
  await new Promise(resolve => setTimeout(resolve, 300))

  /** 预定义的后续问题池 */
  const followUpQuestions = [
    '了解了。那么在性能方面，有什么具体要求吗？比如响应时间、并发量等。',
    '明白了。关于用户体验，你希望界面风格是什么样的？简洁、专业还是其他风格？',
    '好的。这个功能需要集成第三方服务吗？比如支付、地图、推送等。',
    '清楚了。对于数据安全和隐私，有特殊要求吗？',
    '了解。预计的用户规模大概是多少？这将影响技术方案的选择。',
    '明白。是否需要考虑移动端适配？',
  ]

  /** 根据对话轮数选择问题 */
  const roundIndex = Math.floor(conversationHistory.length / 2)
  const questionIndex = Math.min(roundIndex, followUpQuestions.length - 1)

  return followUpQuestions[questionIndex]
}

/**
 * 判断是否需要继续澄清（使用简单规则模拟）
 * @param session 澄清会话
 * @returns 是否需要继续澄清和下一个问题
 */
export async function shouldContinueClarification(session: ClarificationSession): Promise<{
  shouldContinue: boolean
  nextQuestion?: string
  summary?: string
}> {
  /** 模拟 API 延迟 */
  await new Promise(resolve => setTimeout(resolve, 300))

  /** 计算对话轮数（一问一答为一轮） */
  const conversationRounds = Math.floor(session.messages.length / 2)

  /** 规则 1: 超过 3 轮对话，结束澄清 */
  if (conversationRounds >= 3) {
    return {
      shouldContinue: false,
      summary: '非常感谢你的详细补充！根据你提供的信息，我已经充分理解了需求的核心要点，现在可以开始生成技术方案了。',
    }
  }

  /** 规则 2: 检查是否已收集足够信息 */
  const userAnswers = session.messages
    .filter(m => m.sender === 'user')
    .map(m => m.content)
    .join(' ')

  const hasPerformanceInfo = /性能|响应|并发|速度|快|慢/.test(userAnswers)
  const hasUIInfo = /界面|UI|风格|设计|美观|简洁/.test(userAnswers)
  const hasIntegrationInfo = /集成|第三方|API|接口|服务/.test(userAnswers)
  const hasSecurityInfo = /安全|隐私|权限|加密/.test(userAnswers)

  const collectedDimensions = [hasPerformanceInfo, hasUIInfo, hasIntegrationInfo, hasSecurityInfo].filter(v => v).length

  /** 如果已收集 2 个以上维度的信息，结束澄清 */
  if (collectedDimensions >= 2) {
    return {
      shouldContinue: false,
      summary: '明白了。根据你的补充，我已经了解了需求的主要方面，接下来我会为你生成几个技术方案供选择。',
    }
  }

  /** 继续澄清，生成下一个问题 */
  const conversationHistory = session.messages.map(msg => ({
    role: msg.sender,
    content: msg.content,
  }))

  const nextQuestion = await generateNextClarificationQuestion(
    session.originalRequirement,
    conversationHistory,
  )

  return {
    shouldContinue: true,
    nextQuestion,
  }
}

/**
 * 整合澄清结果，生成最终需求（使用简单拼接模拟）
 * @param session 澄清会话
 * @returns 整合后的最终需求
 */
export async function synthesizeClarifiedRequirement(session: ClarificationSession): Promise<string> {
  /** 模拟 API 延迟 */
  await new Promise(resolve => setTimeout(resolve, 300))

  const userAnswers = session.messages
    .filter(msg => msg.sender === 'user')
    .map((msg, index) => `${index + 1}. ${msg.content}`)
    .join('\n')

  /** 简单整合原始需求和补充信息 */
  return `${session.originalRequirement}

**补充说明：**
${userAnswers}`
}
