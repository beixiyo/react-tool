// oxlint-disable react-hooks/exhaustive-deps
import { useLatestCallback, useLatestRef } from 'hooks'
import { useEffect, useState } from 'react'
import type { CascaderOption } from '../types'

export function useCascaderMenuStack(options: CascaderOption[]) {
  const [menuStack, setMenuStack] = useState<CascaderOption[][]>([options])
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([-1])

  /** 用最新 options 的引用兜底，供 effect 与事件回调读取 */
  const optionsRef = useLatestRef(options)

  /**
   * 基于 value 树结构签名判断 options 是否真的变化，
   * 避免父级内联传 options 时引用一变就重置已展开的菜单栈
   */
  const optionsSignature = getOptionsSignature(options)
  useEffect(() => {
    setMenuStack([optionsRef.current])
    setHighlightedIndices([getFirstEnabledIndex(optionsRef.current)])
    /** 仅在 options 结构签名变化时重置，引用变化但结构不变时不重置 */
  }, [optionsSignature])

  const handleOptionHover = useLatestCallback((option: CascaderOption, level: number, idx: number) => {
    if (option.disabled) return

    setMenuStack((prev) => {
      const newStack = prev.slice(0, level + 1)
      if (option.children?.length) {
        newStack.push(option.children)
      }
      return newStack
    })
    setHighlightedIndices((prev) => [...prev.slice(0, level), idx])
  })

  const resetOnOpen = useLatestCallback(() => {
    const currentOptions = optionsRef.current
    setMenuStack([currentOptions])
    setHighlightedIndices([getFirstEnabledIndex(currentOptions)])
  })

  return {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    handleOptionHover,
    resetOnOpen,
  }
}

function getFirstEnabledIndex(options: CascaderOption[]): number {
  return options.findIndex((option) => !option.disabled)
}

/**
 * 生成 options 的 value 树结构签名，仅反映层级与 value，
 * 用于判断结构是否真的变化（忽略引用变化）
 */
function getOptionsSignature(options: CascaderOption[]): string {
  const walk = (opts: CascaderOption[]): string =>
    opts
      .map((opt) =>
        opt.children?.length
          ? `${opt.value}(${walk(opt.children)})`
          : opt.value
      )
      .join(',')

  return walk(options)
}
