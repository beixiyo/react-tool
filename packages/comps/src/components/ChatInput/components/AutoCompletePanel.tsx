'use client'

import type { CursorPosition } from 'utils'
import type { AutoCompleteSuggestion } from '../types'
import { useFloatingPosition, useShortCutKey } from 'hooks'
import { useT } from 'i18n/react'
import { Hash, History, Lightbulb } from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
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
  const t = useT()
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

  /** 使用光标位置创建虚拟 reference */
  const virtualReference = cursorPosition.x && cursorPosition.y
    ? {
        top: cursorPosition.y,
        left: cursorPosition.x,
        right: cursorPosition.x,
        bottom: cursorPosition.y + cursorPosition.height,
        width: 0,
        height: cursorPosition.height,
        x: cursorPosition.x,
        y: cursorPosition.y,
        toJSON: () => '',
      }
    : null

  /** 使用 useFloatingPosition 计算浮层位置 */
  const { style } = useFloatingPosition(
    { current: null } as any,
    panelRef,
    {
      enabled: visible && !!virtualReference,
      placement: 'bottom-start',
      offset: 4,
      boundaryPadding: 8,
      flip: true,
      shift: true,
      autoUpdate: true,
      scrollCapture: true,
      virtualReferenceRect: virtualReference,
    },
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
        return <Lightbulb size={ 14 } className="text-info" />
      case 'history':
        return <History size={ 14 } className="text-success" />
      case 'keyword':
        return <Hash size={ 14 } className="text-warning" />
      default:
        return <Lightbulb size={ 14 } className="text-text2" />
    }
  }, [])

  /** 获取建议类型标签 */
  const getSuggestionTypeLabel = useCallback((type: string) => {
    switch (type) {
      case 'template':
        return t('chatInput.autoCompletePanel.labels.template')
      case 'history':
        return t('chatInput.autoCompletePanel.labels.history')
      case 'keyword':
        return t('chatInput.autoCompletePanel.labels.keyword')
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
        'overflow-hidden rounded-xl backdrop-blur-md',
        'border border-border',
        'bg-background2/95 dark:bg-background/95',
        className,
      ) }
      style={ style }
      variants={ containerVariants }
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      { loading
        ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-text2">
                <div className="h-4 w-4 animate-spin border-2 border-border border-t-info rounded-full" />
                { t('chatInput.autoCompletePanel.loading') }
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
                    'flex items-center gap-3 px-3 py-2 cursor-pointer transition-all',
                    'hover:bg-background2 dark:hover:bg-background',
                    selectedIndex === index && 'bg-infoBg/30 dark:bg-infoBg/20 shadow',
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
                      <span className="truncate text-sm text-text">
                        { suggestion.text }
                      </span>

                      {/* 类型标签 */ }
                      <span className={ cn(
                        'text-xs px-1.5 py-0.5 rounded-sm',
                        suggestion.type === 'template' && 'bg-infoBg/40 text-info',
                        suggestion.type === 'history' && 'bg-successBg/40 text-success',
                        suggestion.type === 'keyword' && 'bg-warningBg/40 text-warning',
                      ) }>
                        { getSuggestionTypeLabel(suggestion.type) }
                      </span>
                    </div>

                    {/* 额外信息 */ }
                    { suggestion.source && suggestion.type === 'template' && (
                      <div className="mt-1 truncate text-xs text-text2">
                        { (suggestion.source as any).description }
                      </div>
                    ) }
                  </div>

                  {/* 匹配度分数 */ }
                  { suggestion.score && suggestion.score > 0 && (
                    <div className="shrink-0 text-xs text-text2">
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
        <div className="border-t border-border bg-background px-3 py-1.5 dark:bg-background">
          <div className="flex items-center justify-between text-xs text-text2">
            <div>
              <span className="text-info font-medium">Tab</span>
              { ' ' }
              <span>{ t('chatInput.autoCompletePanel.select') }</span>
            </div>

            <span className="text-warning font-medium">
              { t('chatInput.autoCompletePanel.suggestionCount', { count: suggestions.length }) }
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
