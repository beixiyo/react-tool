import type { Option } from '../types'
import { useCallback, useEffect, useState } from 'react'

/** 级联模式下管理菜单栈与键盘高亮下标 */
export function useSelectMenuStack(options: Option[]) {
  const [menuStack, setMenuStack] = useState<Option[][]>([options])
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([0])

  useEffect(() => {
    setMenuStack([options])
  }, [options])

  const handleOptionHover = useCallback((option: Option, level: number, idx: number) => {
    const newStack = menuStack.slice(0, level + 1)
    if (option.children?.length) {
      newStack.push(option.children)
    }
    setMenuStack(newStack)
    setHighlightedIndices(prev => [...prev.slice(0, level), idx])
  }, [menuStack])

  const resetHighlight = useCallback(() => {
    setHighlightedIndices([0])
  }, [])

  return {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetHighlight,
  }
}
