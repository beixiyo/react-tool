import type { CollaborationSession } from '../../types'
import { motion } from 'framer-motion'
import { CheckCircle2, CirclePlus } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '@/components/Tooltip'
import { CollaborationPhase } from '../../types'

interface HistoryListProps {
  sessions: CollaborationSession[]
  selectedId?: string
  onSelect?: (sessionId: string) => void
  className?: string
  isCollapsed?: boolean
  /** 已选择的上下文 ID 列表 */
  selectedContextIds?: string[]
  /** 上下文选择变更回调 */
  onContextChange?: (selectedIds: string[]) => void
}

function HistoryList(props: HistoryListProps) {
  const {
    sessions,
    selectedId,
    onSelect,
    className,
    isCollapsed = false,
    selectedContextIds = [],
    onContextChange,
  } = props

  if (!sessions.length) {
    return (
      <div className={ cn(
        'flex flex-1 flex-col gap-4 overflow-hidden',
        className,
      ) }>
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          暂无协作历史记录
        </div>
      </div>
    )
  }

  const handleContextToggle = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation() // 阻止事件冒泡，避免触发选中
    if (!onContextChange)
      return

    const newSelectedIds = selectedContextIds.includes(sessionId)
      ? selectedContextIds.filter(id => id !== sessionId)
      : [...selectedContextIds, sessionId]

    onContextChange(newSelectedIds)
  }

  return (
    <div className={ cn(
      'flex flex-1 flex-col gap-3 overflow-hidden',
      className,
    ) }>
      <div className={ cn(
        'flex-1 overflow-y-auto overflow-x-hidden',
        isCollapsed
          ? 'space-y-3'
          : 'space-y-2',
      ) }>
        { sessions.map((session, index) => (
          <HistoryItem
            key={ session.id }
            session={ session }
            isSelected={ session.id === selectedId }
            onClick={ () => onSelect?.(session.id) }
            index={ index }
            isCollapsed={ isCollapsed }
            isContextSelected={ selectedContextIds.includes(session.id) }
            onContextToggle={ e => handleContextToggle(session.id, e) }
          />
        )) }
      </div>
    </div>
  )
}

interface HistoryItemProps {
  session: CollaborationSession
  isSelected: boolean
  onClick: () => void
  index: number
  isCollapsed?: boolean
  isContextSelected?: boolean
  onContextToggle?: (e: React.MouseEvent) => void
}

const HistoryItem = memo((props: HistoryItemProps) => {
  const {
    session,
    isSelected,
    onClick,
    index,
    isCollapsed = false,
    isContextSelected = false,
    onContextToggle,
  } = props

  const phaseColors: Record<CollaborationPhase, string> = {
    [CollaborationPhase.Idle]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    [CollaborationPhase.Requirement]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [CollaborationPhase.Analysis]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    [CollaborationPhase.Planning]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    [CollaborationPhase.Discussion]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    [CollaborationPhase.Decision]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    [CollaborationPhase.Completed]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    [CollaborationPhase.Archived]: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
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
          {/* 标题 - 垂直显示 */ }
          <p className={ cn(
            'text-sm font-medium text-center truncate w-full break-words leading-snug px-0.5',
            isSelected
              ? 'text-blue-900 dark:text-blue-100'
              : 'text-slate-700 dark:text-slate-200',
          ) }>
            { session.title }
          </p>
        </div>

        {/* 上下文状态指示 */ }
        { isContextSelected && (
          <div className="absolute -top-1 -right-1">
            <CheckCircle2
              size={ 16 }
              className="text-green-500 fill-white dark:text-green-400"
            />
          </div>
        ) }
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
        'group relative w-full rounded-xl border p-3 transition-all duration-200 hover:shadow-sm',
        isSelected
          ? 'border-blue-200 bg-blue-50/80 shadow-sm dark:border-blue-800 dark:bg-blue-950/30'
          : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800',
      ) }
    >
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={ onClick }
      >
        <div className="flex-1 min-w-0">
          <h4 className={ cn(
            'text-sm font-medium truncate',
            isSelected
              ? 'text-blue-900 dark:text-blue-100'
              : 'text-slate-900 dark:text-slate-100',
          ) }>
            { session.title }
          </h4>
          <p className={ cn(
            'mt-1 text-xs line-clamp-2',
            isSelected
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-slate-500 dark:text-slate-400',
          ) }>
            { session.requirement || '暂无需求描述' }
          </p>
        </div>

        <div className="flex items-start gap-2 flex-shrink-0">
          {/* 上下文切换按钮 */ }
          <Tooltip
            content={ isContextSelected
              ? '移除上下文'
              : '添加为上下文' }
            placement="left"
          >
            <button
              onClick={ onContextToggle }
              className={ cn(
                'flex items-center justify-center size-5 rounded-lg transition-all duration-200',
                isContextSelected
                  ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-700/50 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300',
              ) }
              aria-label={ isContextSelected
                ? '移除上下文'
                : '添加为上下文' }
            >
              { isContextSelected
                ? <CheckCircle2 size={ 16 } className="flex-shrink-0" />
                : <CirclePlus size={ 16 } className="flex-shrink-0" /> }
            </button>
          </Tooltip>

          <div className="flex flex-col items-end gap-1">
            <span className={ cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              phaseColors[session.phase],
            ) }>
              { session.phase }
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              { formatTime(session.updatedAt) }
            </span>
          </div>
        </div>
      </div>

      { session.tags && session.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          { session.tags.slice(0, 2).map((tag, tagIndex) => (
            <span
              key={ tagIndex }
              className={ cn(
                'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs',
                isSelected
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
              ) }
            >
              { tag }
            </span>
          )) }
          { session.tags.length > 2 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              +
              { session.tags.length - 2 }
            </span>
          ) }
        </div>
      ) }

      {/* 方案数量指示器 */ }
      { session.planCandidates && session.planCandidates.length > 0 && (
        <div className="absolute -top-1 -right-1">
          <div className={ cn(
            'flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium',
            isSelected
              ? 'bg-blue-500 text-white dark:bg-blue-400'
              : 'bg-slate-400 text-white dark:bg-slate-500',
          ) }>
            { session.planCandidates.length }
          </div>
        </div>
      ) }
    </motion.div>
  )
})

HistoryItem.displayName = 'HistoryItem'

HistoryList.displayName = 'HistoryList'

export default memo(HistoryList)
