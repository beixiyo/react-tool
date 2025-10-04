import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type {
  Prompt,
  PromptArgument,
  GetPromptResult,
  PromptMessage,
} from '@modelcontextprotocol/sdk/types.js'
import { useMCPCommands } from '../hooks/useMCPCommands'

export interface PromptsPanelProps {
  client: Client | null
}

export function PromptsPanel({ client }: PromptsPanelProps) {
  const { listPrompts, getPrompt, loading } = useMCPCommands(client)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [promptArgs, setPromptArgs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<GetPromptResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleListPrompts = async () => {
    setError(null)
    const res = await listPrompts()
    if (res.success && res.data) {
      const { prompts: promptList = [] } = res.data
      setPrompts(promptList)
      if (promptList.length > 0) {
        setSelectedPrompt(promptList[0])
        initializeArgs(promptList[0])
      }
    } else {
      setError(res.error || 'Failed to list prompts')
    }
  }

  const initializeArgs = (prompt: Prompt) => {
    if (prompt.arguments && prompt.arguments.length > 0) {
      const initialArgs: Record<string, string> = {}
      prompt.arguments.forEach((arg: PromptArgument) => {
        initialArgs[arg.name] = ''
      })
      setPromptArgs(initialArgs)
    } else {
      setPromptArgs({})
    }
  }

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setResult(null)
    setError(null)
    initializeArgs(prompt)
  }

  const handleGetPrompt = async () => {
    if (!selectedPrompt) return

    setError(null)
    setResult(null)

    const res = await getPrompt({
      name: selectedPrompt.name,
      arguments: promptArgs,
    })

    if (res.success) {
      setResult(res.data as GetPromptResult)
    } else {
      setError(res.error || 'Failed to get prompt')
    }
  }

  if (!client) {
    return <EmptyState message="Please connect to an MCP server first" />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Load Prompts Button */}
      <button
        onClick={handleListPrompts}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primaryHover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Loading...</span>
          </>
        ) : (
          <span>Load Available Prompts</span>
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

      {/* Prompts List */}
      {prompts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-4"
        >
          {/* Prompt Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-textPrimary">
              Select Prompt
            </label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {prompts.map(prompt => (
                <button
                  key={prompt.name}
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`rounded-lg border px-4 py-3 text-left transition-all active:scale-95 ${
                    selectedPrompt?.name === prompt.name
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-background hover:border-borderStrong hover:bg-backgroundSubtle'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm font-medium ${
                      selectedPrompt?.name === prompt.name
                        ? 'text-primary'
                        : 'text-textPrimary'
                    }`}>
                      {prompt.name}
                    </span>
                    {prompt.description && (
                      <span className="text-xs text-textSecondary">
                        {prompt.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Arguments */}
          {selectedPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-col gap-4"
            >
              {selectedPrompt.arguments && selectedPrompt.arguments.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-textPrimary">
                    Arguments
                  </label>
                  {selectedPrompt.arguments.map((arg: PromptArgument, idx) => (
                    <div key={`${arg.name}-${idx}`} className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-textSecondary">
                        {arg.name}
                        {arg.required && (
                          <span className="ml-1 text-danger">*</span>
                        )}
                      </label>
                      {arg.description && (
                        <p className="text-xs text-textDisabled">
                          {arg.description}
                        </p>
                      )}
                      <input
                        type="text"
                        value={promptArgs[arg.name] || ''}
                        onChange={e => setPromptArgs(prev => ({
                          ...prev,
                          [arg.name]: e.target.value,
                        }))}
                        placeholder={`Enter ${arg.name}`}
                        className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-textPrimary placeholder-textDisabled transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-textDisabled">
                  No arguments required
                </div>
              )}

              {/* Get Prompt Button */}
              <button
                onClick={handleGetPrompt}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primaryHover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Get Prompt</span>
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
                {result.messages && result.messages.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {result.messages.map((msg, idx) => (
                      <div
                        key={`${msg.role}-${idx}`}
                        className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3"
                      >
                        <div className="inline-flex w-fit items-center rounded-full border border-border bg-backgroundSubtle px-2 py-0.5 text-xs font-medium text-textSecondary">
                          {msg.role}
                        </div>
                        {msg.content && (
                          <div className="flex flex-col gap-2">
                            {msg.content.type === 'text' && (
                              <p className="whitespace-pre-wrap text-sm text-textPrimary">
                                {msg.content.text}
                              </p>
                            )}
                            {msg.content.type === 'image' && (
                              <div className="text-xs text-textDisabled">
                                Image: {msg.content.data}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="overflow-x-auto text-xs text-textPrimary">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
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
      <div className="text-4xl opacity-20">💬</div>
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