import { OpenAiProviders } from '../constants'
import { CommonOpenAiApi } from './CommonOpenAiApi'

export enum MistralModelEnum {
  /**
   * Tokens per Minute 500,000
   */
  Codestral_2405 = 'codestral-2405',
  /**
   * Tokens per Minute 500,000
   */
  Codestral_2501 = 'codestral-2501',
  /**
   * Tokens per Month 1,000,000,000
   */
  Codestral_Mamba_2407 = 'codestral-mamba-2407',
  /**
   * Tokens per Minute 500,000
   */
  Ministral_3b_2410 = 'ministral-3b-2410',
  /**
   * Tokens per Minute 500,000
   */
  Ministral_8b_2410 = 'ministral-8b-2410',
  /**
   * Tokens per Minute 20,000,000
   */
  Mistral_Embed = 'mistral-embed',
  /**
   * Tokens per Minute 500,000
   */
  Mistral_Large_2402 = 'mistral-large-2402',
}

/**
 * Mistral AI 模型 API
 *
 * @link model-limits https://admin.mistral.ai/plateforme/limits
 * @link 官方文档 https://docs.mistral.ai/
 * @link Codestral 文档 https://docs.mistral.ai/capabilities/code_generation/
 */
export const mistralApi = new CommonOpenAiApi<MistralModelEnum>({
  ...OpenAiProviders.Mistral,
  model: MistralModelEnum.Codestral_2405,
})
