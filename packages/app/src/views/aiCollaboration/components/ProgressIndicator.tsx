/**
 * 进度指示器组件
 */

import { motion } from 'framer-motion'
import { memo } from 'react'
import { cn } from 'utils'
import { useSnapshot } from 'valtio'
import { workflowStore } from '../hooks/useWorkflow'

export type ProgressIndicatorProps = {
  className?: string
  style?: React.CSSProperties
}

export const ProgressIndicator = memo<ProgressIndicatorProps>((props) => {
  const {
    className,
    style,
  } = props

  const snap = useSnapshot(workflowStore, { sync: true })

  if (!snap.isGenerating)
    return null

  return (
    <div
      className={ cn(
        'ProgressIndicator flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      ) }
      style={ style }
    >
      {/* 当前步骤 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {snap.currentStep}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {Math.round(snap.generationProgress * 100)}
          %
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
          initial={ { width: 0 } }
          animate={ { width: `${snap.generationProgress * 100}%` } }
          transition={ { duration: 0.3, ease: 'easeOut' } }
        />
      </div>

      {/* 日志列表 */}
      {snap.generationLogs && snap.generationLogs.length > 0 && (
        <div className="max-h-32 space-y-1 overflow-y-auto">
          {snap.generationLogs.slice(-5).map(log => (
            <div
              key={ log.id }
              className={ cn(
                'flex items-center gap-2 text-xs',
                log.type === 'success' && 'text-green-600 dark:text-green-400',
                log.type === 'info' && 'text-slate-600 dark:text-slate-400',
                log.type === 'warning' && 'text-yellow-600 dark:text-yellow-400',
                log.type === 'error' && 'text-red-600 dark:text-red-400',
              ) }
            >
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

ProgressIndicator.displayName = 'ProgressIndicator'
