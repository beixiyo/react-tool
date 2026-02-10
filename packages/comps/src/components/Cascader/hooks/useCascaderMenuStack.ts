import type { CascaderOption } from '../types'
import { useCallback, useEffect, useState } from 'react'

export function useCascaderMenuStack(options: CascaderOption[]) {
  const [menuStack, setMenuStack] = useState<CascaderOption[][]>([options])
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([-1])

  useEffect(() => {
    setMenuStack([options])
  }, [options])

  const handleOptionHover = useCallback((option: CascaderOption, level: number, idx: number) => {
    const newStack = menuStack.slice(0, level + 1)
    if (option.children?.length) {
      newStack.push(option.children)
    }
    setMenuStack(newStack)
    setHighlightedIndices(prev => [...prev.slice(0, level), idx])
  }, [menuStack])

  const resetOnOpen = useCallback(() => {
    setMenuStack([options])
    setHighlightedIndices([-1])
  }, [options])

  return {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetOnOpen,
  }
}
