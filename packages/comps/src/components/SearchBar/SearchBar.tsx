'use client'

import { useLatestCallback, useLatestRef, useTheme } from 'hooks'
import { Search, Send } from 'lucide-react'
import { AnimatePresence, motion, stagger } from 'motion/react'
import React, { memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { isComposingEvent } from 'utils/keyboard'
import { MOTION_TRANSITIONS } from '../Animate'
import { createListItemEnter, LIST_ENTER_DISTANCE, LIST_ENTER_INTERVAL } from '../Animate/utils/listEnter'
import { DEFAULT_SEARCH_BAR_SHORTCUT } from './constants'
import type { Action, SearchBarProps } from './types'
import { formatShortcut, matchesShortcut, normalizeShortcuts } from './utils'

/** 候选列表容器动画 variants（静态，提到模块级避免每渲染重建） */
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: {
        duration: 0.4,
      },
      delayChildren: stagger(LIST_ENTER_INTERVAL),
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: MOTION_TRANSITIONS.exit,
    },
  },
}

/** 候选项动画 variants（静态，提到模块级避免每渲染重建） */
const { hidden, visible, exit } = createListItemEnter({ y: LIST_ENTER_DISTANCE, exit: { y: -10 } })
const ITEM_VARIANTS = {
  hidden,
  show: { ...visible, transition: MOTION_TRANSITIONS.quick },
  exit: { ...exit, transition: MOTION_TRANSITIONS.exit },
}

export const SearchBar = memo<SearchBarProps>(({
  actions = [],
  value = '',
  selectedAction,
  onFocus,
  onBlur,
  onSelect,
  onChange,
  onSubmit,
  emptyText,
  footer,
  showFooter = true,
  shortcut = DEFAULT_SEARCH_BAR_SHORTCUT,
  shortcutTarget,
  ...rest
}) => {
  const [theme] = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  /** 无障碍语义关联用的稳定 id */
  const reactId = useId()
  const listboxId = `${reactId}-listbox`

  /** 候选结果为派生值：聚焦时按当前输入过滤 actions，未聚焦则为 null */
  const result = useMemo<SearchResult | null>(() => {
    if (!isFocused) return null

    if (!value) return { actions }

    const normalizedQuery = value.toLowerCase().trim()
    const filteredActions = actions.filter((action) => {
      const searchableText = action.label.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })

    return { actions: filteredActions }
  }, [value, isFocused, actions])

  /** 处理键盘事件 */
  const handleKeyDown = useLatestCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!result) return

    /** ESC键关闭候选 */
    if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
      return
    }

    /** 处理上下键导航 */
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()

      if (result.actions.length === 0) return

      const direction = e.key === 'ArrowDown'
        ? 1
        : -1
      const nextIndex = (highlightedIndex + direction + result.actions.length) % result.actions.length
      setHighlightedIndex(nextIndex)

      /** 滚动到可见区域 */
      const items = resultsRef.current?.querySelectorAll('.action-item')
      if (items && items[nextIndex]) {
        items[nextIndex].scrollIntoView({ block: 'nearest' })
      }
    }

    /** 回车键选择当前高亮项 */
    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && result.actions[highlightedIndex]) {
        onSelect?.(result.actions[highlightedIndex])
        setIsFocused(false)
      }
      else if (value && onSubmit) {
        onSubmit()
      }
    }
  })

  /**
   * 聚焦搜索框的快捷键（默认 Mod+K），焦点在输入控件里也响应
   *
   * 多实例共用同一目标时只有先注册的实例响应：命中后 preventDefault，
   * 后续实例看到 `defaultPrevented` 即跳过，避免焦点在多个搜索框之间被抢
   */
  const shortcutList = normalizeShortcuts(shortcut)
  const shortcutListRef = useLatestRef(shortcutList)
  const hasShortcut = shortcutList.length > 0

  useEffect(() => {
    const target = shortcutTarget === undefined
      ? (typeof window === 'undefined'
        ? null
        : window)
      : shortcutTarget
    if (!hasShortcut || !target) return

    const handleKeyDown = (event: Event) => {
      const e = event as KeyboardEvent
      if (e.defaultPrevented || isComposingEvent(e)) return
      if (!shortcutListRef.current.some((item) => matchesShortcut(e, item))) return

      e.preventDefault()
      inputRef.current?.focus()
    }

    target.addEventListener('keydown', handleKeyDown)
    return () => target.removeEventListener('keydown', handleKeyDown)
  }, [hasShortcut, shortcutTarget, shortcutListRef])

  /** Reset selectedAction when focusing the input */
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onSelect?.(null)
    setIsFocused(true)
    /** 聚焦时无输入展示全部候选，沿用原行为不高亮任何项 */
    setHighlightedIndex(-1)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    /** 使用setTimeout防止在点击候选项时过早关闭候选列表 */
    setTimeout(() => {
      setIsFocused(false)
      setHighlightedIndex(-1)
    }, 150)
    onBlur?.(e)
  }

  /** 输入变化时同步候选高亮：有匹配项默认高亮首项，否则不高亮 */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    if (!nextValue) {
      setHighlightedIndex(-1)
    }
    else {
      const normalizedQuery = nextValue.toLowerCase().trim()
      const hasMatch = actions.some((action) => action.label.toLowerCase().includes(normalizedQuery))
      setHighlightedIndex(
        hasMatch
          ? 0
          : -1,
      )
    }
    onChange?.(nextValue)
  }

  return (
    <div className="relative w-full">
      { /* Input */ }
      <div className="relative">
        <input
          ref={ inputRef }
          type="text"
          role="combobox"
          aria-expanded={ isFocused && !!result }
          aria-controls={ listboxId }
          aria-autocomplete="list"
          aria-activedescendant={ highlightedIndex >= 0 && result?.actions[highlightedIndex]
            ? `${listboxId}-option-${result.actions[highlightedIndex].id}`
            : undefined }
          className={ cn(
            'h-9 w-full rounded-lg py-1.5 pl-3 pr-9 text-sm',
            'border border-solid border-border bg-background text-text placeholder:text-text3',
            'focus:border-border3 focus:outline-hidden focus:ring-2 focus:ring-border',
            'transition-colors duration-200',
          ) }
          onFocus={ handleFocus }
          onBlur={ handleBlur }
          onKeyDown={ handleKeyDown }
          value={ value }
          onChange={ handleInputChange }
          { ...rest }
        />
        <div
          className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 cursor-pointer"
          onClick={ () =>
            value.length > 0
              ? onSubmit?.()
              : inputRef.current?.focus() }
        >
          <AnimatePresence mode="popLayout">
            { value.length > 0
              ? (
                <motion.div
                  key="send"
                  initial={ { y: -20, opacity: 0 } }
                  animate={ { y: 0, opacity: 1 } }
                  exit={ { y: 20, opacity: 0 } }
                  transition={ { duration: 0.2 } }
                  onClick={ onSubmit }
                >
                  <Send className="text-text3 hover:text-text2 h-4 w-4 transition-colors duration-200" />
                </motion.div>
              )
              : (
                <motion.div
                  key="search"
                  initial={ { y: -20, opacity: 0 } }
                  animate={ { y: 0, opacity: 1 } }
                  exit={ { y: 20, opacity: 0 } }
                  transition={ { duration: 0.2 } }
                >
                  <Search className="text-text3 hover:text-text2 h-4 w-4 transition-colors duration-200" />
                </motion.div>
              ) }
          </AnimatePresence>
        </div>
      </div>

      { /* Action */ }
      <AnimatePresence>
        { isFocused && result && !selectedAction && (
          <motion.div
            ref={ resultsRef }
            id={ listboxId }
            role="listbox"
            className={ cn(
              'absolute top-10 left-0 z-dropdown w-full mx-auto mt-1 flex max-h-80 flex-col overflow-hidden',
              'rounded-[20px] bg-background p-2 shadow-card text-text',
              theme !== 'light' && 'border border-border',
            ) }
            variants={ CONTAINER_VARIANTS }
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="scrollbar-thin scrollbar-thumb-border2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
              { result.actions.length > 0
                ? (
                  result.actions.map((action, index) => (
                    <motion.div
                      key={ action.id }
                      id={ `${listboxId}-option-${action.id}` }
                      role="option"
                      aria-selected={ highlightedIndex === index }
                      className={ cn(
                        'action-item flex min-h-9 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-[10px] px-2',
                        'transition-colors duration-150',
                        highlightedIndex === index
                          ? 'bg-background2'
                          : 'hover:bg-background3',
                      ) }
                      variants={ ITEM_VARIANTS }
                      layout
                      onClick={ () => {
                        onSelect?.(action)
                      } }
                      onMouseEnter={ () => setHighlightedIndex(index) }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-text2">{ action.icon }</span>
                          <span className="text-text text-sm font-medium">{ action.label }</span>
                          <span className="text-text3 text-xs">{ action.description }</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        { action.short && <span className="bg-background3 text-text2 rounded-sm px-1.5 py-0.5 text-xs">{ action.short }</span> }
                        <span className="text-text3 text-right text-xs">{ action.end }</span>
                      </div>
                    </motion.div>
                  ))
                )
                : (
                  <div className="text-text2 px-2 py-4 text-center text-sm">
                    { emptyText ?? '没有找到匹配的结果' }
                  </div>
                ) }
            </div>

            { showFooter && (footer ?? (
              <div className="border-border mt-1 shrink-0 border-t px-2 pt-2 pb-1">
                <div className="text-text2 flex items-center justify-between text-xs">
                  { hasShortcut
                    ? <span>{ `按 ${formatShortcut(shortcutList[0]!)} 打开命令` }</span>
                    : <span /> }
                  <span>{ 'ESC 取消' }</span>
                </div>
              </div>
            )) }
          </motion.div>
        ) }
      </AnimatePresence>
    </div>
  )
})

SearchBar.displayName = 'SearchBar'

interface SearchResult {
  actions: Action[]
}
