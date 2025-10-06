import type { CloudflareApiConfig } from './lib/cloudflareApi'
import type { CommonOpenAiApiConfig } from './lib/CommonOpenAiApi'
import type { GeminiApiConfig } from './lib/geminiApi'
import { getEnv } from './tools'

/**
 * 预定义的提供商配置
 */
export const OpenAiProviders = {
  /** 智谱 GLM */
  Glm: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: getEnv('GLM_API_KEY'),
    embeddingsUrl: 'https://open.bigmodel.cn/api/paas/v4/embeddings',
  } satisfies ProvidersConfig,

  /** OpenRouter */
  OpenRouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: getEnv('OPEN_ROUTER_API_KEY'),
  } as ProvidersConfig,

  /** 硅基流动 */
  Siliconflow: {
    baseUrl: 'https://api.siliconflow.cn/v1',
    apiKey: getEnv('SILICONFLOW_API_KEY'),
  } as ProvidersConfig,

  /** Mistral */
  Mistral: {
    baseUrl: 'https://api.mistral.ai/v1',
    apiKey: getEnv('Mistral_API_KEY'),
  } as ProvidersConfig,

  /** Groq */
  Groq: {
    baseUrl: getEnv('CLOUDFLARE_AI_GATEWAY_GROQ_URL', 'https://api.groq.com/openai/v1'),
    apiKey: getEnv('GROQ_API_KEY'),
  } as ProvidersConfig,

  /** Cerebras */
  Cerebras: {
    baseUrl: getEnv('CLOUDFLARE_AI_GATEWAY_CEREBRAS_URL', 'https://api.cerebras.ai/v1'),
    apiKey: getEnv('CEREBRAS_API_KEY'),
  } as ProvidersConfig,

  /** Cohere */
  Cohere: {
    baseUrl: 'https://api.cohere.ai/compatibility/v1',
    apiKey: getEnv('COHERE_API_KEY'),
  } as ProvidersConfig,

  /** Modelscope */
  Modelscope: {
    baseUrl: 'https://api-inference.modelscope.cn/v1',
    apiKey: getEnv('MODELSCOPE_API_KEY'),
  } as ProvidersConfig,

  /** Cloudflare Workers AI */
  Cloudflare: {
    accountId: getEnv('CLOUDFLARE_ACCOUNT_ID'),
    apiKey: getEnv('CLOUDFLARE_WORKER_AI_API_KEY'),
  } as CloudflareApiConfig,

  /** Google Gemini */
  Gemini: {
    proxyUrl: getEnv('CLOUDFLARE_AI_GATEWAY_GEMINI_URL', 'https://generativelanguage.googleapis.com'),
    apiKey: getEnv('GEMINI_API_KEY'),
  } as GeminiApiConfig,

  /** Hugging Face */
  HuggingFace: {
    baseUrl: 'https://router.huggingface.co',
    apiKey: getEnv('HUGGINGFACE_API_KEY'),
  } as ProvidersConfig,

} as const

type ProvidersConfig = CommonOpenAiApiConfig
  & {
    embeddingsUrl?: string
  }
