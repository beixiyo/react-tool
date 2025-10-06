import { mistralApi, MistralModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * Mistral API 测试
 */
export async function testMistral() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 Mistral API...')

  try {
    const data = await mistralApi.chatCompletions({
      question,
      messages: historyMessages,
      model: MistralModelEnum.Codestral_2405,
      stream: true,
      onStream: createStreamHandler('Mistral', mistralApi),
    })

    console.log('✅ Mistral API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ Mistral API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 Mistral 测试
 */
export async function runMistralTest() {
  await testMistral()
}
