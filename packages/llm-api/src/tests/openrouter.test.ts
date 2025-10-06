import { openRouterApi, OpenRouterModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * OpenRouter API 测试
 */
export async function testOpenRouter() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 OpenRouter API...')

  try {
    const data = await openRouterApi.chatCompletions({
      question,
      messages: historyMessages, // 会自动合并历史消息和当前问题
      model: OpenRouterModelEnum.DeepSeek_V3_03_24,
      stream: true,
      onStream: createStreamHandler('OpenRouter', openRouterApi),
    })

    console.log('✅ OpenRouter API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ OpenRouter API 测试失败:', error)
    throw error
  }
}

/**
 * OpenRouter R1 模型测试
 */
export async function testOpenRouterR1() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 OpenRouter R1 API...')

  try {
    const data = await openRouterApi.chatCompletions({
      question,
      messages: historyMessages,
      model: OpenRouterModelEnum.DeepSeek_R1_0528_Qwen3_8B,
      stream: true,
      onStream: createStreamHandler('OpenRouter R1', openRouterApi),
    })

    console.log('✅ OpenRouter R1 API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ OpenRouter R1 API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 OpenRouter 测试
 */
export async function runOpenRouterTest() {
  await testOpenRouter()
}

/**
 * 运行 OpenRouter R1 测试
 */
export async function runOpenRouterR1Test() {
  await testOpenRouterR1()
}
