import type { BaseLLMReq, EnvConfig } from '../types'
import type { BaseLLMApiOptions } from './BaseLLMApi'
import { OpenAiProviders } from '../constants'
import { http } from '../instance'
import { composeMessageHistory, getEnvValue } from '../tools'
import { BaseLLMApi } from './BaseLLMApi'

/**
 * Cloudflare API，比较笨，纯纯的 dinner，每日 10,000 免费请求
 *
 * @link 免费额度说明 https://developers.cloudflare.com/workers-ai/platform/pricing/
 * @link 流式传输文档 https://blog.cloudflare.com/workers-ai-streaming
 */
class CloudflareApi extends BaseLLMApi<
  CloudflareModelEnum,
  CloudflareApiConfig,
  CloudflareExtraOptions,
  CloudflareResp | CloudflareResult[],
  CloudflareResult
> {
  constructor(config: CloudflareApiConfig) {
    super(config)
  }

  /**
   * 聊天补全接口（统一 OpenAI 格式）
   */
  async chatCompletions(opts: BaseLLMApiOptions<CloudflareModelEnum, CloudflareExtraOptions>) {
    const {
      model = this.config.model ?? CloudflareModelEnum.LLM_31_8B_INSTRUCT,
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
    /** 目前 Cloudflare Workers AI 只支持单个 prompt，所以我们合并所有消息 */
    // Cloudflare Workers AI 支持 system, user, assistant 角色
    const prompt = finalMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')

    /** 获取环境变量配置 */
    const accountId = getEnvValue(
      envConfig?.accountId ?? this.config.accountId,
      'CLOUDFLARE_ACCOUNT_ID',
      '',
      true,
    )
    const apiKey = getEnvValue(
      envConfig?.apiKey ?? this.config.apiKey,
      'CLOUDFLARE_WORKER_AI_API_KEY',
      '',
      true,
    )

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`

    const headers = {
      Authorization: `Bearer ${apiKey}`,
    }

    try {
      if (stream) {
        let finalRes: CloudflareResult[] = []
        const { promise, cancel } = await http.fetchSSE(
          url,
          {
            method: 'POST',
            headers,
            body: {
              prompt,
              stream: true,
              ...rest,
            },
            onMessage(data) {
              const streamData = [...data.allJson as CloudflareResult[]]
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
          prompt,
          ...rest,
        },
        {
          headers,
        },
      ) as CloudflareResp

      return data
    }
    catch (error) {
      console.log(error)
      throw error
    }
  }

  composeStreamMessage(data: CloudflareResult[]) {
    const content = data.map(item => item.response).join('')
    return { content, reasoning: '' }
  }
}

export enum CloudflareModelEnum {
  LLM_31_8B_INSTRUCT = '@cf/meta/llama-3.1-8b-instruct',
}

/**
 * Cloudflare API 配置
 */
export interface CloudflareApiConfig {
  /** Cloudflare 账户 ID */
  accountId?: string
  /** API Key */
  apiKey?: string
  /** 默认模型 */
  model?: CloudflareModelEnum
}

/**
 * Cloudflare Workers AI 额外选项
 */
export type CloudflareExtraOptions = {
  /** 是否启用流式输出 */
  stream?: boolean
  /** 流式输出回调函数 */
  onStream?: (data: CloudflareResult[]) => void
  /** 最大输出 tokens */
  max_tokens?: number
  /** 温度参数，控制输出随机性 */
  temperature?: number

  envConfig?: EnvConfig & {
    /** Cloudflare 账户 ID */
    accountId?: string
  }
}

/**
 * Cloudflare API 请求选项
 */
export type CloudflareApiOptions = BaseLLMReq<CloudflareModelEnum> & CloudflareExtraOptions & {
  /** 是否启用流式输出 */
  stream?: boolean
}

export type CloudflareResp = {
  result: CloudflareResult
  success: boolean
  errors: any[]
  messages: any[]
}

export type CloudflareResult = {
  response: string
  usage: CloudflareUsage
}

export type CloudflareUsage = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

/**
 * Cloudflare Workers AI API 实例（默认配置）
 *
 * @example
 * ```ts
 * const response = await cloudflareApi.chatCompletions({
 *   question: '你好',
 *   model: CloudflareModelEnum.LLM_31_8B_INSTRUCT
 * })
 * ```
 */
export const cloudflareApi = new CloudflareApi({
  ...OpenAiProviders.Cloudflare,
  model: CloudflareModelEnum.LLM_31_8B_INSTRUCT,
})
