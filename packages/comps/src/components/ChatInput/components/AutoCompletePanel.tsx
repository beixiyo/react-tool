'use client'

import type { CursorPosition } from 'utils'
import type { AutoCompleteSuggestion } from '../types'
import { motion } from 'framer-motion'
import { useShortCutKey } from 'hooks'
import { Hash, History, Lightbulb } from 'lucide-react'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn, trackCursorCoord } from 'utils'

export const AutoCompletePanel = memo<AutoCompletePanelProps>((
  {
    visible,
    suggestions,
    selectedIndex,
    loading = false,
    className,
    inputElement,
    followCursor = true,
    onSuggestionSelect,
    onClose,
    onSelectionChange,
  },
) => {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    x: 0,
    y: 0,
    height: 0,
  })

  useEffect(
    () => {
      return trackCursorCoord(
        visible && followCursor
          ? inputElement
          : null,
        setCursorPosition,
      )
    },
    [followCursor, inputElement, visible],
  )

  /** 滚动到选中项 */
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [selectedIndex])

  /** 处理建议选择 */
  const handleSuggestionSelect = useCallback((suggestion: AutoCompleteSuggestion) => {
    onSuggestionSelect(suggestion)
    onClose()
  }, [onSuggestionSelect, onClose])

  /** 处理Tab键选择当前高亮的建议 */
  const handleTabSelect = useCallback(() => {
    if (visible && selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSuggestionSelect(suggestions[selectedIndex])
    }
  }, [visible, selectedIndex, suggestions, handleSuggestionSelect])

  /** ESC键关闭面板 */
  useShortCutKey({
    key: 'Escape',
    fn: () => {
      if (visible) {
        onClose()
      }
    },
  })

  /** Tab键选择当前高亮的建议 */
  useShortCutKey({
    key: 'Tab',
    fn: (e) => {
      if (visible && suggestions.length > 0) {
        e.preventDefault()
        handleTabSelect()
      }
    },
  })

  /** 上下箭头键导航 */
  useShortCutKey({
    key: 'ArrowUp',
    fn: (e) => {
      if (visible && suggestions.length > 0) {
        e.preventDefault()
        const newIndex = selectedIndex <= 0
          ? suggestions.length - 1
          : selectedIndex - 1
        onSelectionChange?.(newIndex)
      }
    },
  })

  useShortCutKey({
    key: 'ArrowDown',
    fn: (e) => {
      if (visible && suggestions.length > 0) {
        e.preventDefault()
        const newIndex = selectedIndex >= suggestions.length - 1
          ? 0
          : selectedIndex + 1
        onSelectionChange?.(newIndex)
      }
    },
  })

  /** 获取建议图标 */
  const getSuggestionIcon = useCallback((suggestion: AutoCompleteSuggestion) => {
    switch (suggestion.type) {
      case 'template':
        return <Lightbulb size={ 14 } className="text-blue-500" />
      case 'history':
        return <History size={ 14 } className="text-green-500" />
      case 'keyword':
        return <Hash size={ 14 } className="text-purple-500" />
      default:
        return <Lightbulb size={ 14 } className="text-gray-400" />
    }
  }, [])

  /** 获取建议类型标签 */
  const getSuggestionTypeLabel = useCallback((type: string) => {
    switch (type) {
      case 'template':
        return t('chat.chatInput.autoCompletePanel.labels.template')
      case 'history':
        return t('chat.chatInput.autoCompletePanel.labels.history')
      case 'keyword':
        return t('chat.chatInput.autoCompletePanel.labels.keyword')
      default:
        return ''
    }
  }, [t])

  /** 动画配置 */
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: -5,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.15,
        ease: 'easeOut',
        staggerChildren: 0.02,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: 'easeIn',
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.15 },
    },
  }

  if (!visible || (suggestions.length === 0 && !loading))
    return null

  return (
    <motion.div
      ref={ panelRef }
      data-panel="autocomplete"
      className={ cn(
        'fixed z-50',
        'overflow-hidden rounded-lg',
        'border border-slate-200 dark:border-slate-900',
        'bg-white dark:bg-slate-900',
        className,
      ) }
      style={ {
        top: cursorPosition.y - 5,
        left: cursorPosition.x + 10,
      } }
      variants={ containerVariants }
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      { loading
        ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="h-4 w-4 animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full" />
                { t('chat.chatInput.autoCompletePanel.loading') }
              </div>
            </div>
          )
        : (
            <div className="max-h-64 overflow-hidden">
              { suggestions.map((suggestion, index) => (
                <motion.div
                  key={ `${suggestion.type}-${index}` }
                  ref={ (el) => { itemRefs.current[index] = el } }
                  className={ cn(
                    'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                    'hover:bg-blue-100 dark:hover:bg-blue-800/30',
                    selectedIndex === index && 'bg-blue-50 dark:bg-blue-900/20',
                  ) }
                  variants={ itemVariants }
                  onClick={ () => handleSuggestionSelect(suggestion) }
                  whileHover={ { x: 2 } }
                  whileTap={ { scale: 0.98 } }
                >
                  {/* 图标 */ }
                  <div className="shrink-0">
                    { getSuggestionIcon(suggestion) }
                  </div>

                  {/* 内容 */ }
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm text-gray-900 dark:text-gray-100">
                        { suggestion.text }
                      </span>

                      {/* 类型标签 */ }
                      <span className={ cn(
                        'text-xs px-1.5 py-0.5 rounded-sm',
                        suggestion.type === 'template' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                        suggestion.type === 'history' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                        suggestion.type === 'keyword' && 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                      ) }>
                        { getSuggestionTypeLabel(suggestion.type) }
                      </span>
                    </div>

                    {/* 额外信息 */ }
                    { suggestion.source && suggestion.type === 'template' && (
                      <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        { (suggestion.source as any).description }
                      </div>
                    ) }
                  </div>

                  {/* 匹配度分数 */ }
                  { suggestion.score && suggestion.score > 0 && (
                    <div className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      { Math.round(suggestion.score) }
                      %
                    </div>
                  ) }
                </motion.div>
              )) }
            </div>
          ) }

      {/* 底部提示 */ }
      { !loading && suggestions.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>
              <span className="text-blue-500">Tab</span>
              { ' ' }
              <span className="">{ t('chat.chatInput.autoCompletePanel.select') }</span>
            </div>

            <span className="text-purple-500">
              { t('chat.chatInput.autoCompletePanel.suggestionCount', { count: suggestions.length }) }
            </span>
          </div>
        </div>
      ) }
    </motion.div>
  )
})

AutoCompletePanel.displayName = 'AutoCompletePanel'

export interface AutoCompletePanelProps {
  /** 是否显示 */
  visible: boolean
  /** 建议列表 */
  suggestions: AutoCompleteSuggestion[]
  /** 选中的索引 */
  selectedIndex: number
  /** 是否加载中 */
  loading?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 关联的输入元素，用于获取光标位置 */
  inputElement?: HTMLInputElement | HTMLTextAreaElement | null
  /** 是否启用光标跟随定位 */
  followCursor?: boolean

  /** 事件回调 */
  onSuggestionSelect: (suggestion: AutoCompleteSuggestion) => void
  onClose: () => void
  onSelectionChange?: (index: number) => void
}
