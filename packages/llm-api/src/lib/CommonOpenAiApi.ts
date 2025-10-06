import type { BaseLLMReq, EmbeddingsReq, EmbeddingsReqOptions, EmbeddingsResp, OpenAiReq, OpenAiReqOptions, OpenAiResp, StreamMessage } from '../types'
import type { BaseLLMApiConfig } from './BaseLLMApi'
import { http } from '../api/instance'
import { buildRequestUrl, checkLLM_SSEHasError, composeMessageHistory, getEnvValue } from '../tools'
import { BaseLLMApi } from './BaseLLMApi'

/**
 * 通用 OpenAI 兼容格式 API 类
 *
 * 适用于所有支持 OpenAI Chat Completions 格式的 API
 */
export class CommonOpenAiApi<
  ModelName = string,
  Config extends CommonOpenAiApiConfig = CommonOpenAiApiConfig,
> extends BaseLLMApi<ModelName, Config, OpenAiReqOptions> {
  constructor(config: Config) {
    super(config)
  }

  /**
   * chat/completions 通用 OpenAI 格式 API 调用
   */
  override async chatCompletions(opts: CommonOpenAiApiOptions<ModelName>): Promise<OpenAiResp | StreamMessage[]> {
    const {
      baseUrl = this.config.baseUrl,
      url,
      model = this.config.model,
      question,
      system,
      messages,
      envConfig,
      headers = {},
      stream,
      onStream,
      ...rest
    } = opts

    /** 合并消息 */
    const finalMessages = composeMessageHistory(question, system, messages)

    /** 获取 API Key */
    const apiKey = this.config.apiKey
      ?? getEnvValue(envConfig?.apiKey, 'COMMON_OPENAI_API_KEY', '', false)

    /** 构建请求头 */
    const requestHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...headers,
    }

    /** 构建请求 URL */
    const reqUrl = buildRequestUrl(
      baseUrl,
      url,
      '/chat/completions',
      this.config.autoAppendPath ?? true,
    )
    let finalRes: StreamMessage[] = []

    if (stream) {
      const { promise } = await http.fetchSSE(
        reqUrl,
        {
          method: 'POST',
          headers: requestHeaders,
          body: {
            model,
            messages: finalMessages,
            stream: true,
            ...rest,
          },
          onMessage(data) {
            const streamData = [...data.allJson as StreamMessage[]]

            const { currentJson } = data
            const hasError = checkLLM_SSEHasError(currentJson)
            if (hasError) {
              if (currentJson[0].message) {
                console.error(`[LLM ${model}] ${currentJson[0].message}`)
              }
              return Promise.reject(currentJson)
            }

            onStream?.(streamData)
            finalRes = streamData
          },
        },
      )

      await promise
      return finalRes
    }

    const data = await http.post(
      reqUrl,
      {
        model,
        messages: finalMessages,
        ...rest,
      } as OpenAiReq,
      {
        headers: requestHeaders,
      },
    ) as OpenAiResp
    return data
  }

  /**
   * embeddings 向量化接口
   *
   * 支持智谱 AI Embedding-3 等 OpenAI 兼容的 embeddings API
   */
  override async embeddings(opts: CommonEmbeddingsApiOptions<ModelName>): Promise<EmbeddingsResp> {
    const {
      baseUrl = this.config.baseUrl,
      url,
      model = this.config.model,
      input,
      envConfig,
      headers = {},
      ...rest
    } = opts

    /** 获取 API Key */
    const apiKey = this.config.apiKey
      ?? getEnvValue(envConfig?.apiKey, 'COMMON_OPENAI_API_KEY', '', false)

    /** 构建请求头 */
    const requestHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...headers,
    }

    if (!input) {
      throw new Error('input is required')
    }

    /** 构建请求 URL */
    const reqUrl = buildRequestUrl(
      baseUrl,
      url,
      '/embeddings',
      this.config.autoAppendPath ?? true,
    )

    const data = await http.post(
      reqUrl,
      {
        model,
        input,
        ...rest,
      } as EmbeddingsReq,
      {
        headers: requestHeaders,
      },
    ) as EmbeddingsResp
    return data
  }
}

/**
 * 通用 OpenAI API 配置选项
 */
export type CommonOpenAiApiOptions<ModelName = string> = BaseLLMReq<ModelName> & OpenAiReqOptions & {
  /** API 接口地址 */
  baseUrl?: string
  /** 完整的请求 URL，优先级高于 baseUrl */
  url?: string
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 是否启用流式输出 */
  stream?: boolean
}

/**
 * 通用 Embeddings API 配置选项
 */
export type CommonEmbeddingsApiOptions<ModelName = string> = {
  /** 模型名称 */
  model?: ModelName | (string & {})
  /** 输入文本，支持字符串或字符串数组 */
  input: string | string[]
  /** API 接口地址 */
  baseUrl?: string
  /** 完整的请求 URL，优先级高于 baseUrl */
  url?: string
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 环境变量配置 */
  envConfig?: {
    /** API Key */
    apiKey?: string
    /** 其他平台特定配置 */
    [key: string]: any
  }
} & EmbeddingsReqOptions

/**
 * 通用 OpenAI API 配置
 */
export interface CommonOpenAiApiConfig extends BaseLLMApiConfig {
  baseUrl?: string
  apiKey?: string
  model?: string
  /** 是否自动拼接路径，默认 true */
  autoAppendPath?: boolean
}
