'use client'

import type { InputHistory } from '../types'
import { useShortCutKey } from '@/hooks/event'
import { cn } from '@/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Clock, History, RotateCcw, Search, Trash2, X, Zap } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const HistoryPanel = memo<HistoryPanelProps>((
  {
    visible,
    searchQuery: externalSearchQuery,
    highlightedIndex,
    histories,
    className,
    onHistorySelect,
    onHistoryDelete,
    onClearAll,
    onClose,
    onHighlightChange,
  },
) => {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  /** 内部搜索状态 */
  const [internalSearchQuery, setInternalSearchQuery] = useState('')

  /** 使用内部搜索查询，如果没有则使用外部传入的 */
  const searchQuery = internalSearchQuery || externalSearchQuery || ''

  /** 自动聚焦搜索框 */
  useEffect(() => {
    if (visible && searchInputRef.current) {
      /** 延迟聚焦，确保动画完成后再聚焦 */
      const timer = setTimeout(() => {
        panelRef.current?.focus()
        searchInputRef.current?.focus()
      })
      return () => clearTimeout(timer)
    }
  }, [visible])

  /** 重置搜索查询当面板关闭时 */
  useEffect(() => {
    if (!visible) {
      setInternalSearchQuery('')
    }
  }, [visible])

  /** 滚动到高亮项 */
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [highlightedIndex])

  /** 过滤历史记录 */
  const filteredHistories = useCallback(() => {
    if (!searchQuery.trim()) {
      return histories
    }

    const query = searchQuery.toLowerCase()
    return histories.filter(history =>
      history.content.toLowerCase().includes(query),
    )
  }, [histories, searchQuery])

  /** 处理历史记录选择 */
  const handleHistorySelect = useCallback((history: InputHistory) => {
    onHistorySelect(history)
    onClose()
  }, [onHistorySelect, onClose])

  /** 处理删除历史记录 */
  const handleHistoryDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onHistoryDelete(id)
  }, [onHistoryDelete])

  /** 处理Enter键选择当前高亮的历史记录 */
  const handleEnterSelect = useCallback(() => {
    if (visible && highlightedIndex >= 0) {
      const filtered = filteredHistories()
      if (filtered[highlightedIndex]) {
        handleHistorySelect(filtered[highlightedIndex])
      }
    }
  }, [visible, highlightedIndex, filteredHistories, handleHistorySelect])

  /** 添加快捷键支持 */
  // #region
  /** ESC键关闭面板 */
  useShortCutKey({
    key: 'Escape',
    fn: () => {
      if (visible) {
        onClose()
      }
    },
  })

  /** Enter键选择当前高亮的历史记录 */
  useShortCutKey({
    key: 'Enter',
    fn: handleEnterSelect,
  })

  /** 上下箭头键导航 */
  useShortCutKey({
    key: 'ArrowUp',
    fn: (e) => {
      if (visible) {
        e.preventDefault()
        const newIndex = Math.max(0, highlightedIndex - 1)
        onHighlightChange?.(newIndex)
      }
    },
  })

  useShortCutKey({
    key: 'ArrowDown',
    fn: (e) => {
      if (visible) {
        e.preventDefault()
        const filtered = filteredHistories()
        const newIndex = Math.min(filtered.length - 1, highlightedIndex + 1)
        onHighlightChange?.(newIndex)
      }
    },
  })
  // #endregion

  /** 格式化时间 */
  const formatTime = useCallback((timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000)
      return t('chat.chatInput.historyPanel.labels.justNow')
    if (diff < 3600000)
      return t('chat.chatInput.historyPanel.labels.minutesAgo', { count: Math.floor(diff / 60000) })
    if (diff < 86400000)
      return t('chat.chatInput.historyPanel.labels.hoursAgo', { count: Math.floor(diff / 3600000) })
    if (diff < 604800000)
      return t('chat.chatInput.historyPanel.labels.daysAgo', { count: Math.floor(diff / 86400000) })

    return new Date(timestamp).toLocaleDateString()
  }, [t])

  /** 截取文本 */
  const truncateText = useCallback((text: string, maxLength = 100) => {
    if (text.length <= maxLength)
      return text
    return `${text.substring(0, maxLength)}...`
  }, [])

  /** 动画配置 */
  const containerVariants = {
    hidden: {
      opacity: 0,
      x: '-50%', // 保持水平居中
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      x: '-50%', // 保持水平居中
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      x: '-50%', // 保持水平居中
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
  }

  if (!visible)
    return null

  return (
    <AnimatePresence>
      <motion.div
        ref={ panelRef }
        data-panel="history"
        tabIndex={ 0 }
        className={ cn(
          'fixed top-20 left-1/2 w-[600px] max-w-[90vw] z-50',
          'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          'rounded-xl shadow-2xl overflow-hidden',
          'max-h-[500px] flex flex-col',
          'focus:outline-none focus:ring-1 focus:ring-green-500/20',
          className,
        ) }
        variants={ containerVariants }
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* 头部 */}
        <div className="dark:to-gray-750 border-b border-gray-100 from-green-50 to-blue-50 bg-gradient-to-r p-4 dark:border-gray-700 dark:from-gray-800">
          {/* 标题行 */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <History size={ 18 } className="text-green-500" />
                <h3 className="text-sm text-gray-800 font-semibold dark:text-gray-200">
                  {t('chat.chatInput.historyPanel.title')}
                </h3>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 font-medium dark:bg-green-900 dark:text-green-300">
                {t('chat.chatInput.historyPanel.recordCount', { count: histories.length })}
              </span>
            </div>

            {histories.length > 0 && (
              <button
                onClick={ onClearAll }
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-red-600 font-medium transition-all duration-200 hover:bg-red-50 dark:text-red-400 hover:shadow-sm dark:hover:bg-red-900/20"
              >
                <RotateCcw size={ 12 } />
                {t('chat.chatInput.historyPanel.clearAll')}
              </button>
            )}
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search size={ 16 } className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2" />
            <input
              ref={ searchInputRef }
              type="text"
              value={ internalSearchQuery }
              onChange={ e => setInternalSearchQuery(e.target.value) }
              placeholder={ t('chat.chatInput.historyPanel.searchPlaceholder') }
              className="w-full border border-gray-200 rounded-lg bg-white py-2 pl-10 pr-10 text-sm text-gray-900 dark:border-gray-600 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500/20 dark:focus:border-green-400 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {internalSearchQuery && (
              <button
                onClick={ () => setInternalSearchQuery('') }
                className="absolute right-3 top-1/2 text-gray-400 -translate-y-1/2 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={ 16 } />
              </button>
            )}
          </div>
        </div>

        {/* 历史记录列表 */}
        <div className="flex-1 overflow-y-auto">
          {(() => {
            const filtered = filteredHistories()
            return filtered.length > 0
              ? (
                  <div className="p-2">
                    {filtered.map((history, index) => (
                      <motion.div
                        key={ history.id }
                        ref={ el => itemRefs.current[index] = el }
                        className={ cn(
                          'group flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all duration-200',
                          'hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-600',
                          'hover:shadow-md hover:shadow-green-100 dark:hover:shadow-gray-900',
                          'border border-transparent hover:border-green-200 dark:hover:border-gray-600',
                          highlightedIndex === index && 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 ring-1 ring-green-300 dark:ring-green-700 shadow-lg',
                        ) }
                        variants={ itemVariants }
                        onClick={ () => handleHistorySelect(history) }
                        whileHover={ { scale: 1.02, y: -2 } }
                        whileTap={ { scale: 0.98 } }
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-start gap-2">
                            <BookOpen size={ 16 } className="mt-0.5 flex-shrink-0 text-green-500 transition-colors group-hover:text-green-600" />
                            <p className="text-sm text-gray-900 leading-relaxed transition-colors dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                              {truncateText(history.content)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 dark:bg-gray-800">
                              <Clock size={ 12 } className="text-gray-400" />
                              <span className="text-gray-500 dark:text-gray-400">{formatTime(history.timestamp)}</span>
                            </div>

                            {history.templateId && (
                              <span className="rounded-full from-blue-100 to-purple-100 bg-gradient-to-r px-2 py-1 text-blue-700 font-medium dark:from-blue-900 dark:to-purple-900 dark:text-blue-300">
                                {t('chat.chatInput.historyPanel.labels.template')}
                              </span>
                            )}

                            <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 dark:bg-green-900/20">
                              <Zap size={ 12 } className="text-green-500" />
                              <span className="text-green-600 font-medium dark:text-green-400">{t('chat.chatInput.historyPanel.labels.quickFill')}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={ e => handleHistoryDelete(e, history.id) }
                          className="rounded-lg p-2 text-gray-400 opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          title="删除历史记录"
                        >
                          <Trash2 size={ 16 } />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )
              : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                      <History size={ 32 } className="opacity-60" />
                    </div>
                    <p className="mb-1 text-sm font-medium">
                      {searchQuery
                        ? t('chat.chatInput.historyPanel.emptyState.noResults')
                        : t('chat.chatInput.historyPanel.emptyState.noHistory')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {searchQuery
                        ? t('chat.chatInput.historyPanel.emptyState.noResultsDesc')
                        : t('chat.chatInput.historyPanel.emptyState.noHistoryDesc')}
                    </p>
                  </div>
                )
          })()}
        </div>

        {/* 底部提示 */}
        <div className="dark:to-gray-750 border-t border-gray-100 from-gray-50 to-green-50 bg-gradient-to-r px-4 py-3 dark:border-gray-700 dark:from-gray-800">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-sm dark:bg-gray-700">↑↓</kbd>
                {t('chat.chatInput.historyPanel.shortcuts.select')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-sm dark:bg-gray-700">Enter</kbd>
                {t('chat.chatInput.historyPanel.shortcuts.confirm')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-sm dark:bg-gray-700">Esc</kbd>
                {t('chat.chatInput.historyPanel.shortcuts.cancel')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-sm dark:bg-gray-700">Ctrl+H</kbd>
                {t('chat.chatInput.historyPanel.shortcuts.history')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

HistoryPanel.displayName = 'HistoryPanel'

/**
 * 历史记录面板属性
 */
export interface HistoryPanelProps {
  /** 是否显示 */
  visible: boolean
  /** 搜索关键词 */
  searchQuery: string
  /** 高亮的索引 */
  highlightedIndex: number
  /** 历史记录列表 */
  histories: InputHistory[]
  /** 自定义样式类名 */
  className?: string

  /** 事件回调 */
  onHistorySelect: (history: InputHistory) => void
  onHistoryDelete: (id: string) => void
  onClearAll: () => void
  onClose: () => void
  onHighlightChange: (index: number) => void
}
