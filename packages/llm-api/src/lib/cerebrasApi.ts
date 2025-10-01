import { OpenAiProviders } from '../constants'
import { CommonOpenAiApi } from './CommonOpenAiApi'

export enum CerebrasModelEnum {
  Llama_4_Scout = 'llama-4-scout-17b-16e-instruct',
  Llama_3_1_8B = 'llama3.1-8b',
  Llama_3_3_70B = 'llama-3.3-70b',
  Qwen_3_32B = 'qwen-3-32b',
}

/**
 * Cerebras API
 *
 * NOTE: 大陆使用要用 Cloudflare Ai Gateway 等平台中转，已配置 CLOUDFLARE_AI_GATEWAY_CEREBRAS_URL
 *
 * @link 官方文档 https://inference-docs.cerebras.ai/quickstart
 * @link 模型列表 https://inference-docs.cerebras.ai/introduction
 */
export const cerebrasApi = new CommonOpenAiApi<CerebrasModelEnum>({
  ...OpenAiProviders.Cerebras,
  model: CerebrasModelEnum.Llama_4_Scout,
})
