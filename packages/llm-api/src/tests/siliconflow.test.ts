import { siliconflowApi } from '../lib'
import { createStreamHandler } from './utils'

/**
 * SiliconFlow API 测试
 */
export async function testSiliconFlow() {
  console.log('🚀 开始测试 SiliconFlow API...')

  try {
    const data = await siliconflowApi.chatCompletions({
      question: '峰哥，怎么看足疗正不正规啊',
      // messages: historyMessages,
      model: 'ft:LoRA/Qwen/Qwen2.5-7B-Instruct:d29jk7c50mis73e8bdp0:feng:yqbhwtqwtjiohbzfdzcu',
      stream: true,
      onStream: createStreamHandler('SiliconFlow', siliconflowApi),
    })

    console.log('✅ SiliconFlow API 测试完成')
    return data
  }
  catch (error) {
    console.error('❌ SiliconFlow API 测试失败:', error)
    throw error
  }
}

/**
 * 运行 SiliconFlow 测试
 */
export async function runSiliconFlowTest() {
  await testSiliconFlow()
}
