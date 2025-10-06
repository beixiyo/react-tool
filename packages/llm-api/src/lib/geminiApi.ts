import type { EmbeddingsResp, EnvConfig } from '../types'
import type { BaseLLMApiOptions } from './BaseLLMApi'
import type { CommonEmbeddingsApiOptions } from './CommonOpenAiApi'
import { http } from '../api/instance'
import { OpenAiProviders } from '../constants'
import { composeMessageHistory, getEnvValue } from '../tools'
import { BaseLLMApi } from './BaseLLMApi'

/**
 * Gemini API，智力不错，免费中第一梯队
 *
 * @link 申请试用 https://aistudio.google.com/prompts/new_chat
 * @link 免费额度说明 https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn
 * @link 流式传输文档 https://ai.google.dev/gemini-api/docs/text-generation?hl=zh-cn#streaming-responses
 *
 * NOTE: 大陆使用要用 Cloudflare Ai Gateway 等平台中转，已配置 CLOUDFLARE_AI_GATEWAY_GEMINI_URL
 */
class GeminiApi extends BaseLLMApi<
  GeminiModelEnum,
  GeminiApiConfig,
  GeminiExtraOptions,
  GeminiResp | GeminiResp[],
  GeminiResp
> {
  constructor(config: GeminiApiConfig) {
    super(config)
  }

  /**
   * 聊天补全接口（统一 OpenAI 格式）
   */
  override async chatCompletions(opts: BaseLLMApiOptions<GeminiModelEnum, GeminiExtraOptions>) {
    const {
      model = this.config.model ?? GeminiModelEnum.Gemini_25_Flash,
      question,
      system,
      messages,
      envConfig,
      stream,
      onStream,
      ...rest
    } = opts

    /** 合并消息 */
    const finalMessages = composeMessageHistory(question, system, messages)
    /** 转换为 Gemini 格式的 contents */
    // Gemini API 支持 system, user, model (assistant) 角色
    const contents = finalMessages.map(msg => ({
      role: msg.role === 'system'
        ? 'system'
        : msg.role === 'assistant'
          ? 'model'
          : 'user',
      parts: [{ text: msg.content }],
    }))

    /** 获取环境变量配置 */
    const DEFAULT_GEMINI_URL = 'https://generativelanguage.googleapis.com'
    const baseUrl = getEnvValue(
      envConfig?.proxyUrl ?? this.config.proxyUrl,
      'CLOUDFLARE_AI_GATEWAY_GEMINI_URL',
      DEFAULT_GEMINI_URL,
    )
    const apiKey = getEnvValue(
      envConfig?.apiKey ?? this.config.apiKey,
      'GEMINI_API_KEY',
      '',
      true,
    )

    const url = `${baseUrl}/v1beta/models/${model}:${stream
      ? 'streamGenerateContent?alt=sse'
      : 'generateContent'}`

    const headers = {
      'x-goog-api-key': apiKey,
    }

    try {
      if (stream) {
        let finalRes: GeminiResp[] = []
        const { promise } = await http.fetchSSE(
          url,
          {
            method: 'POST',
            separator: '\r\n\r\n',
            headers,
            body: {
              contents,
              ...rest,
            },
            onMessage(data) {
              const streamData = [...data.allJson as GeminiResp[]]
              opts.onStream?.(streamData)
              finalRes = streamData
            },
          },
        )

        await promise
        return finalRes
      }

      const data = await http.post(
        url,
        {
          contents,
          ...rest,
        },
        {
          headers,
        },
      ) as GeminiResp

      return data
    }
    catch (error) {
      console.log(error)
      throw error
    }
  }

  override async embeddings(_options: CommonEmbeddingsApiOptions<GeminiModelEnum>): Promise<EmbeddingsResp> {
    throw new Error('Method not implemented.')
  }

  composeStreamMessage(data: GeminiResp[]) {
    const content = data
      .flatMap(item => item.candidates)
      .flatMap(item => item.content.parts)
      .map(item => item.text)
      .join('')
    return { content, reasoning: '' }
  }
}

export enum GeminiModelEnum {
  /**
   * ## Rate limits
   * - 1000 RPM
   *
   * ## Free
   * - 10 RPM 500 req/day
   */
  Gemini_25_Flash = 'gemini-2.5-flash',
  /**
   * ## Rate limits
   * - 4000 RPM
   *
   * ## Free
   * - 15 RPM 500 req/day
   */
  Gemini_25_Flash_Lite = 'gemini-2.5-flash-lite',

  Gemini_20_Flash = 'gemini-2.0-flash',
}

/**
 * Gemini API 配置
 */
export interface GeminiApiConfig {
  /** 代理地址（如果支持） */
  proxyUrl?: string
  /** API Key */
  apiKey?: string
  /** 默认模型 */
  model?: GeminiModelEnum
}

/**
 * Gemini API 额外选项
 */
export type GeminiExtraOptions = {
  /** 是否启用流式输出 */
  stream?: boolean
  /** 流式输出回调函数 */
  onStream?: (data: GeminiResp[]) => void
  /** 温度参数，控制输出随机性 */
  temperature?: number
  /** 最大输出 tokens */
  maxOutputTokens?: number
  /** 候选数量 */
  candidateCount?: number

  envConfig?: EnvConfig & {
    /** 代理地址（如果支持） */
    proxyUrl?: string
  }
}

export type GeminiResp = {
  candidates: Candidate[]
  usageMetadata: UsageMetadata
  modelVersion: string
  responseId: string
}

export type UsageMetadata = {
  promptTokenCount: number
  candidatesTokenCount: number
  totalTokenCount: number
  promptTokensDetails: PromptTokensDetail[]
  candidatesTokensDetails: PromptTokensDetail[]
}

export type PromptTokensDetail = {
  modality: string
  tokenCount: number
}

export type Candidate = {
  content: Content
  finishReason: string
  avgLogprobs: number
}

export type Content = {
  parts: Part[]
  role: string
}

export type Part = {
  text: string
}

/**
 * Google Gemini API 实例（默认配置）
 *
 * @example
 * ```ts
 * const response = await geminiApi.chatCompletions({
 *   question: '你好',
 *   model: GeminiModelEnum.Gemini_25_Flash
 * })
 * ```
 */
export const geminiApi = new GeminiApi({
  ...OpenAiProviders.Gemini,
  model: GeminiModelEnum.Gemini_25_Flash,
})
