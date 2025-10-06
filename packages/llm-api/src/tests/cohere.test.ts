import { cohereApi, CohereModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * Cohere API 测试
 */
export async function testCohere() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 Cohere API...')

  try {
    const data = await cohereApi.chatCompletions({
      question,
      messages: historyMessages,
      model: CohereModelEnum.Command_A,
      stream: true,
      onStream: createStreamHandler('Cohere', cohereApi),
    })

    console.log('✅ Cohere API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ Cohere API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 Cohere 测试
 */
export async function runCohereTest() {
  await testCohere()
}
