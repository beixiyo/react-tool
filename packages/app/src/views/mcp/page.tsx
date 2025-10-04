import type { TabType } from './types'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ConnectionForm } from './components/ConnectionForm'
import { PromptsPanel } from './components/PromptsPanel'
import { ResourcesPanel } from './components/ResourcesPanel'
import { StatusBar } from './components/StatusBar'
import { ToolsPanel } from './components/ToolsPanel'
import { useMCPConnection } from './hooks/useMCPConnection'

export default function MCPClientPage() {
  const { client, state, connect, disconnect } = useMCPConnection()
  const [activeTab, setActiveTab] = useState<TabType>('tools')

  const tabs: Array<{ id: TabType, label: string, icon: string }> = [
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'resources', label: 'Resources', icon: '📁' },
    { id: 'prompts', label: 'Prompts', icon: '💬' },
  ]

  return (
    <div className="min-h-screen bg-backgroundSubtle transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-14">
        {/* Header */}
        <motion.header
          initial={ { opacity: 0, y: -20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.6, ease: 'easeOut' } }
          className="mb-10 flex flex-col gap-3"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs uppercase tracking-widest text-textSecondary shadow-sm backdrop-blur">
            Model Context Protocol
          </div>
          <h1 className="text-3xl font-semibold text-textPrimary md:text-4xl">
            MCP Web Client
          </h1>
          <p className="max-w-3xl text-base text-textSecondary">
            Connect to MCP servers via SSE or HTTP transport. Explore tools, resources, and prompts in real-time.
          </p>
        </motion.header>

        {/* Main Content Grid */}
        <motion.div
          initial={ { opacity: 0, y: 40 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.6, ease: 'easeOut', delay: 0.1 } }
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Left Panel - Connection */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm backdrop-blur">
              <div className="border-b border-border bg-backgroundSubtle px-6 py-4">
                <h2 className="text-lg font-semibold text-textPrimary">Connection</h2>
              </div>
              <div className="p-6">
                <ConnectionForm
                  state={ state }
                  onConnect={ connect }
                  onDisconnect={ disconnect }
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Features */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm backdrop-blur">
              {/* Tabs */}
              <div className="border-b border-border bg-backgroundSubtle px-6">
                <div className="flex gap-1">
                  {tabs.map(tab => (
                    <TabButton
                      key={ tab.id }
                      active={ activeTab === tab.id }
                      onClick={ () => setActiveTab(tab.id) }
                      label={ tab.label }
                      emoji={ tab.icon }
                    />
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'tools' && (
                  <ToolsPanel client={ client } />
                )}
                {activeTab === 'resources' && (
                  <ResourcesPanel client={ client } />
                )}
                {activeTab === 'prompts' && (
                  <PromptsPanel client={ client } />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Status Bar */}
        <motion.div
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          transition={ { duration: 0.6, delay: 0.2 } }
          className="mt-6"
        >
          <StatusBar state={ state } />
        </motion.div>
      </div>
    </div>
  )
}

// Tab Button Component with animated underline
function TabButton({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean
  onClick: () => void
  label: string
  emoji: string
}) {
  return (
    <button
      onClick={ onClick }
      className={ `relative px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-primary'
          : 'text-textSecondary hover:text-textPrimary'
      }` }
    >
      <span className="flex items-center gap-2">
        <span>{emoji}</span>
        <span>{label}</span>
      </span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          transition={ { type: 'spring', stiffness: 380, damping: 30 } }
        />
      )}
    </button>
  )
}
