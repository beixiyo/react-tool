import { modelscopeApi, ModelscopeModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * ModelScope API 测试
 */
export async function testModelScope() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 ModelScope API...')

  try {
    const data = await modelscopeApi.chatCompletions({
      question,
      messages: historyMessages,
      model: ModelscopeModelEnum.GLM_4_5,
      stream: true,
      onStream: createStreamHandler('ModelScope', modelscopeApi),
    })

    console.log('✅ ModelScope API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ ModelScope API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 ModelScope 测试
 */
export async function runModelScopeTest() {
  await testModelScope()
}
