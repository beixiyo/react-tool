import type { GenerationLog } from '../../types'
import { Skeleton } from 'comps'
import { AnimatePresence, motion } from 'framer-motion'
import { memo } from 'react'
import { cn } from 'utils'

interface GenerationProgressProps {
  /** 进度百分比 (0-100) */
  progress: number
  /** 当前步骤描述 */
  currentStep: string
  /** 日志列表 */
  logs: GenerationLog[]
  /** 自定义类名 */
  className?: string
}

export const GenerationProgress = memo<GenerationProgressProps>((props) => {
  const { progress, currentStep, logs, className } = props

  return (
    <div className={ cn(
      'GenerationProgress flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white/90 p-8 dark:border-slate-700 dark:bg-slate-900/80',
      className,
    ) }>
      {/* 进度条 */ }
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            AI 正在生成方案
          </h3>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            { Math.round(progress) }
            %
          </span>
        </div>

        <div className="relative h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <motion.div
            initial={ { width: 0 } }
            animate={ { width: `${progress}%` } }
            transition={ { duration: 0.5, ease: 'easeInOut' } }
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
          />
        </div>

        { currentStep && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            { currentStep }
          </p>
        ) }
      </div>

      {/* 骨架屏 - 预览方案布局 */ }
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        { [1, 2, 3].map(index => (
          <SkeletonCard key={ index } delay={ index * 0.1 } />
        )) }
      </div>

      {/* 日志滚动区域 */ }
      { logs.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            实时日志
          </h4>
          <div className="max-h-32 overflow-y-auto rounded-lg bg-slate-50 p-3 dark:bg-slate-950/50">
            <AnimatePresence initial={ false }>
              { logs.slice(-5).map(log => (
                <LogItem key={ log.id } log={ log } />
              )) }
            </AnimatePresence>
          </div>
        </div>
      ) }
    </div>
  )
})

GenerationProgress.displayName = 'GenerationProgress'

/** 骨架屏卡片 */
interface SkeletonCardProps {
  delay?: number
}

const SkeletonCard = memo<SkeletonCardProps>(({ delay = 0 }) => {
  return (
    <motion.div
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.4, delay } }
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/50 p-5 dark:border-slate-700 dark:bg-slate-900/50"
    >
      {/* 标题骨架 */}
      <Skeleton className="h-5 w-3/4" />

      {/* 内容骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>

      {/* 标签骨架 */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </motion.div>
  )
})

SkeletonCard.displayName = 'SkeletonCard'

/** 日志项 */
interface LogItemProps {
  log: GenerationLog
}

const LogItem = memo<LogItemProps>(({ log }) => {
  const typeIcons = {
    info: '↻',
    success: '✓',
    warning: '⚠',
    error: '✗',
  }

  const typeColors = {
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <motion.div
      initial={ { opacity: 0, x: -10 } }
      animate={ { opacity: 1, x: 0 } }
      exit={ { opacity: 0, x: 10 } }
      transition={ { duration: 0.2 } }
      className="flex items-start gap-2 py-1"
    >
      <span className={ cn('text-sm font-medium', typeColors[log.type]) }>
        { typeIcons[log.type] }
      </span>
      <p className="flex-1 text-xs text-slate-600 dark:text-slate-300">
        { log.message }
      </p>
    </motion.div>
  )
})

LogItem.displayName = 'LogItem'
