import { ConnectionStatus, type MCPConfig } from './types'

/**
 * 传输类型选项
 */
export const TRANSPORT_TYPE_OPTIONS = [
  { value: 'sse', label: 'SSE' },
  { value: 'streamable-http', label: 'Streamable HTTP' },
] as const

/**
 * 默认连接配置
 */
export const DEFAULT_CONFIG: MCPConfig = {
  transportType: 'streamable-http',
  url: 'http://localhost:9527/mcp',
  customHeaders: {},
}

/**
 * 连接状态文本映射
 */
export const CONNECTION_STATUS_TEXT: Record<ConnectionStatus, string> = {
  [ConnectionStatus.DISCONNECTED]: '未连接',
  [ConnectionStatus.CONNECTING]: '连接中...',
  [ConnectionStatus.CONNECTED]: '已连接',
  [ConnectionStatus.ERROR]: '连接错误',
}

/**
 * 连接状态颜色映射 (Tailwind CSS)
 */
export const CONNECTION_STATUS_COLOR: Record<ConnectionStatus, string> = {
  [ConnectionStatus.DISCONNECTED]: 'text-gray-500',
  [ConnectionStatus.CONNECTING]: 'text-yellow-500',
  [ConnectionStatus.CONNECTED]: 'text-green-500',
  [ConnectionStatus.ERROR]: 'text-red-500',
}

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  CONNECT_FAILED: '连接失败，请检查服务器地址和网络连接',
  INVALID_URL: '无效的 URL 地址',
  TOOL_CALL_FAILED: '工具调用失败',
  RESOURCE_READ_FAILED: '资源读取失败',
  PROMPT_GET_FAILED: '提示词获取失败',
  NOT_CONNECTED: '未连接到 MCP 服务器',
  DISCONNECT_FAILED: '断开连接失败',
}

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
  CONNECTED: '成功连接到 MCP 服务器',
  DISCONNECTED: '已断开连接',
  TOOL_CALLED: '工具调用成功',
  RESOURCE_READ: '资源读取成功',
  PROMPT_GET: '提示词获取成功',
}

/**
 * 预设的服务器 URL 示例
 */
export const PRESET_URLS = {
  sse: [
    'http://localhost:3000/sse',
  ],
  'streamable-http': [
    'http://localhost:9527/mcp',
  ],
}

/**
 * 客户端标识
 */
export const CLIENT_INFO = {
  name: 'mcp-web-client',
  version: '1.0.0',
}
