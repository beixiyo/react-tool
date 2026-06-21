import type { CascaderOption } from '../types'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useCascaderMenuStack(options: CascaderOption[]) {
  const [menuStack, setMenuStack] = useState<CascaderOption[][]>([options])
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([-1])

  /** 用最新 options 的引用兜底，供回调内读取，避免依赖导致频繁重建 */
  const optionsRef = useRef(options)
  optionsRef.current = options

  /**
   * 基于 value 树结构签名判断 options 是否真的变化，
   * 避免父级内联传 options 时引用一变就重置已展开的菜单栈
   */
  const optionsSignature = getOptionsSignature(options)
  useEffect(() => {
    setMenuStack([optionsRef.current])
    /** 仅在 options 结构签名变化时重置，引用变化但结构不变时不重置 */
  }, [optionsSignature])

  const handleOptionHover = useCallback((option: CascaderOption, level: number, idx: number) => {
    setMenuStack((prev) => {
      const newStack = prev.slice(0, level + 1)
      if (option.children?.length) {
        newStack.push(option.children)
      }
      return newStack
    })
    setHighlightedIndices(prev => [...prev.slice(0, level), idx])
  }, [])

  const resetOnOpen = useCallback(() => {
    setMenuStack([optionsRef.current])
    setHighlightedIndices([-1])
  }, [])

  return {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetOnOpen,
  }
}

/**
 * 生成 options 的 value 树结构签名，仅反映层级与 value，
 * 用于判断结构是否真的变化（忽略引用变化）
 */
function getOptionsSignature(options: CascaderOption[]): string {
  const walk = (opts: CascaderOption[]): string =>
    opts
      .map(opt => opt.children?.length
        ? `${opt.value}(${walk(opt.children)})`
        : opt.value)
      .join(',')

  return walk(options)
}
