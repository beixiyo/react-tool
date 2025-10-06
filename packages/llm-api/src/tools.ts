import type { OpenAiReqMessage } from './types'
import { fileURLToPath } from 'node:url'
import { isNode } from '@jl-org/tool'
import { loadEnv, getEnv as nodeGetEnv } from '@jl-org/tool/node'
import { OpenAiRoleEnum } from './types'

/**
 * 检查 LLM SSE 数据中是否包含错误
 * @param data SSE 数据
 * @returns 是否包含错误
 */
export function checkLLM_SSEHasError(data: any) {
  const hasError = data.some((item: any) => item.__internal__event === 'error')
  if (hasError) {
    return true
  }
  return false
}

/**
 * 合并历史消息和当前问题
 * @param question 当前用户问题
 * @param messages 历史消息记录
 */
export function composeMessageHistory(
  question?: string,
  system?: string,
  messages?: OpenAiReqMessage[],
): OpenAiReqMessage[] {
  const result: OpenAiReqMessage[] = []

  /** 添加系统提示词 */
  if (system) {
    result.push({
      role: OpenAiRoleEnum.System,
      content: system,
    })
  }

  /** 添加历史消息 */
  if (messages && messages.length > 0) {
    result.push(...messages)
  }

  /** 添加当前问题 */
  if (question) {
    result.push({
      role: OpenAiRoleEnum.User,
      content: question,
    })
  }

  /** 如果没有任何消息，抛出错误 */
  if (result.length === 0) {
    throw new Error('至少需要提供 question 或 messages 中的一个')
  }

  return result
}

/**
 * 获取环境变量值，用户传入的优先级最高
 * @param userValue 用户传入的值
 * @param envKey 环境变量 key
 * @param defaultValue 默认值
 * @param required 是否必需
 */
export function getEnvValue(
  userValue: string | undefined,
  envKey: string,
  defaultValue = '',
  required = false,
): string {
  if (userValue) {
    return userValue
  }
  return getEnv(envKey, defaultValue, required)
}

export function getEnv(key: string, defaultValue = '', required = false) {
  if (isNode) {
    loadEnv(fileURLToPath(new URL('../.env', import.meta.url)))
    return nodeGetEnv(key, defaultValue, required)
  }

  const val = import.meta.env[key] || defaultValue
  if (!val && required) {
    throw new Error(`环境变量 ${key} 为空，且 required 为 true`)
  }
  return val
}

/**
 * 构建请求 URL
 * @param baseUrl 基础 URL
 * @param url 完整 URL（优先级更高）
 * @param path 路径
 * @param autoAppendPath 是否自动拼接路径
 */
export function buildRequestUrl(
  baseUrl?: string,
  url?: string,
  path?: string,
  autoAppendPath = true,
): string {
  /** 如果提供了完整 URL，直接使用 */
  if (url) {
    return url
  }

  if (!baseUrl) {
    throw new Error('baseUrl is required when url is not provided')
  }

  /** 如果不自动拼接路径，直接返回 baseUrl */
  if (!autoAppendPath || !path) {
    return baseUrl
  }

  const formatBaseUrl = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl
  const formatPath = path.startsWith('/')
    ? path
    : `/${path}`
  return `${formatBaseUrl}${formatPath}`
}
