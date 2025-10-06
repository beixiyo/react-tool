import type { EmbeddingsResp, OpenAiReqMessage } from '../types'
import type { CommonOpenAiApi } from '@/lib'
import { OpenAiRoleEnum } from '../types'

/**
 * 测试工具函数
 */

/**
 * 获取测试用的历史消息
 */
export function getTestHistoryMessages(): OpenAiReqMessage[] {
  return [
    { role: OpenAiRoleEnum.User, content: '你好，我叫张三' },
    { role: OpenAiRoleEnum.Assistant, content: '你好张三！很高兴认识你。' },
    { role: OpenAiRoleEnum.User, content: '请记住我的名字' },
    { role: OpenAiRoleEnum.Assistant, content: '好的，我会记住你的名字是张三。' },
  ]
}

/**
 * 获取测试问题
 */
export function getTestQuestion(): string {
  return '请回答我的名字是什么'
}

/**
 * 带思考过程的流式响应处理器
 */
export function createStreamHandler(apiName: string, api: CommonOpenAiApi) {
  return (resp: any) => {
    const { content, reasoning } = api.composeStreamMessage(resp)
    console.log(`[${apiName}] 回答内容:`, content)
    console.log(`[${apiName}] 思考过程:`, reasoning)
  }
}

/** 计算余弦相似度 */
export function cosineSimilarity(a: number[], b: number[]) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

export async function commonEmbeddingsTest(
  getEmbeddings: (data: { input: string[] }) => Promise<EmbeddingsResp>,
  testName: string,
) {
  console.log(`🚀 开始测试 ${testName} 嵌入模型...`)

  try {
    /** 测试相似度计算 */
    console.log('\n📝 测试文本相似度计算...')
    const similarityTest = await getEmbeddings({
      input: [
        '苹果是一种水果',
        '苹果公司是一家科技公司',
        '香蕉也是一种水果',
      ],
    })

    if (similarityTest.data.length >= 3) {
      const embedding1 = similarityTest.data[0].embedding
      const embedding2 = similarityTest.data[1].embedding
      const embedding3 = similarityTest.data[2].embedding

      const similarity1_2 = cosineSimilarity(embedding1, embedding2)
      const similarity1_3 = cosineSimilarity(embedding1, embedding3)
      const similarity2_3 = cosineSimilarity(embedding2, embedding3)

      console.log('✅ 相似度计算测试完成')
      console.log('📊 相似度结果:')
      console.log(`  - "苹果是一种水果" vs "苹果公司是一家科技公司": ${similarity1_2.toFixed(4)}`)
      console.log(`  - "苹果是一种水果" vs "香蕉也是一种水果": ${similarity1_3.toFixed(4)}`)
      console.log(`  - "苹果公司是一家科技公司" vs "香蕉也是一种水果": ${similarity2_3.toFixed(4)}`)
      console.log('💡 预期: 水果相关文本相似度应该更高')
    }

    console.log(`\n🎉 ${testName} 嵌入模型测试全部完成！`)
    return {
      similarityTest,
    }
  }
  catch (error) {
    console.error(`❌ ${testName} 嵌入模型测试失败:`, error)
    throw error
  }
}
