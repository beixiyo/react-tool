import { huggingFaceEmbeddings } from '../api/embeddings'
import { commonEmbeddingsTest } from './utils'

/**
 * Hugging Face 嵌入模型测试
 */
export async function testHuggingFaceEmbeddings() {
  return commonEmbeddingsTest(huggingFaceEmbeddings, 'Hugging Face')
}

/**
 * 运行 Hugging Face 嵌入模型测试
 */
export async function runHuggingFaceEmbeddingsTest() {
  await testHuggingFaceEmbeddings()
}
