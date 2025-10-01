import type { BaseLLMReq, OpenAiReq, OpenAiReqOptions, OpenAiResp, StreamMessage } from '../types'
import type { BaseLLMApiConfig } from './BaseLLMApi'
import { http } from '../instance'
import { checkLLM_SSEHasError, composeMessageHistory, getEnvValue } from '../tools'
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
  async chatCompletions(opts: CommonOpenAiApiOptions<ModelName>): Promise<OpenAiResp | StreamMessage[]> {
    const {
      baseUrl = this.config.baseUrl,
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

    if (!baseUrl) {
      throw new Error('baseUrl is required')
    }

    const reqUrl = baseUrl.endsWith('/')
      ? `${baseUrl.slice(0, -1)}/chat/completions`
      : `${baseUrl}/chat/completions`
    let finalRes: StreamMessage[] = []

    if (stream) {
      const { promise, cancel } = await http.fetchSSE(
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
      baseUrl,
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
}

/**
 * 通用 OpenAI API 配置选项
 */
export type CommonOpenAiApiOptions<ModelName = string> = BaseLLMReq<ModelName> & OpenAiReqOptions & {
  /** API 接口地址 */
  baseUrl?: string
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 是否启用流式输出 */
  stream?: boolean
}

/**
 * 通用 OpenAI API 配置
 */
export interface CommonOpenAiApiConfig extends BaseLLMApiConfig {
  baseUrl?: string
  apiKey?: string
  model?: string
}
