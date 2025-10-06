export type DefaultStream = {
  /** 流式输出回调函数 */
  onStream?: (data: StreamMessage[]) => void
}

export type BaseLLMReq<
  ModelName = string,
  ExtraOptions = DefaultStream,
> = {
  model?: ModelName | (string & {})
  /** 用户消息内容，会自动作为 user 加入 messages 最后一项 */
  question?: string
  /** 系统提示词，会自动作为 system 加入 messages 第一项 */
  system?: string
  /** 消息历史记录，包含用户问题 */
  messages?: OpenAiReqMessage[]
  /** 环境变量配置，用户传入的优先级最高 */
  envConfig?: EnvConfig
}
& ExtraOptions

/**
 * 环境变量配置
 */
export type EnvConfig = {
  /** API Key */
  apiKey?: string
  /** 其他平台特定配置 */
  [key: string]: any
}

/**
 * 401 未授权 检查API Key是否正确
 * 429 请求过于频繁 降低请求频率，实施重试机制
 * 500 服务器内部错误 稍后重试，如持续出现请联系支持
 */
export enum LLMCodeEnum {
  Unauthorized = 401,
  TooManyRequests = 429,
  InternalServerError = 500,
  Success = 200,
}

// ======================
// * Stream Message 格式
// ======================

export type StreamMessage = {
  id: string
  created: number
  model: string
  choices: StreamChoice[]
}

export type StreamChoice = {
  index: number
  delta: StreamDelta
}

export type StreamDelta = {
  role: OpenAiRoleEnum
  content: string
  reasoning_content?: string
}

// ======================
// * Open Ai 格式
// ======================

export enum OpenAiRoleEnum {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

/**
 * OpenAi 请求参数
 */
export type OpenAiReq = {
  model: string
  messages: OpenAiReqMessage[]

  /** 是否启用流式输出 */
  stream?: boolean
  /** 温度参数，控制输出随机性 */
  temperature?: number
  /** 最大输出 tokens */
  max_tokens?: number
}

/**
 * 排除 model 和 messages 后的 OpenAiReq 类型
 */
export type OpenAiReqOptions = Omit<
  OpenAiReq,
  'model' | 'messages'
>

export type OpenAiReqMessage = {
  role: OpenAiRoleEnum
  content: string
}

export type OpenAiResp = {
  id: string
  provider?: string
  model: string
  object?: string
  created: number
  choices: Choice[]
  usage: Usage
}

export type Usage = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export type Choice = {
  finish_reason?: string
  native_finish_reason?: string
  index: number
  message: OpenAiRespMessage
}

/**
  | 平台                 | 额外字段名               | 示例                                      | 备注                                                     |
  | ------------------ | ------------------- | --------------------------------------- | ------------------------------------------------------ |
  | **OpenRouter**     | `reasoning`         | `"reasoning":"Let me break it down..."` | 只有部分模型返回                                               |
  | **智谱 GLM**         | `reasoning_content` | `"reasoning_content":"先分析..."`          | 需 `model=glm-4-flash` 并开 `enable_thinking=true`        |
  | **DeepSeek**       | `reasoning_content` | `"reasoning_content":"Step 1..."`       | 非 OpenAI 兼容字段，需用 DeepSeek SDK                          |
  | **Kimi（Moonshot）** | `thinking`          | `"thinking":"..."`                      | 仅 `/v1/chat/completions` 带 `include_thinking=true` 时返回 |
  | **OpenAI 官方**      | ❌ 无                 |                                         | 官方不公开内部 CoT                                            |
 */
export type OpenAiRespMessage = {
  role: OpenAiRoleEnum
  /**
   * 回答内容
   */
  content: string
  /**
   * 思考过程（OpenRouter 等平台支持）
   */
  reasoning?: string
  /**
   * 思考过程（DeepSeek、智谱 GLM 支持）
   */
  reasoning_content?: string
  /**
   * 思考过程（Kimi 支持）
   */
  thinking?: string
}

// ======================
// * Embeddings 格式
// ======================

/**
 * Embeddings 请求参数
 */
export type EmbeddingsReq = {
  /** 模型名称 */
  model: string
  /** 输入文本，支持字符串或字符串数组 */
  input: string | string[]
  /** 向量维度，可选，默认 2048 */
  dimensions?: 256 | 512 | 1024 | 2048
}

/**
 * Embeddings 响应
 */
export type EmbeddingsResp = {
  /** 对象类型 */
  object: string
  /** 数据数组 */
  data: EmbeddingsData[]
  /** 模型名称 */
  model: string
  /** 使用情况统计 */
  usage: EmbeddingsUsage
}

/**
 * Embeddings 数据项
 */
export type EmbeddingsData = {
  /** 对象类型 */
  object: string
  /** 向量数据 */
  embedding: number[]
  /** 索引 */
  index: number
}

/**
 * Embeddings 使用情况统计
 */
export type EmbeddingsUsage = {
  /** 提示词 tokens 数量 */
  prompt_tokens: number
  /** 总 tokens 数量 */
  total_tokens: number
}

/**
 * Embeddings 请求选项
 */
export type EmbeddingsReqOptions = Omit<EmbeddingsReq, 'model' | 'input'>
