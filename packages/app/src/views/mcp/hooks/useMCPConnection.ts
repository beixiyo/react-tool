import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type { ConnectionState, MCPClientInstance, MCPConfig } from '../types'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import {
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { useCallback, useRef, useState } from 'react'
import { CLIENT_INFO, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import {

  ConnectionStatus,

} from '../types'

/**
 * MCP 连接管理 Hook
 */
export function useMCPConnection(): MCPClientInstance {
  const [client, setClient] = useState<Client | null>(null)
  const [state, setState] = useState<ConnectionState>({
    status: ConnectionStatus.DISCONNECTED,
  })

  const clientRef = useRef<Client | null>(null)
  const transportRef = useRef<Transport | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  /**
   * 从响应头中捕获 session ID 和协议版本
   */
  const captureResponseHeaders = useCallback((response: Response): void => {
    const sessionId = response.headers.get('mcp-session-id')
    const protocolVersion = response.headers.get('mcp-protocol-version')

    /** 调试：显示所有可访问的响应头 */
    console.log('[DEBUG] Available headers:', Array.from(response.headers.keys()))
    console.log('[DEBUG] mcp-session-id:', sessionId)
    console.log('[DEBUG] mcp-protocol-version:', protocolVersion)

    if (sessionId && sessionId !== sessionIdRef.current) {
      sessionIdRef.current = sessionId
      console.log('✅ Session ID captured:', sessionId)
    }
    else if (!sessionId) {
      console.warn('⚠️ mcp-session-id header not accessible. Server needs to expose it via Access-Control-Expose-Headers')
    }

    if (protocolVersion) {
      console.log('Protocol version:', protocolVersion)
    }
  }, [])

  /**
   * 创建传输层
   */
  const createTransport = useCallback(async (config: MCPConfig): Promise<Transport> => {
    const { transportType, url, customHeaders = {} } = config

    if (transportType === 'sse') {
      // SSE 传输
      return new SSEClientTransport(new URL(url), {
        fetch: async (
          input: string | URL | globalThis.Request,
          init?: RequestInit,
        ) => {
          /** 动态构建请求头，确保包含最新的 session ID */
          const requestHeaders: Record<string, string> = {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json',
            ...customHeaders,
          }

          /** 如果有 session ID，添加到请求头 */
          if (sessionIdRef.current) {
            requestHeaders['mcp-session-id'] = sessionIdRef.current
            console.log('[DEBUG] SSE: Sending request with session ID:', sessionIdRef.current)
          }
          else {
            console.log('[DEBUG] SSE: Sending request without session ID (initial request)')
          }

          const response = await fetch(input, {
            ...init,
            headers: {
              ...init?.headers,
              ...requestHeaders,
            },
          })
          captureResponseHeaders(response)
          return response
        },
      })
    }
    else {
      // Streamable HTTP 传输
      return new StreamableHTTPClientTransport(new URL(url), {
        sessionId: sessionIdRef.current || undefined,
        fetch: async (
          input: string | URL | globalThis.Request,
          init?: RequestInit,
        ) => {
          /** 动态构建请求头，确保包含最新的 session ID */
          const requestHeaders: Record<string, string> = {
            'Accept': 'text/event-stream, application/json',
            'Content-Type': 'application/json',
            ...customHeaders,
          }

          /** 如果有 session ID，添加到请求头 */
          if (sessionIdRef.current) {
            requestHeaders['mcp-session-id'] = sessionIdRef.current
            console.log('[DEBUG] Sending request with session ID:', sessionIdRef.current)
          }
          else {
            console.log('[DEBUG] Sending request without session ID (initial request)')
          }

          const response = await fetch(input, {
            ...init,
            headers: {
              ...init?.headers,
              ...requestHeaders,
            },
          })
          captureResponseHeaders(response)
          return response
        },
      })
    }
  }, [captureResponseHeaders])

  /**
   * 断开连接
   */
  const disconnect = useCallback(async () => {
    try {
      /** 对于 Streamable HTTP，需要先终止会话 */
      if (transportRef.current && 'terminateSession' in transportRef.current) {
        await (transportRef.current as StreamableHTTPClientTransport).terminateSession()
      }

      if (clientRef.current) {
        await clientRef.current.close()
      }

      clientRef.current = null
      transportRef.current = null
      sessionIdRef.current = null
      setClient(null)

      setState({
        status: ConnectionStatus.DISCONNECTED,
      })

      console.log(SUCCESS_MESSAGES.DISCONNECTED)
    }
    catch (error) {
      console.error('Disconnect error:', error)
      setState({
        status: ConnectionStatus.ERROR,
        error: ERROR_MESSAGES.DISCONNECT_FAILED,
      })
    }
  }, [])

  /**
   * 连接到 MCP 服务器
   */
  const connect = useCallback(async (config: MCPConfig) => {
    try {
      /** 如果已经连接，先断开 */
      if (clientRef.current) {
        await disconnect()
      }

      setState({
        status: ConnectionStatus.CONNECTING,
      })

      /** 创建传输层 */
      const transport = await createTransport(config)
      transportRef.current = transport

      /** 创建客户端 */
      const client = new Client(CLIENT_INFO, {
        capabilities: {
          /** 客户端能力 */
          experimental: {},
          sampling: {},
        },
      })
      clientRef.current = client
      setClient(client)

      /** 连接到服务器 */
      await client.connect(transport)

      /** 获取服务器能力和信息 */
      const serverCapabilities = client.getServerCapabilities()
      const serverInfo = client.getServerVersion()

      setState({
        status: ConnectionStatus.CONNECTED,
        capabilities: serverCapabilities || undefined,
        serverInfo: {
          name: serverInfo?.name || 'Unknown',
          version: serverInfo?.version || 'Unknown',
        },
      })

      console.log(SUCCESS_MESSAGES.CONNECTED, { serverCapabilities, serverInfo })
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error)

      setState({
        status: ConnectionStatus.ERROR,
        error: `${ERROR_MESSAGES.CONNECT_FAILED}: ${errorMessage}`,
      })

      /** 清理 */
      clientRef.current = null
      transportRef.current = null
      setClient(null)

      console.error('Connection error:', error)
      throw error
    }
  }, [createTransport, disconnect])

  return {
    client,
    getClient: () => clientRef.current,
    state,
    connect,
    disconnect,
  }
}
