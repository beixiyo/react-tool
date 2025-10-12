/**
 * 历史记录列表组件
 */

import { motion } from 'framer-motion'
import { memo } from 'react'
import { cn } from 'utils'
import { useSnapshot } from 'valtio'
import { loadHistorySession, workflowStore } from '../hooks/useWorkflow'
import { WorkflowStage } from '../types'

export type HistoryListProps = {
  className?: string
  isCollapsed?: boolean
}

export const HistoryList = memo<HistoryListProps>((props) => {
  const {
    className,
    isCollapsed = false,
  } = props

  const snap = useSnapshot(workflowStore, { sync: true })
  const { historyList, selectedHistoryId } = snap

  if (!historyList || historyList.length === 0) {
    return (
      <div
        className={ cn(
          'flex flex-1 flex-col gap-4 overflow-hidden',
          className,
        ) }
      >
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          暂无历史记录
        </div>
      </div>
    )
  }

  const handleSelect = (sessionId: string) => {
    loadHistorySession(sessionId)
  }

  return (
    <div
      className={ cn(
        'flex flex-1 flex-col gap-3 overflow-hidden',
        className,
      ) }
    >
      <div
        className={ cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          isCollapsed
            ? 'space-y-3'
            : 'space-y-2',
        ) }
      >
        {historyList.map((session, index) => (
          <HistoryItem
            key={ session.id }
            sessionId={ session.id }
            isSelected={ session.id === selectedHistoryId }
            onClick={ () => handleSelect(session.id) }
            index={ index }
            isCollapsed={ isCollapsed }
          />
        ))}
      </div>
    </div>
  )
})

HistoryList.displayName = 'HistoryList'

/**
 * 历史记录项
 */
type HistoryItemProps = {
  sessionId: string
  isSelected: boolean
  onClick: () => void
  index: number
  isCollapsed?: boolean
}

const HistoryItem = memo<HistoryItemProps>((props) => {
  const {
    sessionId,
    isSelected,
    onClick,
    index,
    isCollapsed = false,
  } = props

  const snap = useSnapshot(workflowStore, { sync: true })
  const session = snap.historyList.find(s => s.id === sessionId)

  if (!session) {
    return null
  }

  const stageColors: Record<WorkflowStage, string> = {
    [WorkflowStage.INFO_COLLECTION]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [WorkflowStage.BRIEF_SOLUTION_GENERATION]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    [WorkflowStage.SOLUTION_SELECTION]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    [WorkflowStage.SOLUTION_DISCUSSION]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    [WorkflowStage.DETAILED_SOLUTION_GENERATION]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    [WorkflowStage.COMPLETE]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  }

  const stageLabels: Record<WorkflowStage, string> = {
    [WorkflowStage.INFO_COLLECTION]: '收集信息',
    [WorkflowStage.BRIEF_SOLUTION_GENERATION]: '生成方案',
    [WorkflowStage.SOLUTION_SELECTION]: '选择方案',
    [WorkflowStage.SOLUTION_DISCUSSION]: '讨论中',
    [WorkflowStage.DETAILED_SOLUTION_GENERATION]: '详细方案',
    [WorkflowStage.COMPLETE]: '已完成',
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1)
      return '刚刚'
    if (diffMins < 60)
      return `${diffMins}分钟前`
    if (diffHours < 24)
      return `${diffHours}小时前`
    if (diffDays < 7)
      return `${diffDays}天前`

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /** 收起状态下的简略视图 */
  if (isCollapsed) {
    return (
      <motion.button
        initial={ { opacity: 0, scale: 0.8 } }
        animate={ { opacity: 1, scale: 1 } }
        transition={ { duration: 0.3, delay: index * 0.05 } }
        onClick={ onClick }
        className={ cn(
          'group relative w-full rounded-xl border p-3 text-left transition-all duration-200 hover:shadow-md',
          isSelected
            ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/60 shadow-md ring-2 ring-blue-200/50 dark:border-blue-700 dark:from-blue-950/50 dark:to-blue-900/30 dark:ring-blue-800/50'
            : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-slate-50/90 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800/70',
        ) }
        title={ session.title }
      >
        <div className="flex flex-col items-center gap-2.5">
          <p
            className={ cn(
              'w-full break-words px-0.5 text-center text-sm font-medium leading-snug',
              isSelected
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-slate-700 dark:text-slate-200',
            ) }
          >
            {session.title}
          </p>
        </div>
      </motion.button>
    )
  }

  /** 展开状态下的完整视图 */
  return (
    <motion.div
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.3, delay: index * 0.1 } }
      className={ cn(
        'group relative w-full cursor-pointer rounded-xl border p-3 transition-all duration-200 hover:shadow-sm',
        isSelected
          ? 'border-blue-200 bg-blue-50/80 shadow-sm dark:border-blue-800 dark:bg-blue-950/30'
          : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800',
      ) }
      onClick={ onClick }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4
            className={ cn(
              'truncate text-sm font-medium',
              isSelected
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-slate-900 dark:text-slate-100',
            ) }
          >
            {session.title}
          </h4>
          <p
            className={ cn(
              'mt-1 line-clamp-2 text-xs',
              isSelected
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-slate-500 dark:text-slate-400',
            ) }
          >
            {session.requirement || '暂无需求描述'}
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span
            className={ cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              stageColors[session.stage],
            ) }
          >
            {stageLabels[session.stage]}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatTime(session.updatedAt)}
          </span>
        </div>
      </div>

      {/* 方案数量指示器 */}
      {session.briefSolutions && session.briefSolutions.length > 0 && (
        <div className="absolute -right-1 -top-1">
          <div
            className={ cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium',
              isSelected
                ? 'bg-blue-500 text-white dark:bg-blue-400'
                : 'bg-slate-400 text-white dark:bg-slate-500',
            ) }
          >
            {session.briefSolutions.length}
          </div>
        </div>
      )}
    </motion.div>
  )
})

HistoryItem.displayName = 'HistoryItem'
