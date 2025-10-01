import { OpenAiProviders } from '../constants'
import { CommonOpenAiApi } from './CommonOpenAiApi'

/**
 * 硅基流动支持的模型枚举
 *
 * @link 模型列表与定价 https://siliconflow.cn/pricing
 * @link 官方文档 https://docs.siliconflow.cn/capabilities/language-models
 */
export enum SiliconflowModelEnum {
  // ======================
  // * 免费模型
  // ======================

  /** GLM-4.1V-9B-Thinking - 智谱视觉思考模型（免费） */
  GLM_4_1V_9B_Thinking = 'THUDM/GLM-4.1V-9B-Thinking',
  /** DeepSeek-R1-0528-Qwen3-8B - DeepSeek 推理模型（免费） */
  DeepSeek_R1_0528_Qwen3_8B = 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
  /** GLM-Z1-9B-0414 - 智谱 Z1 模型（免费） */
  GLM_Z1_9B_0414 = 'THUDM/GLM-Z1-9B-0414',
  /** DeepSeek-R1-Distill-Qwen-7B - DeepSeek 推理蒸馏模型（免费） */
  DeepSeek_R1_Distill_Qwen_7B = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
  /** Qwen2.5-7B-Instruct - 千问 2.5 指令模型（免费） */
  Qwen2_5_7B_Instruct = 'Qwen/Qwen2.5-7B-Instruct',
  /** Qwen2.5-Coder-7B-Instruct - 千问编程模型（免费） */
  Qwen2_5_Coder_7B_Instruct = 'Qwen/Qwen2.5-Coder-7B-Instruct',
  /** GLM-4-9B-0414 - 智谱 GLM-4 模型（免费） */
  GLM_4_9B_0414 = 'THUDM/GLM-4-9B-0414',
  /** Qwen3-8B - 千问 3 模型（免费） */
  Qwen3_8B = 'Qwen/Qwen3-8B',
  /** internlm2_5-7b-chat - 书生浦语模型（免费） */
  InternLM2_5_7B_Chat = 'internlm/internlm2_5-7b-chat',
  /** glm-4-9b-chat - 智谱 GLM-4 对话模型（免费） */
  GLM_4_9B_Chat = 'THUDM/glm-4-9b-chat',
  /** Qwen2-7B-Instruct - 千问 2 指令模型（免费） */
  Qwen2_7B_Instruct = 'Qwen/Qwen2-7B-Instruct',

  // ======================
  // * 付费模型 - 高性能
  // ======================

  /** DeepSeek-R1 - DeepSeek 推理模型，强大的推理能力 */
  DeepSeek_R1 = 'deepseek-ai/DeepSeek-R1',
  /** DeepSeek-V3 - DeepSeek 通用模型，综合能力强 */
  DeepSeek_V3 = 'deepseek-ai/DeepSeek-V3',
  /** GLM-4.5 - 智谱最新旗舰模型，355B参数MoE架构 */
  GLM_4_5 = 'zai-org/GLM-4.5',
  /** GLM-4.5-Air - 智谱轻量级模型，106B参数MoE架构 */
  GLM_4_5_Air = 'zai-org/GLM-4.5-Air',
  /** Kimi-K2-Instruct - Kimi K2 指令模型，1T参数MoE */
  Kimi_K2_Instruct = 'moonshotai/Kimi-K2-Instruct',
  /** Qwen3-235B-A22B-Thinking-2507 - 千问3 235B 思考模型 */
  Qwen3_235B_A22B_Thinking_2507 = 'Qwen/Qwen3-235B-A22B-Thinking-2507',
  /** Qwen3-235B-A22B-Instruct-2507 - 千问3 235B 指令模型 */
  Qwen3_235B_A22B_Instruct_2507 = 'Qwen/Qwen3-235B-A22B-Instruct-2507',
  /** Qwen3-Coder-480B-A35B-Instruct - 千问编程巨型模型 */
  Qwen3_Coder_480B_A35B_Instruct = 'Qwen/Qwen3-Coder-480B-A35B-Instruct',

  // ======================
  // * 付费模型 - 中等性能
  // ======================

  /** Qwen3-32B - 千问 3 32B 模型 */
  Qwen3_32B = 'Qwen/Qwen3-32B',
  /** QwQ-32B - 千问推理模型 */
  QwQ_32B = 'Qwen/QwQ-32B',
  /** Qwen2.5-72B-Instruct - 千问 2.5 72B 指令模型 */
  Qwen2_5_72B_Instruct = 'Qwen/Qwen2.5-72B-Instruct',
  /** Qwen2.5-Coder-32B-Instruct - 千问编程 32B 模型 */
  Qwen2_5_Coder_32B_Instruct = 'Qwen/Qwen2.5-Coder-32B-Instruct',
  /** GLM-4-32B-0414 - 智谱 GLM-4 32B 模型 */
  GLM_4_32B_0414 = 'THUDM/GLM-4-32B-0414',
  /** deepseek-vl2 - DeepSeek 视觉语言模型 */
  DeepSeek_VL2 = 'deepseek-ai/deepseek-vl2',
  /** Hunyuan-A13B-Instruct - 腾讯混元A13B模型 */
  Hunyuan_A13B_Instruct = 'tencent/Hunyuan-A13B-Instruct',

  // ======================
  // * 付费模型 - 基础性能
  // ======================

  /** Qwen2.5-14B-Instruct - 千问 2.5 14B 指令模型 */
  Qwen2_5_14B_Instruct = 'Qwen/Qwen2.5-14B-Instruct',
  /** Qwen2.5-32B-Instruct - 千问 2.5 32B 指令模型 */
  Qwen2_5_32B_Instruct = 'Qwen/Qwen2.5-32B-Instruct',
  /** DeepSeek-R1-Distill-Qwen-14B - DeepSeek R1 蒸馏14B模型 */
  DeepSeek_R1_Distill_Qwen_14B = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
  /** DeepSeek-R1-Distill-Qwen-32B - DeepSeek R1 蒸馏32B模型 */
  DeepSeek_R1_Distill_Qwen_32B = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
  /** DeepSeek-V2.5 - DeepSeek V2.5 模型 */
  DeepSeek_V2_5 = 'deepseek-ai/DeepSeek-V2.5',
}

/**
 * 硅基流动 AI 模型 API，智力一般，第二梯队，最慢的
 *
 * @link 硅基流动 https://cloud.siliconflow.cn/me/models
 * @link 定价 https://siliconflow.cn/pricing
 * @link API 文档 https://docs.siliconflow.cn/cn/api-reference/chat-completions/chat-completions
 * @link 密钥 https://cloud.siliconflow.cn/me/account/ak
 */
export const siliconflowApi = new CommonOpenAiApi<SiliconflowModelEnum>({
  ...OpenAiProviders.Siliconflow,
  model: SiliconflowModelEnum.DeepSeek_R1,
})
