import type { ContextSummary } from '../../types'
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useState } from 'react'
import { cn } from 'utils'

interface ContextSelectorProps {
  contexts: ContextSummary[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  className?: string
}

export const ContextSelector = memo<ContextSelectorProps>((props) => {
  const { contexts, selectedIds, onChange, className } = props
  const [isExpanded, setIsExpanded] = useState(false)

  if (!contexts.length) {
    return (
      <div className={ cn(
        'rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400',
        className,
      ) }>
        暂无可用的历史上下文
      </div>
    )
  }

  const handleToggle = (contextId: string) => {
    if (selectedIds.includes(contextId)) {
      onChange(selectedIds.filter(id => id !== contextId))
    }
    else {
      onChange([...selectedIds, contextId])
    }
  }

  const selectedCount = selectedIds.length
  const importanceColors = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <div className={ cn('flex flex-col gap-3', className) }>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            上下文选择
          </h4>
          {selectedCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {selectedCount}
            </span>
          )}
        </div>
        <button
          onClick={ () => setIsExpanded(!isExpanded) }
          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {isExpanded
            ? '收起'
            : '展开'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded
          ? (
              <motion.div
                initial={ { height: 0, opacity: 0 } }
                animate={ { height: 'auto', opacity: 1 } }
                exit={ { height: 0, opacity: 0 } }
                transition={ { duration: 0.2 } }
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {contexts.map(context => (
                    <ContextItem
                      key={ context.id }
                      context={ context }
                      isSelected={ selectedIds.includes(context.id) }
                      onToggle={ () => handleToggle(context.id) }
                    />
                  ))}
                </div>
              </motion.div>
            )
          : (
              <motion.div
                initial={ { opacity: 0 } }
                animate={ { opacity: 1 } }
                exit={ { opacity: 0 } }
                className="flex flex-wrap gap-2"
              >
                {contexts.slice(0, 3).map(context => (
                  <button
                    key={ context.id }
                    onClick={ () => handleToggle(context.id) }
                    className={ cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                      selectedIds.includes(context.id)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
                    ) }
                  >
                    <span className={ cn(
                      'h-1.5 w-1.5 rounded-full',
                      importanceColors[context.importance],
                    ) } />
                    {context.title}
                  </button>
                ))}
                {contexts.length > 3 && (
                  <button
                    onClick={ () => setIsExpanded(true) }
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    +
                    {contexts.length - 3}
                    {' '}
                    个更多
                  </button>
                )}
              </motion.div>
            )}
      </AnimatePresence>
    </div>
  )
})

interface ContextItemProps {
  context: ContextSummary
  isSelected: boolean
  onToggle: () => void
}

const ContextItem = memo<ContextItemProps>((props) => {
  const { context, isSelected, onToggle } = props

  const importanceColors = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <button
      onClick={ onToggle }
      className={ cn(
        'group w-full rounded-lg border p-3 text-left transition-all',
        isSelected
          ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800',
      ) }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className={ cn(
              'text-sm font-medium truncate',
              isSelected
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-slate-900 dark:text-slate-100',
            ) }>
              {context.title}
            </h5>
            <span className={ cn(
              'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium',
              importanceColors[context.importance],
            ) }>
              {context.importance}
            </span>
          </div>
          <p className={ cn(
            'text-xs line-clamp-2',
            isSelected
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-slate-500 dark:text-slate-400',
          ) }>
            {context.summary}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className={ cn(
            'h-4 w-4 rounded border-2 transition-colors',
            isSelected
              ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
              : 'border-slate-300 group-hover:border-slate-400 dark:border-slate-600 dark:group-hover:border-slate-500',
          ) }>
            {isSelected && (
              <svg className="h-full w-full text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatTime(context.updatedAt)}
          </span>
        </div>
      </div>

      {/* Token信息 */}
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <span>
          原始:
          {context.tokens.original.toLocaleString()}
        </span>
        <span>
          压缩:
          {context.tokens.compressed.toLocaleString()}
        </span>
        <span className="text-green-600 dark:text-green-400">
          节省
          {' '}
          {Math.round((1 - context.tokens.compressed / context.tokens.original) * 100)}
          %
        </span>
      </div>
    </button>
  )
})

ContextItem.displayName = 'ContextItem'
ContextSelector.displayName = 'ContextSelector'
