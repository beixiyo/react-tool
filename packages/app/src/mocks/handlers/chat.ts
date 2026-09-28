import { http } from 'msw'
import { streamEvents } from '../sse'

/**
 * 模拟的思考内容生成
 */
function generateThinkingContent(userQuestion: string): string {
  return `我正在思考如何回应您的问题："${userQuestion}"...\n\n需要考虑的因素：\n1. 用户的具体需求\n2. 相关的市场数据\n3. 可能的解决方案`
}

/**
 * 模拟的思考完成内容
 */
function generateThinkingCompleteContent(userQuestion: string, thinkingContent: string): string {
  const additionalContent = `\n\n我已分析完您的问题："${userQuestion}"\n\n基于分析，我将从以下几个方面为您提供建议：\n1. 市场定位\n2. 竞争优势\n3. 发展策略`
  return thinkingContent + additionalContent
}

/**
 * 模拟的回复内容
 */
function generateAnswerContent(): string {
  return `感谢您的问题。根据您提供的信息，我建议您考虑以下几点：\n\n1. 针对您的具体需求，可以采取以下方案...\n2. 从市场数据来看，目前趋势是向好的...\n3. 建议您采取的解决方案包括持续优化产品体验`
}

export const handlers = [
  /**
   * 聊天思考过程流式接口
   */
  http.post('/api/chat/thinking', async ({ request }) => {
    const body = await request.json() as { question: string }
    const question = body.question || ''

    const thinkingContent = generateThinkingContent(question)
    const finalThinkingContent = generateThinkingCompleteContent(question, thinkingContent)

    const events = [
      { type: 'thinking', data: { content: thinkingContent, stage: 'thinking' } },
      { type: 'thinking', data: { content: finalThinkingContent, stage: 'complete' } },
      { type: 'thinking', data: { done: true } },
    ]

    return streamEvents(events)
  }),

  /**
   * 聊天回复流式接口
   */
  http.post('/api/chat/answer', async ({ request }) => {
    const body = await request.json() as { question?: string }
    const question = body.question || ''

    const thinkingContent = generateThinkingContent(question)
    const finalThinkingContent = generateThinkingCompleteContent(question, thinkingContent)
    const answerContent = generateAnswerContent()

    const events = [
      { type: 'thinking_start', data: { messageId: 'thinking' } },
      { type: 'thinking', data: { content: thinkingContent, stage: 'thinking' } },
      { type: 'thinking', data: { content: finalThinkingContent, stage: 'complete' } },
      { type: 'thinking_done', data: {} },
      { type: 'answer_start', data: { messageId: 'answer' } },
      ...answerContent.split('').map((char, index) => ({
        type: 'answer_chunk',
        data: { char, isFirst: index === 0, isLast: index === answerContent.length - 1 },
      })),
      { type: 'answer_done', data: { success: true } },
    ]

    return streamEvents(events)
  }),

  /**
   * 完整聊天流式接口（一次性返回思考和回复）
   */
  http.post('/api/chat', async ({ request }) => {
    const body = await request.json() as { question: string }
    const question = body.question || ''

    const thinkingContent = generateThinkingContent(question)
    const finalThinkingContent = generateThinkingCompleteContent(question, thinkingContent)
    const answerContent = generateAnswerContent()

    const events = [
      { type: 'thinking_start', data: { messageId: 'thinking' } },
      { type: 'thinking', data: { content: thinkingContent, stage: 'thinking' } },
      { type: 'thinking', data: { content: finalThinkingContent, stage: 'complete' } },
      { type: 'thinking_done', data: {} },
      { type: 'answer_start', data: { messageId: 'answer' } },
      ...answerContent.split('').map((char, index) => ({
        type: 'answer_chunk',
        data: { char, isFirst: index === 0, isLast: index === answerContent.length - 1 },
      })),
      { type: 'answer_done', data: { success: true } },
    ]

    return streamEvents(events)
  }),
]
