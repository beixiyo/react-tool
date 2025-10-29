'use client'

import type { PromptCategory, PromptCategoryConfig, PromptTemplate } from '../types'
import { motion } from 'framer-motion'
import { useShortCutKey } from 'hooks'
import { Clock, Hash, Search, Sparkles, Star, X, Zap } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from 'utils'

export const PromptPanel = memo<PromptPanelProps>((
  {
    visible,
    searchQuery: externalSearchQuery,
    selectedCategory,
    highlightedIndex,
    templates,
    categories,
    className,
    onTemplateSelect,
    onCategorySelect,
    onClose,
    onHighlightChange,
  },
) => {
  const { t } = useTranslation('chat')
  const panelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  /** 内部搜索状态 */
  const [internalSearchQuery, setInternalSearchQuery] = useState('')

  /** 使用内部搜索查询，如果没有则使用外部传入的 */
  const searchQuery = internalSearchQuery || externalSearchQuery || ''

  /** 自动聚焦面板和搜索框 */
  useEffect(() => {
    if (visible) {
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

  /** 处理模板选择 */
  const handleTemplateSelect = useCallback((template: PromptTemplate) => {
    onTemplateSelect(template)
    onClose()
  }, [onTemplateSelect, onClose])

  /** 过滤模板 */
  const filteredTemplates = useMemo(() => {
    let filtered = templates

    /** 按分类过滤 */
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    /** 按搜索查询过滤 */
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(query)
        || template.description?.toLowerCase().includes(query)
        || template.content.toLowerCase().includes(query)
        || template.tags?.some(tag => tag.toLowerCase().includes(query)),
      )
    }

    return filtered
  }, [templates, selectedCategory, searchQuery])

  /** 格式化使用次数 */
  const formatUsageCount = useCallback((count?: number) => {
    if (!count || count === 0)
      return ''
    if (count < 1000)
      return count.toString()
    return `${Math.floor(count / 1000)}k`
  }, [])

  /** 处理快捷键选择模板 */
  const handleShortcutSelect = useCallback((index: number) => {
    if (visible && filteredTemplates[index]) {
      handleTemplateSelect(filteredTemplates[index])
    }
  }, [visible, filteredTemplates, handleTemplateSelect])

  /** 处理Enter键选择当前高亮的模板 */
  const handleEnterSelect = useCallback(() => {
    if (visible && highlightedIndex >= 0 && filteredTemplates[highlightedIndex]) {
      handleTemplateSelect(filteredTemplates[highlightedIndex])
    }
  }, [visible, highlightedIndex, filteredTemplates, handleTemplateSelect])

  /** 添加快捷键支持 */
  // #region
  useShortCutKey({
    key: '1',
    ctrl: true,
    fn: () => handleShortcutSelect(0),
  })

  useShortCutKey({
    key: '2',
    ctrl: true,
    fn: () => handleShortcutSelect(1),
  })

  useShortCutKey({
    key: '3',
    ctrl: true,
    fn: () => handleShortcutSelect(2),
  })

  useShortCutKey({
    key: '4',
    ctrl: true,
    fn: () => handleShortcutSelect(3),
  })

  useShortCutKey({
    key: '5',
    ctrl: true,
    fn: () => handleShortcutSelect(4),
  })

  useShortCutKey({
    key: '6',
    ctrl: true,
    fn: () => handleShortcutSelect(5),
  })

  useShortCutKey({
    key: '7',
    ctrl: true,
    fn: () => handleShortcutSelect(6),
  })

  useShortCutKey({
    key: '8',
    ctrl: true,
    fn: () => handleShortcutSelect(7),
  })

  useShortCutKey({
    key: '9',
    ctrl: true,
    fn: () => handleShortcutSelect(8),
  })

  useShortCutKey({
    key: '0',
    ctrl: true,
    fn: () => handleShortcutSelect(9),
  })

  /** ESC键关闭面板 */
  useShortCutKey({
    key: 'Escape',
    fn: () => {
      if (visible) {
        onClose()
      }
    },
  })

  /** Enter键选择当前高亮的模板 */
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
        const newIndex = Math.min(filteredTemplates.length - 1, highlightedIndex + 1)
        onHighlightChange?.(newIndex)
      }
    },
  })
  // #endregion

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
    <motion.div
      ref={ panelRef }
      data-panel="prompt"
      tabIndex={ 0 }
      className={ cn(
        'fixed top-20 left-1/2 w-[600px] max-w-[90vw] z-50',
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'rounded-xl shadow-2xl overflow-hidden',
        'max-h-[500px] flex flex-col',
        'focus:outline-hidden focus:ring-1 focus:ring-blue-500/20',
        className,
      ) }
      variants={ containerVariants }
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* 分类标签 */ }
      <div className="dark:to-gray-750 border-b border-gray-100 from-blue-50 to-purple-50 bg-linear-to-r p-4 dark:border-gray-700 dark:from-gray-800">
        {/* 标题行 */ }
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={ 18 } className="text-blue-500" />
              <h3 className="text-sm text-gray-800 font-semibold dark:text-gray-200">
                { t('chatInput.promptPanel.title') }
              </h3>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              { t('chatInput.promptPanel.templateCount', { count: templates.length }) }
            </span>
          </div>
        </div>

        {/* 搜索框 */ }
        <div className="relative mb-3">
          <Search size={ 16 } className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2" />
          <input
            ref={ searchInputRef }
            type="text"
            value={ internalSearchQuery }
            onChange={ e => setInternalSearchQuery(e.target.value) }
            placeholder={ t('chatInput.promptPanel.searchPlaceholder') }
            className="w-full border border-gray-200 rounded-lg bg-white py-2 pl-10 pr-10 text-sm text-gray-900 dark:border-gray-600 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500/20 dark:focus:border-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
          />
          { internalSearchQuery && (
            <button
              onClick={ () => setInternalSearchQuery('') }
              className="absolute right-3 top-1/2 text-gray-400 -translate-y-1/2 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={ 16 } />
            </button>
          ) }
        </div>

        {/* 分类按钮行 */ }
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={ () => onCategorySelect(undefined as any) }
            className={ cn(
              'px-3 py-1.5 text-xs rounded-full transition-all duration-200 font-medium whitespace-nowrap',
              !selectedCategory
                ? 'bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white hover:shadow-xs dark:hover:bg-gray-700',
            ) }
          >
            { t('chatInput.promptPanel.allCategories') }
          </button>
          { categories.map(category => (
            <button
              key={ category.key }
              onClick={ () => onCategorySelect(category.key) }
              className={ cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all duration-200 font-medium whitespace-nowrap',
                selectedCategory === category.key
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white hover:shadow-xs dark:hover:bg-gray-700',
              ) }
            >
              { category.icon }
              { t(`chatInput.categories.${category.key}`) }
            </button>
          )) }
        </div>
      </div>

      {/* 模板列表 */ }
      <div className="flex-1 overflow-y-auto">
        { filteredTemplates.length > 0
          ? (
              <div className="p-2">
                { filteredTemplates.map((template, index) => (
                  <motion.div
                    key={ template.id }
                    ref={ (el) => { itemRefs.current[index] = el } }
                    className={ cn(
                      'group flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2',
                      'hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600',
                      'hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-gray-900',
                      'border border-transparent hover:border-blue-200 dark:hover:border-gray-600',
                      highlightedIndex === index && 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 ring-1 ring-blue-300 dark:ring-blue-700 shadow-lg',
                    ) }
                    variants={ itemVariants }
                    onClick={ () => handleTemplateSelect(template) }
                    whileTap={ { scale: 0.98 } }
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        { template.icon && (
                          <span className="shrink-0 text-lg transition-transform duration-200 group-hover:scale-110">
                            { template.icon }
                          </span>
                        ) }
                        <h4 className="truncate text-sm text-gray-900 font-semibold transition-colors dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          { template.title }
                        </h4>
                        { template.isCustom && (
                          <span className="rounded-full from-purple-100 to-pink-100 bg-linear-to-r px-2 py-1 text-xs text-purple-700 font-medium dark:from-purple-900 dark:to-pink-900 dark:text-purple-300">
                            { t('chatInput.promptPanel.labels.custom') }
                          </span>
                        ) }
                      </div>

                      { template.description && (
                        <p className="line-clamp-2 mb-3 text-xs text-gray-600 leading-relaxed dark:text-gray-400">
                          { template.description }
                        </p>
                      ) }

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        { template.usageCount && template.usageCount > 0 && (
                          <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 dark:bg-yellow-900/20">
                            <Star size={ 12 } className="text-yellow-500" />
                            <span className="font-medium">{ formatUsageCount(template.usageCount) }</span>
                          </div>
                        ) }

                        { template.createdAt && (
                          <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 dark:bg-gray-800">
                            <Clock size={ 12 } className="text-gray-400" />
                            <span>{ new Date(template.createdAt).toLocaleDateString() }</span>
                          </div>
                        ) }

                        { template.tags && template.tags.length > 0 && (
                          <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 dark:bg-blue-900/20">
                            <Hash size={ 12 } className="text-blue-500" />
                            <span className="font-medium">
                              { template.tags.slice(0, 2).join(', ') }
                              { template.tags.length > 2 && '...' }
                            </span>
                          </div>
                        ) }
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end gap-2">
                      { index <= 9 && (
                        <div className="border rounded-lg from-gray-100 to-gray-200 bg-linear-to-r px-2 py-1 text-xs text-gray-700 font-mono shadow-xs dark:from-gray-700 dark:to-gray-600 dark:text-gray-300">
                          Ctrl+
                          { index + 1 === 10
                            ? 0
                            : index + 1 }
                        </div>
                      ) }

                      <div className="flex items-center gap-2">
                        <Zap size={ 14 } className="text-green-500 transition-colors group-hover:text-green-600" />
                      </div>
                    </div>
                  </motion.div>
                )) }
              </div>
            )
          : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                  <Search size={ 32 } className="opacity-60" />
                </div>
                <p className="mb-1 text-sm font-medium">
                  { searchQuery
                    ? t('chatInput.promptPanel.emptyState.noResults')
                    : t('chatInput.promptPanel.emptyState.noTemplates') }
                </p>
                <p className="text-xs text-gray-400">
                  { searchQuery
                    ? t('chatInput.promptPanel.emptyState.noResultsDesc')
                    : t('chatInput.promptPanel.emptyState.noTemplatesDesc') }
                </p>
              </div>
            ) }
      </div>

      {/* 底部提示 */ }
      <div className="dark:to-gray-750 border-t border-gray-100 from-gray-50 to-blue-50 bg-linear-to-r px-4 py-3 dark:border-gray-700 dark:from-gray-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-xs dark:bg-gray-700">↑↓</kbd>
              { t('chatInput.promptPanel.shortcuts.select') }
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-xs dark:bg-gray-700">Enter</kbd>
              { t('chatInput.promptPanel.shortcuts.confirm') }
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
            <kbd className="rounded bg-white px-1.5 py-0.5 text-xs shadow-xs dark:bg-gray-700">Esc</kbd>
            { t('chatInput.promptPanel.shortcuts.cancel') }
          </div>
        </div>
      </div>
    </motion.div>
  )
})

PromptPanel.displayName = 'PromptPanel'

/**
 * 提示词面板属性
 */
export interface PromptPanelProps {
  /** 是否显示 */
  visible: boolean
  /** 搜索关键词 */
  searchQuery: string
  /** 选中的分类 */
  selectedCategory?: PromptCategory
  /** 高亮的索引 */
  highlightedIndex: number
  /** 提示词模板列表 */
  templates: PromptTemplate[]
  /** 分类配置 */
  categories: PromptCategoryConfig[]
  /** 自定义样式类名 */
  className?: string

  /** 事件回调 */
  onTemplateSelect: (template: PromptTemplate) => void
  onCategorySelect: (category: PromptCategory) => void
  onClose: () => void
  onHighlightChange: (index: number) => void
}
