import { OpenAiProviders } from '../constants'
import { CommonOpenAiApi } from './CommonOpenAiApi'

export enum GroqModelEnum {
  DeepSeek_R1_Distill_Llama_70B = 'deepseek-r1-distill-llama-70b',
  Llama_3_3_70B = 'llama-3.3-70b-versatile',
  Llama_3_1_70B = 'llama-3.1-70b-versatile',
  Llama_3_1_8B = 'llama-3.1-8b-instant',
  Gemma_2_9B = 'gemma2-9b-it',
  Mixtral_8x7B = 'mixtral-8x7b-32768',
}

/**
 * Groq API，支持 TTS
 *
 * NOTE: 大陆使用要用 Cloudflare Ai Gateway 等平台中转，已配置 CLOUDFLARE_AI_GATEWAY_GROQ_URL
 *
 * @link 官方文档 https://console.groq.com/docs/quickstart
 * @link 模型列表 https://console.groq.com/docs/models
 * @link 速率限制 https://console.groq.com/settings/limits
 */
export const groqApi = new CommonOpenAiApi<GroqModelEnum>({
  ...OpenAiProviders.Groq,
  model: GroqModelEnum.Llama_3_3_70B,
})
