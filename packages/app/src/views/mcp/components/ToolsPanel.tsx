import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useMCPCommands } from '../hooks/useMCPCommands'

export interface ToolsPanelProps {
  client: Client | null
}

export function ToolsPanel({ client }: ToolsPanelProps) {
  const { listTools, callTool, loading } = useMCPCommands(client)
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [toolArgs, setToolArgs] = useState('')
  const [result, setResult] = useState<CallToolResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleListTools = async () => {
    setError(null)
    const res = await listTools()
    if (res.success && res.data) {
      setTools(res.data)
      if (res.data.length > 0) {
        setSelectedTool(res.data[0])
      }
    } else {
      setError(res.error || 'Failed to list tools')
    }
  }

  const handleCallTool = async () => {
    if (!selectedTool) return

    setError(null)
    setResult(null)

    let args: any = {}
    if (toolArgs.trim()) {
      try {
        args = JSON.parse(toolArgs)
      } catch (e) {
        setError('Invalid JSON in arguments')
        return
      }
    }

    const res = await callTool({
      name: selectedTool.name,
      arguments: args,
    })

    if (res.success && res.data) {
      setResult(res.data)
    } else {
      setError(res.error || 'Tool call failed')
    }
  }

  if (!client) {
    return <EmptyState message="Please connect to an MCP server first" />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Load Tools Button */}
      <button
        onClick={handleListTools}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primaryHover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Loading...</span>
          </>
        ) : (
          <span>Load Available Tools</span>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {error}
        </motion.div>
      )}

      {/* Tools List */}
      {tools.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-4"
        >
          {/* Tool Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-textPrimary">
              Select Tool
            </label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {tools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTool(tool)}
                  className={`rounded-lg border px-4 py-3 text-left transition-all active:scale-95 ${
                    selectedTool?.name === tool.name
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-background hover:border-borderStrong hover:bg-backgroundSubtle'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm font-medium ${
                      selectedTool?.name === tool.name
                        ? 'text-primary'
                        : 'text-textPrimary'
                    }`}>
                      {tool.name}
                    </span>
                    {tool.description && (
                      <span className="text-xs text-textSecondary">
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-textPrimary">
                  Arguments (JSON)
                </label>
                {selectedTool.inputSchema && (
                  <div className="rounded-lg border border-border bg-backgroundSubtle p-3 text-xs">
                    <pre className="overflow-x-auto text-textSecondary">
                      {JSON.stringify(selectedTool.inputSchema, null, 2)}
                    </pre>
                  </div>
                )}
                <textarea
                  value={toolArgs}
                  onChange={e => setToolArgs(e.target.value)}
                  placeholder='{"param": "value"}'
                  rows={4}
                  className="resize-none rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-textPrimary placeholder-textDisabled transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Call Tool Button */}
              <button
                onClick={handleCallTool}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primaryHover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner />
                    <span>Calling...</span>
                  </>
                ) : (
                  <span>Call Tool</span>
                )}
              </button>
            </motion.div>
          )}

          {/* Result Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <label className="text-sm font-medium text-textPrimary">
                Result
              </label>
              <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                <pre className="overflow-x-auto text-xs text-textPrimary">
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-backgroundSubtle py-12">
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