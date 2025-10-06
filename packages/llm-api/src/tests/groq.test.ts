import { groqApi, GroqModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * Groq API 测试
 */
export async function testGroq() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 Groq API...')

  try {
    const data = await groqApi.chatCompletions({
      question,
      messages: historyMessages,
      model: GroqModelEnum.DeepSeek_R1_Distill_Llama_70B,
      stream: true,
      onStream: createStreamHandler('Groq', groqApi),
    })

    console.log('✅ Groq API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ Groq API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 Groq 测试
 */
export async function runGroqTest() {
  await testGroq()
}
