import type { TestResult } from '../types'
import { Card } from 'comps'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export type TestCardProps = {
  name: string
  description: string
  result?: TestResult
  isRunning?: boolean
  className?: string
}

export const TestCard = memo<TestCardProps>((props) => {
  const {
    name,
    description,
    result,
    isRunning = false,
    className,
  } = props

  const getStatusIcon = () => {
    if (isRunning) {
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />
    }
    if (result) {
      return result.success
        ? <CheckCircle2 className="w-5 h-5 text-success" />
        : <XCircle className="w-5 h-5 text-danger" />
    }
    return null
  }

  const getStatusColor = () => {
    if (isRunning) {
      return 'border-primary'
    }
    if (result) {
      return result.success
        ? 'border-success'
        : 'border-danger'
    }
    return 'border-border'
  }

  return (
    <Card
      className={ cn(
        'transition-all duration-200',
        getStatusColor(),
        className,
      ) }
      variant="default"
      bordered
      shadow="sm"
      padding="default"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-textPrimary mb-1">
            {name}
          </h3>
          <p className="text-sm text-textSecondary mb-2">
            {description}
          </p>
          {result && (
            <div className="mt-3 space-y-1 text-xs">
              <div className={ cn(
                'px-2 py-1 rounded',
                result.success
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger',
              ) }>
                {result.message}
              </div>
              {!result.success && (
                <div className="text-textSecondary space-y-0.5">
                  <div>
                    <span className="font-medium">期望:</span>
                    {' '}
                    {result.expected}
                  </div>
                  <div>
                    <span className="font-medium">实际:</span>
                    {' '}
                    {result.actual}
                  </div>
                  {result.error && (
                    <div className="text-danger mt-1">
                      <span className="font-medium">错误:</span>
                      {' '}
                      {result.error}
                    </div>
                  )}
                </div>
              )}
              {result.duration !== undefined && (
                <div className="text-textTertiary text-xs mt-1">
                  耗时:
                  {' '}
                  {result.duration}
                  ms
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
})

TestCard.displayName = 'TestCard'
