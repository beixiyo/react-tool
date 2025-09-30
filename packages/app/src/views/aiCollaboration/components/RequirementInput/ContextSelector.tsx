import type { ContextSummary } from '../../types'
import type { DropdownSection } from '@/components/Dropdown'
import { Dropdown } from '@/components/Dropdown'
import { ChevronDown } from 'lucide-react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'

interface ContextSelectorProps {
  contexts: ContextSummary[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  className?: string
}

export const ContextSelector = memo<ContextSelectorProps>((props) => {
  const { contexts, selectedIds, onChange, className } = props

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

  // 所有上下文作为单一列表（按更新时间倒序）
  const dropdownSections = useMemo<DropdownSection[]>(() => {
    const sortedContexts = [...contexts].sort((a, b) => b.updatedAt - a.updatedAt)

    return [{
      name: '历史上下文',
      items: sortedContexts.map(context => ({
        id: context.id,
        customContent: (
          <ContextItem
            context={ context }
            isSelected={ selectedIds.includes(context.id) }
          />
        ),
      })),
    }]
  }, [contexts, selectedIds])

  // 自定义头部（带下拉箭头）
  const sectionsWithHeader = useMemo<DropdownSection[]>(() => {
    return dropdownSections.map(section => ({
      ...section,
      header: (isExpanded: boolean) => (
        <div className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm transition-all duration-300 hover:opacity-50">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              { section.name }
            </span>
            <span className="text-xs text-gray-400">
              ({ Array.isArray(section.items) ? section.items.length : 0 })
            </span>
          </div>
          <ChevronDown
            className={ cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-gray-500',
              isExpanded && 'rotate-180',
            ) }
          />
        </div>
      ),
    }))
  }, [dropdownSections])

  return (
    <div className={ cn('flex flex-col gap-3', className) }>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            上下文选择
          </h4>
          { selectedCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              { selectedCount }
            </span>
          ) }
        </div>
      </div>

      <Dropdown
        items={ sectionsWithHeader }
        selectedId={ null }
        onClick={ handleToggle }
        accordion={ false }
        defaultExpanded={ ['历史上下文'] }
        className="max-h-96 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50"
        itemClassName="border-b border-slate-100 last:border-b-0 dark:border-slate-700/50"
        itemActiveClassName="ring-2 ring-blue-500/50 dark:ring-blue-400/50"
      />
    </div>
  )
})

interface ContextItemProps {
  context: ContextSummary
  isSelected: boolean
}

const ContextItem = memo<ContextItemProps>((props) => {
  const { context, isSelected } = props

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
    <div className="flex w-full items-start justify-between gap-3">
      {/* 左侧：复选框 */}
      <div className="flex-shrink-0 pt-0.5">
        <div className={ cn(
          'h-4 w-4 rounded border-2 transition-colors',
          isSelected
            ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
            : 'border-slate-300 dark:border-slate-600',
        ) }>
          { isSelected && (
            <svg className="h-full w-full text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) }
        </div>
      </div>

      {/* 中间：内容 */}
      <div className="min-w-0 flex-1">
        <h5 className={ cn(
          'mb-1 truncate text-sm font-medium',
          isSelected
            ? 'text-blue-900 dark:text-blue-100'
            : 'text-slate-900 dark:text-slate-100',
        ) }>
          { context.title }
        </h5>
        <p className={ cn(
          'line-clamp-2 text-xs',
          isSelected
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-slate-500 dark:text-slate-400',
        ) }>
          { context.summary }
        </p>

        {/* Token信息 */}
        { context.tokens && (
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span>
              原始:
              { context.tokens.original.toLocaleString() }
            </span>
            <span>
              压缩:
              { context.tokens.compressed.toLocaleString() }
            </span>
            <span className="text-green-600 dark:text-green-400">
              节省
              { ' ' }
              { Math.round((1 - context.tokens.compressed / context.tokens.original) * 100) }
              %
            </span>
          </div>
        ) }
      </div>

      {/* 右侧：时间 */}
      <div className="flex-shrink-0">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          { formatTime(context.updatedAt) }
        </span>
      </div>
    </div>
  )
})

ContextItem.displayName = 'ContextItem'
ContextSelector.displayName = 'ContextSelector'
