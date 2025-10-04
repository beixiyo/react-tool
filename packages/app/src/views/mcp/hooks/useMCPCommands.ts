import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import type {
  CallToolResult,
  GetPromptResult,
  ListPromptsRequest,
  ListPromptsResult,
  ListResourcesRequest,
  ListResourcesResult,
  ReadResourceResult,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import type { MCPCommandResult, PromptGetParams, ResourceReadParams, ToolCallParams } from '../types'
import { useCallback, useState } from 'react'
import { ERROR_MESSAGES } from '../constants'

/**
 * MCP 命令执行 Hook
 */
export function useMCPCommands(client: Client | null) {
  const [loading, setLoading] = useState(false)

  /**
   * 检查客户端是否已连接
   */
  const ensureConnected = useCallback((): Client => {
    if (!client) {
      throw new Error(ERROR_MESSAGES.NOT_CONNECTED)
    }
    return client
  }, [client])

  /**
   * 列出所有工具
   */
  const listTools = useCallback(async (): Promise<MCPCommandResult<Tool[]>> => {
    try {
      setLoading(true)
      const connectedClient = ensureConnected()

      const response = await connectedClient.listTools()

      return {
        success: true,
        data: response.tools,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error)
      return {
        success: false,
        error: `${ERROR_MESSAGES.TOOL_CALL_FAILED}: ${errorMessage}`,
      }
    }
    finally {
      setLoading(false)
    }
  }, [ensureConnected])

  /**
   * 调用工具
   */
  const callTool = useCallback(async (params: ToolCallParams): Promise<MCPCommandResult<CallToolResult>> => {
    try {
      setLoading(true)
      const connectedClient = ensureConnected()

      const response = await connectedClient.callTool({
        name: params.name,
        arguments: params.arguments || {},
      })

      return {
        success: true,
        data: response as CallToolResult,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error)
      return {
        success: false,
        error: `${ERROR_MESSAGES.TOOL_CALL_FAILED}: ${errorMessage}`,
      }
    }
    finally {
      setLoading(false)
    }
  }, [ensureConnected])

  /**
   * 列出所有资源
   */
  const listResources = useCallback(async (
    params?: ListResourcesRequest['params'],
  ): Promise<MCPCommandResult<ListResourcesResult>> => {
    try {
      setLoading(true)
      const connectedClient = ensureConnected()

      const response = await connectedClient.listResources(params)

      return {
        success: true,
        data: response,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error)
      return {
        success: false,
        error: `${ERROR_MESSAGES.RESOURCE_READ_FAILED}: ${errorMessage}`,
      }
    }
    finally {
      setLoading(false)
    }
  }, [ensureConnected])

  /**
   * 读取资源
   */
  const readResource = useCallback(async (params: ResourceReadParams): Promise<MCPCommandResult<ReadResourceResult>> => {
    try {
      setLoading(true)
      const connectedClient = ensureConnected()

      const response = await connectedClient.readResource({
        uri: params.uri,
      })

      return {
        success: true,
        data: response,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error)
      return {
        success: false,
        error: `${ERROR_MESSAGES.RESOURCE_READ_FAILED}: ${errorMessage}`,
      }
    }
    finally {
      setLoading(false)
    }
  }, [ensureConnected])

  /**
   * 列出所有提示词
   */
  const listPrompts = useCallback(async (
    params?: ListPromptsRequest['params'],
  ): Promise<MCPCommandResult<ListPromptsResult>> => {
    try {
      setLoading(true)
      const connectedClient = ensureConnected()

      const response = await connectedClient.listPrompts(params)

      return {
        success: true,
        data: response,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error)
      return {
        success: false,
        error: `${ERROR_MESSAGES.PROMPT_GET_FAILED}: ${errorMessage}`,
      }
    }
    finally {
      setLoading(false)
    }
  }, [ensureConnected])

  /**
   * 获取提示词
   */
  const getPrompt = useCallback(async (params: PromptGetParams): Promise<MCPCommandResult<GetPromptResult>> => {
    try {
      setLoading(true)
      const connectedClient = ensureConnected()

      const response = await connectedClient.getPrompt({
        name: params.name,
        arguments: params.arguments || {},
      })

      return {
        success: true,
        data: response,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error)
      return {
        success: false,
        error: `${ERROR_MESSAGES.PROMPT_GET_FAILED}: ${errorMessage}`,
      }
    }
    finally {
      setLoading(false)
    }
  }, [ensureConnected])

  return {
    loading,
    listTools,
    callTool,
    listResources,
    readResource,
    listPrompts,
    getPrompt,
  }
}
