import type { Option } from '../types'
import { useCallback } from 'react'
import { getNextHighlightIndex } from '../../../utils/optionTree'

type OptionWithDisabled = { value: string, disabled?: boolean, children?: OptionWithDisabled[] }

export function useSelectKeyboard(options: {
  disabled: boolean
  loading: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isCascading: boolean
  menuStack: Option[][]
  setMenuStack: React.Dispatch<React.SetStateAction<Option[][]>>
  highlightedIndices: number[]
  setHighlightedIndices: React.Dispatch<React.SetStateAction<number[]>>
  highlightedIndex: number
  setHighlightedIndex: (n: number) => void
  filteredOptions: Option[]
  handleOptionClick: (value: string) => void
}) {
  const {
    disabled,
    loading,
    isOpen,
    setIsOpen,
    isCascading,
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    highlightedIndex,
    setHighlightedIndex,
    filteredOptions,
    handleOptionClick,
  } = options

  return useCallback((e: React.KeyboardEvent) => {
    if (disabled || loading)
      return

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    e.preventDefault()

    if (e.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (isCascading) {
      const level = highlightedIndices.length - 1
      const currentOptions = menuStack[level] ?? []
      const idx = highlightedIndices[level] ?? 0
      const option = currentOptions[idx]

      if (e.key === 'ArrowDown') {
        const next = getNextHighlightIndex(currentOptions as OptionWithDisabled[], idx, 1)
        if (next !== idx)
          setHighlightedIndices(prev => [...prev.slice(0, level), next])
        return
      }
      if (e.key === 'ArrowUp') {
        const next = getNextHighlightIndex(currentOptions as OptionWithDisabled[], idx, -1)
        if (next !== idx)
          setHighlightedIndices(prev => [...prev.slice(0, level), next])
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (option?.children?.length) {
          const newStack = menuStack.slice(0, level + 1).concat([option.children])
          setMenuStack(newStack)
          setHighlightedIndices(prev => [...prev, 0])
        }
        else if (option && !option.disabled) {
          handleOptionClick(option.value)
        }
        return
      }
      if (e.key === 'ArrowLeft' && level > 0) {
        setMenuStack(prev => prev.slice(0, level))
        setHighlightedIndices(prev => prev.slice(0, level))
        return
      }
      return
    }

    const list = filteredOptions
    if (e.key === 'ArrowDown') {
      const next = getNextHighlightIndex(list, highlightedIndex, 1)
      if (next >= 0)
        setHighlightedIndex(next)
      return
    }
    if (e.key === 'ArrowUp') {
      const next = getNextHighlightIndex(list, highlightedIndex, -1)
      if (next >= 0)
        setHighlightedIndex(next)
      return
    }
    if (e.key === 'Enter' && highlightedIndex >= 0 && list[highlightedIndex] && !list[highlightedIndex].disabled) {
      handleOptionClick(list[highlightedIndex].value)
    }
  }, [
    disabled,
    loading,
    isOpen,
    setIsOpen,
    isCascading,
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    highlightedIndex,
    setHighlightedIndex,
    filteredOptions,
    handleOptionClick,
  ])
}
