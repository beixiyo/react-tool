import { OpenAiProviders } from '../constants'
import { CommonOpenAiApi } from './CommonOpenAiApi'

export enum CohereModelEnum {
  Command_A = 'command-a-03-2025',
  Command_R7B_12_2024 = 'command-r7b-12-2024',
  Command_A_Vision_07_2025 = 'command-a-vision-07-2025',
  Command_R_Plus_04_2024 = 'command-r-plus-04-2024',
  Command_R_Plus = 'command-r-plus',
  Command_R_08_2024 = 'command-r-08-2024',
  Command_R_03_2024 = 'command-r-03-2024',
}

/**
 * @deprecated 需要梯子，而且 Cloudflare 中转的不是 OpenAI 的格式，懒得写
 * Cohere AI 模型 API
 *
 * NOTE: 大陆使用要用 Cloudflare Ai Gateway 等平台中转，不好用
 *
 * @link 官方文档 https://docs.cohere.com/
 * @link Command A 模型 https://huggingface.co/CohereLabs/c4ai-command-a-03-2025
 * @link 开源模型列表 https://docs.cohere.com/docs/models#open-weights-models
 */
export const cohereApi = new CommonOpenAiApi<CohereModelEnum>({
  ...OpenAiProviders.Cohere,
  model: CohereModelEnum.Command_A,
})
