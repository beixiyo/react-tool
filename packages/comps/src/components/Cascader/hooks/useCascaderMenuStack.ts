// oxlint-disable react-hooks/exhaustive-deps
import { useLatestCallback, useLatestRef } from 'hooks'
import { useEffect, useState } from 'react'
import type { OptionLike } from '../../../utils/optionTree'
import { getEnabledBoundaryIndex } from '../../../utils/optionTree'

/**
 * 级联菜单栈与逐层高亮下标（Cascader 与级联 Select 共用）
 *
 * `menuStack[i + 1]` 是 `menuStack[i]` 中某个已展开选项的 children
 */
export function useCascaderMenuStack<T extends OptionLike>(options: T[]) {
  const [menuStack, setMenuStack] = useState<T[][]>([options])
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
    setHighlightedIndices([getEnabledBoundaryIndex(optionsRef.current, 1)])
    /** 仅在 options 结构签名变化时重置，引用变化但结构不变时不重置 */
  }, [optionsSignature])

  /** 结构不变但引用变化（如 label 更新）时，按已展开路径换成新对象，避免展示旧 label */
  useEffect(() => {
    setMenuStack((prev) =>
      prev[0] === options
        ? prev
        : remapMenuStack(prev, options)
    )
  }, [options])

  const handleOptionHover = useLatestCallback((option: T, level: number, idx: number) => {
    if (option.disabled) return

    setMenuStack((prev) => {
      const newStack = prev.slice(0, level + 1)
      if (option.children?.length) {
        newStack.push(option.children as T[])
      }
      return newStack
    })
    setHighlightedIndices((prev) => [...prev.slice(0, level), idx])
  })

  /**
   * 打开时重置菜单栈与首列高亮
   *
   * 优先级：`index`（如 typeahead 命中项）> 已选项 > `direction` 方向的端点可用项
   * 已有选中项时高亮落在选中项上，否则首个可用项会多出一层与选中态并存的高亮底色
   */
  const resetOnOpen = useLatestCallback((params: ResetOnOpenParams | string = {}) => {
    const { selectedValue, direction = 1, index } = typeof params === 'string'
      ? { selectedValue: params }
      : params
    const currentOptions = optionsRef.current
    const selectedIndex = selectedValue
      ? currentOptions.findIndex((option) => option.value === selectedValue && !option.disabled)
      : -1

    setMenuStack([currentOptions])
    setHighlightedIndices([
      index !== undefined && index >= 0
        ? index
        : selectedIndex >= 0
        ? selectedIndex
        : getEnabledBoundaryIndex(currentOptions, direction),
    ])
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

/**
 * 生成 options 的 value 树结构签名，仅反映层级与 value，
 * 用于判断结构是否真的变化（忽略引用变化）
 */
function getOptionsSignature(options: OptionLike[]): string {
  const walk = (opts: OptionLike[]): string =>
    opts
      .map((opt) =>
        opt.children?.length
          ? `${opt.value}(${walk(opt.children)})`
          : opt.value
      )
      .join(',')

  return walk(options)
}

/** 沿旧菜单栈的展开路径（按 value）在新 options 中找回对应层级，找不到时截断 */
function remapMenuStack<T extends OptionLike>(prev: T[][], options: T[]): T[][] {
  const next: T[][] = [options]

  for (let level = 1; level < prev.length; level += 1) {
    const parent = prev[level - 1]?.find((option) => option.children === prev[level])
    const nextParent = parent && next[level - 1]!.find((option) => option.value === parent.value)
    if (!nextParent?.children?.length) break
    next.push(nextParent.children as T[])
  }

  return next
}

type ResetOnOpenParams = {
  /** 首列中需要高亮的已选值 */
  selectedValue?: string
  /**
   * 无已选项时取首个（1）还是最后一个（-1）可用项
   * @default 1
   */
  direction?: 1 | -1
  /** 直接指定首列高亮下标，优先级最高 */
  index?: number
}
