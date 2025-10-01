import { OpenAiProviders } from '../constants'
import { CommonOpenAiApi } from './CommonOpenAiApi'

export enum OpenRouterModelEnum {
  // ======================
  // * 免费模型 (2025年最新)
  // ======================

  /** DeepSeek R1 0528 Qwen3 8B (免费版本) - 8B参数推理模型，具备强大的逻辑推理能力 */
  DeepSeek_R1_0528_Qwen3_8B = 'deepseek/deepseek-r1-0528-qwen3-8b:free',
  /** DeepSeek V3 0324 (免费版本) - 685B参数的混合专家模型，综合能力强 */
  DeepSeek_V3_03_24 = 'deepseek/deepseek-chat-v3-0324:free',
  /** GLM 4 32B (免费版本) - 智谱AI 32B模型，中英双语能力优秀 */
  GLM_4_32B = 'thudm/glm-4-32b:free',
}

/**
 * OpenRouter 免费模型 API，免费中最小气的
 *
 * @link 免费模型列表 https://openrouter.ai/models?q=free
 * @link DeepSeek R1 https://openrouter.ai/deepseek/deepseek-r1-0528-qwen3-8b:free/api
 * @link DeepSeek V3 https://openrouter.ai/deepseek/deepseek-chat-v3-0324:free/api
 */
export const openRouterApi = new CommonOpenAiApi<OpenRouterModelEnum>({
  ...OpenAiProviders.OpenRouter,
  model: OpenRouterModelEnum.DeepSeek_R1_0528_Qwen3_8B,
})
