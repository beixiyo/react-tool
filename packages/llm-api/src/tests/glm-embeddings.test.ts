import { glmApi } from '../lib'
import { commonEmbeddingsTest } from './utils'

/**
 * GLM 嵌入模型测试
 */
export async function testGlmEmbeddings() {
  return commonEmbeddingsTest(glmApi.embeddings.bind(glmApi), 'GLM')
}

/**
 * 运行 GLM 嵌入模型测试
 */
export async function runGlmEmbeddingsTest() {
  await testGlmEmbeddings()
}
