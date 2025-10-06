import { glmApi, GlmModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * GLM API 测试
 */
export async function testGlm() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 GLM API...')

  try {
    const data = await glmApi.chatCompletions({
      question,
      messages: historyMessages,
      model: GlmModelEnum.GLM_4_5_Flash,
      stream: true,
      onStream: createStreamHandler('GLM', glmApi),
    })

    console.log('✅ GLM API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ GLM API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 GLM 测试
 */
export async function runGlmTest() {
  await testGlm()
}
