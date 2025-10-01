import { OpenAiProviders } from '../constants'
import { CommonOpenAiApi } from './CommonOpenAiApi'

export enum ModelscopeModelEnum {
  GLM_4_5 = 'ZhipuAI/GLM-4.5',
  Qwen_3_Coder_480B_A35B_Instruct = 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
  Qwen_3_235B_A22B_Thinking = 'Qwen/Qwen3-235B-A22B-Thinking-2507',
  Kimi_K2_Instruct = 'moonshotai/Kimi-K2-Instruct',
}

/**
 * Modelscope AI 模型 API
 *
 * NOTE: 需要绑定阿里云账号
 *
 * @link https://modelscope.cn/docs/model-service/API-Inference/intro
 */
export const modelscopeApi = new CommonOpenAiApi<ModelscopeModelEnum>({
  ...OpenAiProviders.Modelscope,
  model: ModelscopeModelEnum.Kimi_K2_Instruct,
})
