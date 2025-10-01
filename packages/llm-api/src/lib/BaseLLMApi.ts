import type { BaseLLMReq, DefaultStream, OpenAiResp, StreamMessage } from '../types'

/**
 * LLM API 抽象基类
 *
 * 所有 LLM API 必须继承此类并实现 chatCompletions 方法
 * 确保所有 API 具有统一的调用接口和返回格式（OpenAI 兼容）
 *
 * @template ModelName 模型名称枚举类型
 * @template Config API 配置类型（可选，用于传递平台特定配置）
 * @template ExtraOptions 额外选项类型（可选，用于扩展请求参数）
 */
export abstract class BaseLLMApi<
  ModelName = string,
  Config extends BaseLLMApiConfig = BaseLLMApiConfig,
  ExtraOptions = Record<string, any>,
  ChatRes = OpenAiResp | StreamMessage[],
  StreamMsg = StreamMessage,
> {
  /**
   * 构造函数
   * @param config API 配置
   */
  constructor(protected config: Config) { }

  /**
   * 聊天补全接口（统一接口）
   *
   * 所有实现必须：
   * 1. 支持流式和非流式输出
   * 2. 返回 OpenAI 兼容格式的响应
   * 3. 处理 system、question、messages 的合并
   * 4. 支持环境变量配置覆盖
   *
   * @param options 请求选项
   * @returns Promise<OpenAiResp | StreamMessage[]> OpenAI 格式的响应或流式消息数组
   */
  abstract chatCompletions(
    options: BaseLLMApiOptions<ModelName, ExtraOptions>
  ): Promise<ChatRes>

  /**
   * 组合 Stream Message 的回答内容和思考过程，兼容不同平台的思考过程拼接
   * @param streamMessage 流式消息
   */
  composeStreamMessage(streamMessage: StreamMsg[]): MessageRes {
    /** 默认实现：假设 StreamMsg 是 StreamMessage 格式 */
    const data = (streamMessage as StreamMessage[]).flatMap(item => item.choices)
    const content = data.map(item => item?.delta?.content || '').join('')
    const reasoning = data.map(item => item?.delta?.reasoning_content || '').join('')

    return { content, reasoning }
  }

  /**
   * 获取当前配置
   */
  getConfig(): Config {
    return this.config
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<Config>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * 基础 API 配置接口
 */
export interface BaseLLMApiConfig {
  /** API 基础 URL */
  baseUrl?: string
  /** API Key */
  apiKey?: string
  /** 默认模型 */
  model?: string
}

/**
 * 基础 API 请求选项（统一接口参数）
 */
export type BaseLLMApiOptions<
  ModelName = string,
  ExtraOptions = DefaultStream,
> = BaseLLMReq<ModelName, ExtraOptions>
  & ExtraOptions & {
    /** 是否启用流式输出 */
    stream?: boolean
  }

export type MessageRes = {
  content: string
  reasoning: string
}
