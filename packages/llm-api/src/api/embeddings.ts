/**
 * @link https://huggingface.co/docs/inference-providers/tasks/feature-extraction
 * @link Token https://huggingface.co/settings/tokens
 */

import type { EmbeddingsData, EmbeddingsResp, EmbeddingsUsage } from '../types'
import { OpenAiProviders } from '../constants'
import { buildRequestUrl, getEnvValue } from '../tools'
import { http } from './instance'

export enum HuggingfaceModelEnum {
  Nebius = 'nebius/v1/embeddings',
  HF_Inference = 'hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction',
  Sambanova = 'sambanova/v1/embeddings',
}

/**
 * Hugging Face 嵌入模型接口
 *
 * @param options 请求参数
 * @returns Promise<EmbeddingsResp> OpenAI 兼容格式的嵌入响应
 */
export async function huggingFaceEmbeddings(
  options: HuggingFaceEmbeddingsReq,
): Promise<EmbeddingsResp> {
  const {
    model = HuggingfaceModelEnum.HF_Inference,
    input,
    apiKey = OpenAiProviders.HuggingFace.apiKey,
    baseUrl = OpenAiProviders.HuggingFace.baseUrl,
    url,
    normalize = true,
    pooling = 'mean',
  } = options

  /** 获取 API Key */
  const token = apiKey ?? getEnvValue(apiKey, 'HUGGINGFACE_API_KEY', '', false)
  if (!token) {
    throw new Error('Hugging Face API Key is required')
  }

  /** 确保 input 是数组格式 */
  const inputs = Array.isArray(input)
    ? input
    : [input]

  /** 构建请求 URL */
  const reqUrl = buildRequestUrl(
    baseUrl,
    url,
    model,
  )

  /** 构建请求头 */
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  /** 构建请求体 */
  const body = {
    inputs,
    options: {
      normalize,
      pooling,
    },
  }

  try {
    // Hugging Face 返回的是数组，需要转换为 OpenAI 格式
    const embeddings = await http.post(reqUrl, body, { headers }) as unknown as number[] | number[][]

    /** 确保是二维数组格式 */
    const embeddingsArray = Array.isArray(embeddings[0])
      ? embeddings as number[][]
      : [embeddings as number[]]

    /** 转换为 OpenAI 兼容格式 */
    const data: EmbeddingsData[] = embeddingsArray.map((embedding, index) => ({
      object: 'embedding',
      embedding,
      index,
    }))

    const usage: EmbeddingsUsage = {
      prompt_tokens: -1,
      total_tokens: -1,
    }

    return {
      object: 'list',
      data,
      model,
      usage,
    }
  }
  catch (error) {
    console.error('Hugging Face embeddings error:', error)
    throw new Error(`Hugging Face embeddings failed: ${error}`)
  }
}

/**
 * Hugging Face 嵌入请求参数
 */
export type HuggingFaceEmbeddingsReq = {
  /** 模型名称 */
  model?: HuggingfaceModelEnum | string
  /** 输入文本，支持字符串或字符串数组 */
  input: string | string[]
  /** 是否返回归一化向量 */
  normalize?: boolean
  /** 是否返回平均池化结果 */
  pooling?: 'mean' | 'cls' | 'max'

  /** API Key */
  apiKey?: string
  /** API 接口地址 */
  baseUrl?: string
  /** 完整的请求 URL，优先级高于 baseUrl */
  url?: string
}
