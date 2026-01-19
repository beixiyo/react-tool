'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Search, Send } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'

export const SearchBar = memo<SearchBarProps>(({
  actions = [],
  value = '',
  selectedAction,
  onFocus,
  onBlur,
  onSelect,
  onChange,
  onSubmit,
  ...rest
}) => {
  const [result, setResult] = useState<SearchResult | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  /** 过滤操作并设置结果 */
  useEffect(() => {
    if (!isFocused) {
      setResult(null)
      setHighlightedIndex(-1)
      return
    }

    if (!value) {
      setResult({ actions })
      setHighlightedIndex(-1)
      return
    }

    const normalizedQuery = value.toLowerCase().trim()
    const filteredActions = actions.filter((action) => {
      const searchableText = action.label.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })

    setResult({ actions: filteredActions })
    setHighlightedIndex(filteredActions.length > 0
      ? 0
      : -1)
  }, [value, isFocused, actions])

  /** 处理键盘事件 */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!result)
      return

    // ESC键关闭候选
    if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
      return
    }

    /** 处理上下键导航 */
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()

      if (result.actions.length === 0)
        return

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
  }, [result, highlightedIndex, onSelect, onSubmit, value])

  /** 自动聚焦到搜索框的快捷键（⌘K） */
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleCmdK)
    return () => window.removeEventListener('keydown', handleCmdK)
  }, [])

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: 'auto',
      transition: {
        height: {
          duration: 0.4,
        },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
        },
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Reset selectedAction when focusing the input
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onSelect?.(null)
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    /** 使用setTimeout防止在点击候选项时过早关闭候选列表 */
    setTimeout(() => {
      setIsFocused(false)
    }, 150)
    onBlur?.(e)
  }

  return (
    <div className="relative w-full">
      {/* Input */}
      <div className="relative">
        <input
          ref={ inputRef }
          type="text"
          className={ cn(
            'h-9 w-full rounded-lg py-1.5 pl-3 pr-9 text-sm',
            'border border-solid border-gray-300 focus:border-gray-400 focus:outline-hidden focus:ring-2 focus:ring-gray-200',
            'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-700',
            'transition-colors duration-200',
          ) }
          onFocus={ handleFocus }
          onBlur={ handleBlur }
          onKeyDown={ handleKeyDown }
          value={ value }
          onChange={ e => onChange?.(e.target.value) }
          { ...rest }
        />
        <div
          className="absolute right-3 top-1/2 h-4 w-4 cursor-pointer -translate-y-1/2"
          onClick={ () => value.length > 0
            ? onSubmit?.()
            : inputRef.current?.focus() }
        >
          <AnimatePresence mode="popLayout">
            {value.length > 0
              ? (
                  <motion.div
                    key="send"
                    initial={ { y: -20, opacity: 0 } }
                    animate={ { y: 0, opacity: 1 } }
                    exit={ { y: 20, opacity: 0 } }
                    transition={ { duration: 0.2 } }
                    onClick={ onSubmit }
                  >
                    <Send className="h-4 w-4 text-gray-400 transition-colors duration-200 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
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
                    <Search className="h-4 w-4 text-gray-400 transition-colors duration-200 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                  </motion.div>
                )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action */}
      <AnimatePresence>
        {isFocused && result && !selectedAction && (
          <motion.div
            ref={ resultsRef }
            className={ cn(
              'absolute top-10 left-0 w-full mx-auto mt-1 overflow-hidden max-h-80 overflow-y-auto',
              'border rounded-md bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800',
              'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
            ) }
            variants={ container }
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {result.actions.length > 0
              ? (
                  result.actions.map((action, index) => (
                    <motion.div
                      key={ action.id }
                      className={ cn(
                        'action-item flex cursor-pointer items-center justify-between rounded-md px-3 py-2',
                        'transition-colors duration-150',
                        highlightedIndex === index
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700',
                      ) }
                      variants={ item }
                      layout
                      onClick={ () => {
                        onSelect?.(action)
                      } }
                      onMouseEnter={ () => setHighlightedIndex(index) }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">{action.icon}</span>
                          <span className="text-sm text-gray-900 font-medium dark:text-gray-100">{action.label}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{action.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {action.short && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700 dark:text-gray-300">{action.short}</span>
                        )}
                        <span className="text-right text-xs text-gray-400 dark:text-gray-500">{action.end}</span>
                      </div>
                    </motion.div>
                  ))
                )
              : (
                  <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    没有找到匹配的结果
                  </div>
                )}

            <div className="mt-2 border-t border-gray-100 px-3 py-2 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>按 ⌘K 打开命令</span>
                <span>ESC 取消</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export type SearchBarProps = {
  actions?: Action[]
  value?: string
  onSelect?: (action: Action | null) => void
  onSubmit?: () => void
  onChange?: ((val: string) => void) | (Dispatch<SetStateAction<string>>)
  selectedAction?: Action | null
}
& Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>

export interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  short?: string
  end?: string
}

interface SearchResult {
  actions: Action[]
}
