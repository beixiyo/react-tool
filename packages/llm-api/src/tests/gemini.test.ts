import type { CommonOpenAiApi } from '../lib'
import { geminiApi, GeminiModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * Gemini API 测试
 */
export async function testGemini() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 Gemini API...')

  try {
    const data = await geminiApi.chatCompletions({
      /** 使用历史消息，不传 question */
      messages: historyMessages,
      /** 或者同时传入 question 和 messages */
      question,
      model: GeminiModelEnum.Gemini_25_Flash_Lite,
      stream: true,
      onStream: createStreamHandler('Gemini', geminiApi as unknown as CommonOpenAiApi),
    })

    console.log('✅ Gemini API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ Gemini API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 Gemini 测试
 */
export async function runGeminiTest() {
  await testGemini()
}
