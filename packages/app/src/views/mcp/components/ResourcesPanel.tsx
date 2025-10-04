import type { Client } from '@modelcontextprotocol/sdk/client/index.js'
import type { Resource, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useMCPCommands } from '../hooks/useMCPCommands'

export interface ResourcesPanelProps {
  client: Client | null
}

export function ResourcesPanel({ client }: ResourcesPanelProps) {
  const { listResources, readResource, loading } = useMCPCommands(client)
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [content, setContent] = useState<ReadResourceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleListResources = async () => {
    setError(null)
    const res = await listResources()
    if (res.success && res.data) {
      const { resources: resourceList = [] } = res.data
      setResources(resourceList)
      if (resourceList.length > 0) {
        setSelectedResource(resourceList[0])
      }
    } else {
      setError(res.error || 'Failed to list resources')
    }
  }

  const handleReadResource = async (resource: Resource) => {
    setError(null)
    setContent(null)
    setSelectedResource(resource)

    const res = await readResource({ uri: resource.uri })

    if (res.success) {
      setContent(res.data ?? null)
    } else {
      setError(res.error || 'Failed to read resource')
    }
  }

  if (!client) {
    return <EmptyState message="Please connect to an MCP server first" />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Load Resources Button */ }
      <button
        onClick={ handleListResources }
        disabled={ loading }
        className="flex items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primaryHover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        { loading ? (
          <>
            <Spinner />
            <span>Loading...</span>
          </>
        ) : (
          <span>Load Available Resources</span>
        ) }
      </button>

      {/* Error Display */ }
      { error && (
        <motion.div
          initial={ { opacity: 0, y: -10 } }
          animate={ { opacity: 1, y: 0 } }
          className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          { error }
        </motion.div>
      ) }

      {/* Resources List */ }
      { resources.length > 0 && (
        <motion.div
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-textPrimary">
              Available Resources
            </label>
            <div className="grid grid-cols-1 gap-2">
              { resources.map(resource => (
                <button
                  key={ resource.uri }
                  onClick={ () => handleReadResource(resource) }
                  disabled={ loading }
                  className={ `rounded-lg border px-4 py-3 text-left transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${selectedResource?.uri === resource.uri
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-background hover:border-borderStrong hover:bg-backgroundSubtle'
                    }` }
                >
                  <div className="flex flex-col gap-1">
                    <span className={ `text-sm font-medium ${selectedResource?.uri === resource.uri
                      ? 'text-primary'
                      : 'text-textPrimary'
                      }` }>
                      { resource.name || resource.uri }
                    </span>
                    { resource.description && (
                      <span className="text-xs text-textSecondary">
                        { resource.description }
                      </span>
                    ) }
                    <span className="mt-1 font-mono text-xs text-textDisabled">
                      { resource.uri }
                    </span>
                  </div>
                </button>
              )) }
            </div>
          </div>

          {/* Content Display */ }
          { content && (
            <motion.div
              initial={ { opacity: 0, y: 10 } }
              animate={ { opacity: 1, y: 0 } }
              className="flex flex-col gap-2"
            >
              <label className="text-sm font-medium text-textPrimary">
                Content
              </label>
              <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                { content.contents && content.contents.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    { content.contents.map((item, idx) => (
                      <div key={ idx } className="flex flex-col gap-2">
                        { item.mimeType && (
                          <div className="inline-flex w-fit items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-textSecondary">
                            { item.mimeType }
                          </div>
                        ) }
                        { (item as any).text && (
                          <pre className="overflow-x-auto text-xs text-textPrimary">
                            { (item as any).text }
                          </pre>
                        ) }

                        { (item as any).blob && (
                          <div className="text-xs text-textDisabled">
                            Binary data ({ (item as any).blob.length ?? 0 } bytes)
                          </div>
                        ) }
                      </div>
                    )) }
                  </div>
                ) : (
                  <pre className="overflow-x-auto text-xs text-textPrimary">
                    { JSON.stringify(content, null, 2) }
                  </pre>
                ) }
              </div>
            </motion.div>
          ) }
        </motion.div>
      ) }
    </div>
  )
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-backgroundSubtle py-12">
      <div className="text-4xl opacity-20">📁</div>
      <p className="text-sm text-textDisabled">{ message }</p>
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