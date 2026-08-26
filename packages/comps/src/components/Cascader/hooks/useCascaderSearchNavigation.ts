import { useLatestCallback } from 'hooks'
import { useEffect, useRef, useState } from 'react'
import { DATA_CASCADER_OPTION } from '../../../constants/dataAttributes'
import { getEnabledBoundaryIndex, getNextEnabledIndex } from '../../../utils/optionTree'
import type { FlatOption } from './useCascaderSearch'

const isOptionDisabled = (option: FlatOption) => !!option.raw.disabled

/** 管理 Cascader 搜索输入的焦点、高亮、键盘导航与滚动同步 */
export function useCascaderSearchNavigation(options: UseCascaderSearchNavigationOptions) {
  const {
    searchQuery,
    filteredOptions,
    internalValue,
    focusSearchToken,
    enableScrollAnimation,
    isSingleLevel,
    onFocusMenuByKeyboard,
    handleOptionClick,
  } = options

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  /** popup 挂载后自动聚焦搜索输入框 */
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  /** 从菜单通过键盘返回时重新聚焦输入框 */
  useEffect(() => {
    if (!focusSearchToken) return
    const timer = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(timer)
  }, [focusSearchToken])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchQuery])

  useEffect(() => {
    if (highlightedIndex !== -1 || !internalValue || filteredOptions.length === 0) return

    const activeIndex = filteredOptions.findIndex((option) => option.value === internalValue)
    if (activeIndex !== -1) setHighlightedIndex(activeIndex)
  }, [filteredOptions, highlightedIndex, internalValue])

  useEffect(() => {
    if (highlightedIndex === -1 || !scrollContainerRef.current) return

    const timer = setTimeout(() => {
      const items = scrollContainerRef.current?.querySelectorAll(`[${DATA_CASCADER_OPTION}="true"]`)
      const activeItem = items?.[highlightedIndex] as HTMLElement | undefined
      activeItem?.scrollIntoView({
        block: 'nearest',
        behavior: enableScrollAnimation
          ? 'smooth'
          : 'instant',
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [enableScrollAnimation, highlightedIndex])

  const getCurrentIndex = () => {
    const highlightedOption = filteredOptions[highlightedIndex]
    if (highlightedOption && !isOptionDisabled(highlightedOption)) return highlightedIndex

    if (internalValue) {
      const selectedIndex = filteredOptions.findIndex(
        (option) => option.value === internalValue && !isOptionDisabled(option),
      )
      if (selectedIndex !== -1) return selectedIndex
    }

    return -1
  }

  const handleKeyDown = useLatestCallback((event: React.KeyboardEvent) => {
    if (filteredOptions.length === 0) return

    const currentIndex = getCurrentIndex()

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex(getNextEnabledIndex(
        filteredOptions,
        currentIndex,
        event.key === 'ArrowDown'
          ? 1
          : -1,
        isOptionDisabled,
      ))
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setHighlightedIndex(getEnabledBoundaryIndex(
        filteredOptions,
        event.key === 'Home'
          ? 1
          : -1,
        isOptionDisabled,
      ))
      return
    }

    if (event.key === 'ArrowRight') {
      if (!searchQuery && !isSingleLevel && onFocusMenuByKeyboard) {
        event.preventDefault()
        onFocusMenuByKeyboard()
      }
      return
    }

    if (event.key !== 'Enter') return

    event.preventDefault()
    const target = currentIndex >= 0
      ? filteredOptions[currentIndex]
      : filteredOptions.find((option) => option.value === internalValue && !isOptionDisabled(option))
    if (target) handleOptionClick(target.value)
  })

  const handleOptionHover = useLatestCallback((index: number) => {
    setHighlightedIndex(index)
  })

  return {
    inputRef,
    scrollContainerRef,
    highlightedIndex,
    activeIndex: getCurrentIndex(),
    handleKeyDown,
    handleOptionHover,
  }
}

type UseCascaderSearchNavigationOptions = {
  searchQuery: string
  filteredOptions: FlatOption[]
  internalValue?: string
  focusSearchToken?: number
  enableScrollAnimation: boolean
  isSingleLevel?: boolean
  onFocusMenuByKeyboard?: () => void
  handleOptionClick: (value: string) => void
}
