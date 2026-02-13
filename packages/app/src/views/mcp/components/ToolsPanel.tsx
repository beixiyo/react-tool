import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SchemaField, ToolArgumentsState } from './tools'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMCPCommands } from '../hooks/useMCPCommands'
import {
  buildArguments,
  extractSchemaFields,
  getInitialArguments,
  resetArgumentErrors,

  SchemaFieldInput,

} from './tools'

export interface ToolsPanelProps {
  client: Client | null
}

export function ToolsPanel({ client }: ToolsPanelProps) {
  const { listTools, callTool, loading } = useMCPCommands(client)
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [result, setResult] = useState<CallToolResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const toolsCacheRef = useRef<WeakMap<Client, Tool[]>>(new WeakMap())

  const fields = useMemo(() => {
    if (!selectedTool)
      return [] as SchemaField[]
    return extractSchemaFields(selectedTool.inputSchema)
  }, [selectedTool])

  type ArgumentState = {
    values: ToolArgumentsState
    errors: Record<string, string>
  }

  const [{ values, errors }, setArgumentState] = useState<ArgumentState>({
    values: {},
    errors: {},
  })

  useEffect(() => {
    if (!selectedTool) {
      setArgumentState({ values: {}, errors: {} })
      return
    }

    const initialValues = getInitialArguments(fields)
    setArgumentState({
      values: initialValues,
      errors: {},
    })
  }, [selectedTool, fields])

  useEffect(() => {
    if (!client) {
      setTools([])
      setSelectedTool(null)
      return
    }

    const cached = toolsCacheRef.current.get(client)
    if (cached) {
      setTools(cached)
      setSelectedTool((prev) => {
        if (prev) {
          const match = cached.find(item => item.name === prev.name)
          if (match)
            return match
        }
        return cached[0] ?? null
      })
    }
  }, [client])

  const handleListTools = useCallback(async () => {
    setError(null)
    const res = await listTools()
    if (res.success && res.data) {
      const fetchedTools = res.data
      setTools(fetchedTools)
      if (client) {
        toolsCacheRef.current.set(client, fetchedTools)
      }
      if (fetchedTools.length > 0) {
        setSelectedTool(fetchedTools[0])
      }
    }
    else {
      setError(res.error || 'Failed to list tools')
    }
  }, [client, listTools])

  const handleSelectTool = useCallback((tool: Tool) => {
    setSelectedTool(tool)
    setResult(null)
    setError(null)
  }, [])

  const handleArgumentChange = useCallback((key: string, value: unknown) => {
    setArgumentState(prev => ({
      values: {
        ...prev.values,
        [key]: value,
      },
      errors: resetArgumentErrors([key], prev.errors),
    }))
  }, [])

  const handleCallTool = useCallback(async () => {
    if (!selectedTool)
      return

    setError(null)
    setResult(null)

    const { args, errors: validationErrors, generalError } = buildArguments(values, fields)

    if (generalError) {
      setError(generalError)
      setArgumentState(prev => ({
        values: prev.values,
        errors: {
          ...prev.errors,
          ...validationErrors,
        },
      }))
      return
    }

    const res = await callTool({
      name: selectedTool.name,
      arguments: args,
    })

    if (res.success && res.data) {
      setResult(res.data)
      setArgumentState(prev => ({
        values: prev.values,
        errors: {},
      }))
    }
    else {
      setError(res.error || 'Tool call failed')
    }
  }, [selectedTool, values, fields, callTool])

  if (!client) {
    return <EmptyState message="Please connect to an MCP server first" />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Load Tools Button */}
      <button
        onClick={ handleListTools }
        disabled={ loading }
        className="flex items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? (
              <>
                <Spinner />
                <span>Loading...</span>
              </>
            )
          : (
              <span>Load Available Tools</span>
            )}
      </button>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={ { opacity: 0, y: -10 } }
          animate={ { opacity: 1, y: 0 } }
          className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {error}
        </motion.div>
      )}

      {/* Tools List */}
      {tools.length > 0 && (
        <motion.div
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          className="flex flex-col gap-4"
        >
          {/* Tool Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text">
              Select Tool
            </label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {tools.map(tool => (
                <button
                  key={ tool.name }
                  onClick={ () => handleSelectTool(tool) }
                  className={ `rounded-lg border px-4 py-3 text-left transition-all active:scale-95 ${
                    selectedTool?.name === tool.name
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-border bg-background hover:border-border3 hover:bg-background2'
                  }` }
                >
                  <div className="flex flex-col gap-1">
                    <span className={ `text-sm font-medium ${
                      selectedTool?.name === tool.name
                        ? 'text-blue-600'
                        : 'text-text'
                    }` }>
                      {tool.name}
                    </span>
                    {tool.description && (
                      <span className="text-xs text-text2">
                        {tool.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tool Arguments */}
          {selectedTool && (
            <motion.div
              initial={ { opacity: 0, height: 0 } }
              animate={ { opacity: 1, height: 'auto' } }
              className="flex flex-col gap-4"
            >
              {fields.length > 0
                ? (
                    <div className="flex flex-col gap-4">
                      <label className="text-sm font-medium text-text">
                        Arguments
                      </label>
                      <div className="flex flex-col gap-3">
                        {fields.map(field => (
                          <SchemaFieldInput
                            key={ field.key }
                            field={ field }
                            value={ values[field.key] }
                            errors={ errors }
                            onChange={ value => handleArgumentChange(field.key, value) }
                          />
                        ))}
                      </div>
                    </div>
                  )
                : (
                    <div className="text-sm text-textDisabled">
                      No arguments required
                    </div>
                  )}

              {/* Call Tool Button */}
              <button
                onClick={ handleCallTool }
                disabled={ loading }
                className="flex items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? (
                      <>
                        <Spinner />
                        <span>Calling...</span>
                      </>
                    )
                  : (
                      <span>Call Tool</span>
                    )}
              </button>
            </motion.div>
          )}

          {/* Result Display */}
          {result && (
            <motion.div
              initial={ { opacity: 0, y: 10 } }
              animate={ { opacity: 1, y: 0 } }
              className="flex flex-col gap-2"
            >
              <label className="text-sm font-medium text-text">
                Result
              </label>
              <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                <pre className="overflow-x-auto text-xs text-text">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-background2 py-12">
      <div className="text-4xl opacity-20">🔧</div>
      <p className="text-sm text-textDisabled">{message}</p>
    </div>
  )
}

// Spinner Component
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
