import type { CommonOpenAiApi } from '../lib'
import { cloudflareApi, CloudflareModelEnum } from '../lib'
import { createStreamHandler, getTestHistoryMessages, getTestQuestion } from './utils'

/**
 * Cloudflare API 测试
 */
export async function testCloudflare() {
  const question = getTestQuestion()
  const historyMessages = getTestHistoryMessages()

  console.log('🚀 开始测试 Cloudflare API...')

  try {
    const data = await cloudflareApi.chatCompletions({
      question,
      messages: historyMessages,
      model: CloudflareModelEnum.LLM_31_8B_INSTRUCT,
      stream: true,
      onStream: createStreamHandler('Cloudflare', cloudflareApi as unknown as CommonOpenAiApi),
    })

    console.log('✅ Cloudflare API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ Cloudflare API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 Cloudflare 测试
 */
export async function runCloudflareTest() {
  await testCloudflare()
}
