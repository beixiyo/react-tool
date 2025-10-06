import { OpenAiProviders } from '../constants'
import { CommonOpenAiApi } from './CommonOpenAiApi'

export enum GlmModelEnum {
  // ======================
  // * 免费模型
  // ======================

  GLM_4_5_Flash = 'glm-4.5-flash',
  GLM_4_1V_Thinking_Flash = 'glm-4.1v-thinking-flash',
  GLM_4_Flash_250414 = 'glm-4-flash-250414',
  GLM_4V_Flash = 'glm-4v-flash',
  GLM_Z1_Flash = 'glm-z1-flash',

  // ======================
  // * 付费模型
  // ======================

  GLM_4_5V = 'glm-4.5v',
  GLM_4_1V_Thinking_FlashX = 'glm-4.1v-thinking-flashx',
  GLM_4_5_Air = 'glm-4.5-air',

  GLM_4_5 = 'glm-4.5',
  GLM_4_Plus = 'glm-4-plus',
  GLM_4_0520 = 'glm-4-0520',
  GLM_4 = 'glm-4',
  GLM_4V_Plus = 'glm-4v-plus',
  GLM_4V = 'glm-4v',
  GLM_Z1 = 'glm-z1',

  // ======================
  // * 嵌入模型
  // ======================
  Embedding_3 = 'embedding-3',
}

/**
 * 智谱 AI GLM 模型 API，智力不错，免费中第一梯队
 *
 * @link 官方文档 https://docs.bigmodel.cn/cn/guide/start/model-overview
 * @link OpenAI 兼容格式 https://docs.bigmodel.cn/cn/guide/develop/http/introduction
 * @link 权益并发说明 https://bigmodel.cn/usercenter/corporateequity
 * @link 并发限制 https://bigmodel.cn/usercenter/proj-mgmt/rate-limits
 * @link 免费资源包 https://bigmodel.cn/finance/resourcepack?tab=my
 * @link 文本嵌入 https://docs.bigmodel.cn/cn/guide/models/embedding/embedding-3
 */
export const glmApi = new CommonOpenAiApi<GlmModelEnum>({
  ...OpenAiProviders.Glm,
  model: GlmModelEnum.GLM_4_5_Flash,
})

const oldEmbeddings = glmApi.embeddings.bind(glmApi)
glmApi.embeddings = (opts) => {
  opts.url = OpenAiProviders.Glm.embeddingsUrl
  opts.model = GlmModelEnum.Embedding_3
  return oldEmbeddings(opts)
}
