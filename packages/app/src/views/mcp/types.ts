import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import type {
  ServerCapabilities,
  Tool,
  Resource,
  Prompt,
  CallToolResult,
  ReadResourceResult,
  GetPromptResult,
} from '@modelcontextprotocol/sdk/types.js'

/**
 * 传输方式类型
 */
export type TransportType = 'sse' | 'streamable-http'

/**
 * 连接状态
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

/**
 * MCP 连接配置
 */
export interface MCPConfig {
  /** 传输方式 */
  transportType: TransportType
  /** 服务器 URL */
  url: string
  /** 自定义请求头 */
  customHeaders?: Record<string, string>
}

/**
 * 连接状态信息
 */
export interface ConnectionState {
  /** 当前状态 */
  status: ConnectionStatus
  /** 错误信息 */
  error?: string
  /** 服务器能力 */
  capabilities?: ServerCapabilities
  /** 服务器信息 */
  serverInfo?: {
    name: string
    version: string
  }
}

/**
 * MCP 客户端实例
 */
export interface MCPClientInstance {
  /** 客户端实例 */
  client: Client | null
  /** 获取最新的 Client 实例 */
  getClient: () => Client | null
  /** 连接状态 */
  state: ConnectionState
  /** 连接方法 */
  connect: (config: MCPConfig) => Promise<void>
  /** 断开连接 */
  disconnect: () => Promise<void>
}

/**
 * 工具调用参数
 */
export interface ToolCallParams {
  name: string
  arguments?: Record<string, unknown>
}

/**
 * 资源读取参数
 */
export interface ResourceReadParams {
  uri: string
}

/**
 * 提示词获取参数
 */
export interface PromptGetParams {
  name: string
  arguments?: Record<string, string>
}

/**
 * MCP 命令执行结果
 */
export interface MCPCommandResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 工具列表项
 */
export interface ToolItem extends Tool {
  /** 是否正在调用 */
  loading?: boolean
  /** 调用结果 */
  result?: CallToolResult
  /** 调用错误 */
  error?: string
}

/**
 * 资源列表项
 */
export interface ResourceItem extends Resource {
  /** 是否正在读取 */
  loading?: boolean
  /** 读取结果 */
  result?: ReadResourceResult
  /** 读取错误 */
  error?: string
}

/**
 * 提示词列表项
 */
export interface PromptItem extends Prompt {
  /** 是否正在获取 */
  loading?: boolean
  /** 获取结果 */
  result?: GetPromptResult
  /** 获取错误 */
  error?: string
}

/**
 * Tab 页签类型
 */
export type TabType = 'tools' | 'resources' | 'prompts'
