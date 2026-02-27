'use client'

import type { CascaderOptionClassNames, CascaderOption as CascaderOptionType } from './types'
import { Search } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { CascaderOption } from './CascaderOption'
import { DATA_CASCADER_OPTION } from './constants'

export interface CascaderSearchProps extends CascaderOptionClassNames {
  searchQuery: string
  setSearchQuery: (query: string) => void
  dropdownHeight: number
  filteredOptions: { label: string, value: string, path: string[], raw: CascaderOptionType }[]
  internalValue?: string
  handleOptionClick: (value: string) => void
  isSingleLevel?: boolean
  onFocusMenuByKeyboard?: () => void
  focusSearchToken?: number
  /** 支持 Cascader 传入的 option 前缀类名 */
  optionClassName?: string
  optionContentClassName?: string
  optionLabelClassName?: string
  optionCheckIconClassName?: string
  optionChevronIconClassName?: string
}

const SEARCH_MIN_WIDTH = 200

function InnerCascaderSearch(props: CascaderSearchProps) {
  const {
    searchQuery,
    setSearchQuery,
    dropdownHeight,
    filteredOptions,
    internalValue,
    handleOptionClick,
    isSingleLevel,
    onFocusMenuByKeyboard,
    focusSearchToken,
    /** 基础类名 */
    className,
    contentClassName,
    labelClassName,
    checkIconClassName,
    chevronIconClassName,
    // option 前缀类名
    optionClassName,
    optionContentClassName,
    optionLabelClassName,
    optionCheckIconClassName,
    optionChevronIconClassName,
  } = props

  const optionStyles: CascaderOptionClassNames = {
    className: optionClassName || className,
    contentClassName: optionContentClassName || contentClassName,
    labelClassName: optionLabelClassName || labelClassName,
    checkIconClassName: optionCheckIconClassName || checkIconClassName,
    chevronIconClassName: optionChevronIconClassName || chevronIconClassName,
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  /** 自动聚焦输入框 */
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  /** 从菜单通过键盘返回时重新聚焦输入框 */
  useEffect(() => {
    if (!focusSearchToken)
      return
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
    return () => clearTimeout(timer)
  }, [focusSearchToken])

  /** 搜索词改变时重置高亮 */
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchQuery])

  /** 同步当前选中值到高亮索引 */
  useEffect(() => {
    if (highlightedIndex === -1 && internalValue && filteredOptions.length > 0) {
      const activeIndex = filteredOptions.findIndex(opt => opt.value === internalValue)
      if (activeIndex !== -1) {
        setHighlightedIndex(activeIndex)
      }
    }
  }, [internalValue, filteredOptions, highlightedIndex])

  /** 自动滚动到高亮项 */
  useEffect(() => {
    if (highlightedIndex === -1 || !scrollContainerRef.current)
      return

    const timer = setTimeout(() => {
      const items = scrollContainerRef.current?.querySelectorAll(`[${DATA_CASCADER_OPTION}="true"]`)
      const activeItem = items?.[highlightedIndex] as HTMLElement
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [highlightedIndex])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (filteredOptions.length === 0)
      return

    let currentIndex = highlightedIndex
    /** 如果当前没有显式高亮，但有选中值，先确定其实际索引 */
    if (currentIndex === -1 && internalValue) {
      currentIndex = filteredOptions.findIndex(opt => opt.value === internalValue)
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((currentIndex + 1) % filteredOptions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((currentIndex - 1 + filteredOptions.length) % filteredOptions.length)
        break
      case 'ArrowRight':
        if (!searchQuery && !isSingleLevel && onFocusMenuByKeyboard) {
          e.preventDefault()
          onFocusMenuByKeyboard()
        }
        break
      case 'Enter':
        e.preventDefault()
        const target = currentIndex >= 0
          ? filteredOptions[currentIndex]
          : filteredOptions.find(opt => opt.value === internalValue)
        if (target) {
          handleOptionClick(target.value)
        }
        break
    }
  }

  return (
    <div
      className={ cn(
        'flex flex-col',
        !isSingleLevel && 'border-r border-border',
        searchQuery || isSingleLevel
          ? 'w-full'
          : `w-[${SEARCH_MIN_WIDTH}px]`,
      ) }
      style={ { minWidth: SEARCH_MIN_WIDTH } }
    >
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 transform text-text2 -translate-y-1/2" />
          <input
            ref={ inputRef }
            type="text"
            className="w-full border border-border rounded-md py-1 pl-9 pr-3 bg-background text-text placeholder:text-text2 focus:border-info focus:outline-hidden focus:ring-1 focus:ring-info/20 transition-all duration-200 text-sm"
            placeholder="Search..."
            value={ searchQuery }
            onChange={ e => setSearchQuery(e.target.value) }
            onClick={ e => e.stopPropagation() }
            onKeyDown={ onKeyDown }
          />
        </div>
      </div>
      <div
        ref={ scrollContainerRef }
        className="overflow-auto py-1"
        style={ { maxHeight: dropdownHeight } }
      >
        { filteredOptions.length > 0
          ? (
              filteredOptions.map((opt, index) => {
                const isHighlighted = index === highlightedIndex || (highlightedIndex === -1 && internalValue === opt.value)
                const isSelected = internalValue === opt.value

                return (
                  <CascaderOption
                    key={ opt.value }
                    option={ {
                      ...opt.raw,
                      label: opt.label, // 搜索模式下显示完整路径
                    } }
                    selected={ isSelected }
                    highlighted={ isHighlighted }
                    onClick={ handleOptionClick }
                    onMouseEnter={ () => setHighlightedIndex(index) }
                    { ...optionStyles }
                  />
                )
              })
            )
          : searchQuery && (
            <div className="px-3 py-4 text-center text-xs text-text2">
              No results found
            </div>
          ) }
      </div>
    </div>
  )
}

InnerCascaderSearch.displayName = 'CascaderSearch'

export const CascaderSearch = memo(InnerCascaderSearch)
