import type { CascaderOption } from '../types'
import { useCallback } from 'react'
import { getNextHighlightIndex } from '../../../utils/optionTree'

type OptionWithDisabled = { value: string, disabled?: boolean, children?: OptionWithDisabled[] }

export function useCascaderKeyboard(options: {
  disabled: boolean
  isOpen: boolean
  setOpen: (open: boolean) => void
  menuStack: CascaderOption[][]
  setMenuStack: React.Dispatch<React.SetStateAction<CascaderOption[][]>>
  highlightedIndices: number[]
  setHighlightedIndices: React.Dispatch<React.SetStateAction<number[]>>
  handleOptionClick: (value: string) => void
  onFocusSearchByKeyboard?: () => void
}) {
  const {
    disabled,
    isOpen,
    setOpen,
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionClick,
    onFocusSearchByKeyboard,
  } = options

  return useCallback((e: React.KeyboardEvent) => {
    if (disabled)
      return

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }

    e.preventDefault()

    if (e.key === 'Escape') {
      setOpen(false)
      return
    }

    const level = highlightedIndices.length - 1
    const currentOptions = menuStack[level] ?? []
    const idx = highlightedIndices[level] ?? 0
    const option = currentOptions[idx]

    if (e.key === 'ArrowDown') {
      const next = getNextHighlightIndex(currentOptions as OptionWithDisabled[], idx, 1)
      if (next !== idx) {
        setHighlightedIndices(prev => [...prev.slice(0, level), next])
      }
      return
    }
    if (e.key === 'ArrowUp') {
      const next = getNextHighlightIndex(currentOptions as OptionWithDisabled[], idx, -1)
      if (next !== idx) {
        setHighlightedIndices(prev => [...prev.slice(0, level), next])
      }
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
    if (e.key === 'ArrowLeft') {
      if (level > 0) {
        setMenuStack(prev => prev.slice(0, level))
        setHighlightedIndices(prev => prev.slice(0, level))
      }
      else if (onFocusSearchByKeyboard) {
        onFocusSearchByKeyboard()
      }
      return
    }
  }, [disabled, isOpen, setOpen, menuStack, setMenuStack, highlightedIndices, setHighlightedIndices, handleOptionClick, onFocusSearchByKeyboard])
}
