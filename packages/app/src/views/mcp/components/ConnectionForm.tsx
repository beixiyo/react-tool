import type { ConnectionState, MCPConfig, TransportType } from '../types'
import { motion } from 'motion/react'
import { useState } from 'react'
import { PRESET_URLS, TRANSPORT_TYPE_OPTIONS } from '../constants'

export interface ConnectionFormProps {
  state: ConnectionState
  onConnect: (config: MCPConfig) => Promise<void>
  onDisconnect: () => Promise<void>
}

export function ConnectionForm({ state, onConnect, onDisconnect }: ConnectionFormProps) {
  const [transportType, setTransportType] = useState<TransportType>('streamable-http')
  const [url, setUrl] = useState('')
  const [customHeaders, setCustomHeaders] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCapabilities, setShowCapabilities] = useState(false)

  const isConnected = state.status === 'connected'
  const isConnecting = state.status === 'connecting'

  const handleConnect = async () => {
    if (!url.trim())
      return

    setLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (customHeaders.trim()) {
        customHeaders.split('\n').forEach((line) => {
          const [key, ...values] = line.split(':')
          if (key && values.length) {
            headers[key.trim()] = values.join(':').trim()
          }
        })
      }

      await onConnect({
        transportType,
        url: url.trim(),
        customHeaders: Object.keys(headers).length > 0
          ? headers
          : undefined,
      })
    }
    finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      await onDisconnect()
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Transport Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text">
          Transport Type
        </label>
        <div className="flex gap-2">
          {TRANSPORT_TYPE_OPTIONS.map(option => (
            <button
              key={ option.value }
              disabled={ isConnected || loading }
              onClick={ () => setTransportType(option.value) }
              className={ `flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                transportType === option.value
                  ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                  : 'border-border bg-background text-text2 hover:border-border3 hover:bg-background2 hover:text-text'
              }` }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text">
          Server URL
        </label>
        <input
          type="text"
          value={ url }
          onChange={ e => setUrl(e.target.value) }
          disabled={ isConnected || loading }
          placeholder="http://localhost:3000/sse"
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text placeholder-textDisabled transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Preset URLs */}
        <div className="flex flex-wrap gap-2">
          {PRESET_URLS[transportType].map((preset, idx) => (
            <button
              key={ idx }
              disabled={ isConnected || loading }
              onClick={ () => setUrl(preset) }
              className="rounded-full border border-border bg-background2 px-3 py-1 text-xs text-text2 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Headers */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text">
          Custom Headers
          <span className="ml-2 text-xs font-normal text-textDisabled">(optional)</span>
        </label>
        <textarea
          value={ customHeaders }
          onChange={ e => setCustomHeaders(e.target.value) }
          disabled={ isConnected || loading }
          placeholder="Authorization: Bearer token&#10;X-Custom-Header: value"
          rows={ 3 }
          className="resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text placeholder-textDisabled transition-colors focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Connect/Disconnect Button */}
      <button
        onClick={ isConnected
          ? handleDisconnect
          : handleConnect }
        disabled={ loading || isConnecting || (!isConnected && !url.trim()) }
        className={ `flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
          isConnected
            ? 'border border-border bg-background text-text hover:border-danger hover:bg-danger/5 hover:text-danger'
            : 'border border-transparent bg-blue-600 text-white shadow-xs hover:bg-blue-700'
        }` }
      >
        {loading || isConnecting
          ? (
              <>
                <Spinner />
                <span>Connecting...</span>
              </>
            )
          : isConnected
            ? (
                <span>Disconnect</span>
              )
            : (
                <span>Connect</span>
              )}
      </button>

      {/* Connection Status */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-background2 p-4">
        <div className="flex items-center gap-2">
          <StatusIndicator status={ state.status } />
          <span className="text-sm font-medium text-text capitalize">
            {state.status}
          </span>
        </div>

        {state.error && (
          <motion.div
            initial={ { opacity: 0, height: 0 } }
            animate={ { opacity: 1, height: 'auto' } }
            className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            {state.error}
          </motion.div>
        )}

        {isConnected && state.serverInfo && (
          <motion.div
            initial={ { opacity: 0, height: 0 } }
            animate={ { opacity: 1, height: 'auto' } }
            className="flex flex-col gap-2 border-t border-border pt-3"
          >
            <button
              onClick={ () => setShowCapabilities(!showCapabilities) }
              className="flex items-center justify-between text-sm text-text2 hover:text-text"
            >
              <span className="font-medium">Server Info</span>
              <span className="text-xs">
                {showCapabilities
                  ? '▼'
                  : '▶'}
              </span>
            </button>

            {showCapabilities && (
              <motion.div
                initial={ { opacity: 0 } }
                animate={ { opacity: 1 } }
                className="flex flex-col gap-2 text-xs"
              >
                <div className="flex justify-between">
                  <span className="text-textDisabled">Name:</span>
                  <span className="font-medium text-text">{state.serverInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textDisabled">Version:</span>
                  <span className="font-medium text-text">{state.serverInfo.version}</span>
                </div>

                {state.capabilities && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {state.capabilities.tools && (
                      <Badge>Tools</Badge>
                    )}
                    {state.capabilities.resources && (
                      <Badge>Resources</Badge>
                    )}
                    {state.capabilities.prompts && (
                      <Badge>Prompts</Badge>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Status Indicator Component
function StatusIndicator({ status }: { status: ConnectionState['status'] }) {
  const colors = {
    idle: 'bg-textDisabled',
    connecting: 'bg-info animate-pulse',
    connected: 'bg-success',
    disconnected: 'bg-textDisabled',
    error: 'bg-danger',
  }

  return (
    <span className={ `h-2 w-2 rounded-full ${colors[status]}` } />
  )
}

// Badge Component
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-text2">
      {children}
    </span>
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
