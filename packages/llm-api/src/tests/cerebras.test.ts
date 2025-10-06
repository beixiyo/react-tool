import { cerebrasApi, CerebrasModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * Cerebras API 测试
 */
export async function testCerebras() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 Cerebras API...')

  try {
    const data = await cerebrasApi.chatCompletions({
      question,
      messages: historyMessages,
      model: CerebrasModelEnum.Llama_4_Scout,
      stream: true,
      onStream: createStreamHandler('Cerebras', cerebrasApi),
    })

    console.log('✅ Cerebras API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ Cerebras API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 Cerebras 测试
 */
export async function runCerebrasTest() {
  await testCerebras()
}
