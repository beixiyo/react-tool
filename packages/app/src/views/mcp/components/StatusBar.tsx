import type { ConnectionState } from '../types'

export interface StatusBarProps {
  state: ConnectionState
}

export function StatusBar({ state }: StatusBarProps) {
  const { status, serverInfo, capabilities } = state

  const statusConfig = {
    idle: {
      color: 'text-textDisabled',
      bg: 'bg-backgroundSubtle',
      border: 'border-border',
      label: 'Not Connected',
    },
    connecting: {
      color: 'text-info',
      bg: 'bg-blueBgColor',
      border: 'border-blueBorderColor',
      label: 'Connecting...',
    },
    connected: {
      color: 'text-success',
      bg: 'bg-greenBgColor',
      border: 'border-greenBorderColor',
      label: 'Connected',
    },
    disconnected: {
      color: 'text-textDisabled',
      bg: 'bg-backgroundSubtle',
      border: 'border-border',
      label: 'Disconnected',
    },
    error: {
      color: 'text-danger',
      bg: 'bg-redBgColor',
      border: 'border-redBorderColor',
      label: 'Error',
    },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-6 py-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-4">
        <div className={ `rounded-full border ${config.border} ${config.bg} px-3 py-1` }>
          <span className={ `text-xs font-medium ${config.color}` }>
            {config.label}
          </span>
        </div>

        {status === 'connected' && serverInfo && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-textDisabled">Server:</span>
              <span className="font-medium text-textPrimary">
                {serverInfo.name}
                {' '}
                v
                {serverInfo.version}
              </span>
            </div>
          </>
        )}
      </div>

      {status === 'connected' && capabilities && (
        <div className="flex items-center gap-2">
          {capabilities.tools && (
            <CapabilityBadge>🔧 Tools</CapabilityBadge>
          )}
          {capabilities.resources && (
            <CapabilityBadge>📁 Resources</CapabilityBadge>
          )}
          {capabilities.prompts && (
            <CapabilityBadge>💬 Prompts</CapabilityBadge>
          )}
        </div>
      )}
    </div>
  )
}

function CapabilityBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-backgroundSubtle px-2.5 py-1 text-xs font-medium text-textSecondary">
      {children}
    </span>
  )
}
