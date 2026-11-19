import { useLatestCallback, useTypeahead } from 'hooks'
import type { Dispatch, KeyboardEvent, SetStateAction } from 'react'
import { isEditableTarget } from 'utils/keyboard'
import { getNodeText } from '../utils/getNodeText'
import type { OptionLike } from '../utils/optionTree'
import { getEnabledBoundaryIndex, getNextEnabledIndex, isOptionDisabled, normalizeEnabledIndex } from '../utils/optionTree'

/**
 * 级联菜单（多列）的键盘导航，Cascader 与级联 Select 共用
 *
 * 只处理菜单已打开时的按键，开关与 Escape 由调用方负责：
 * - ArrowUp / ArrowDown：当前列移动高亮，跳过 disabled；到头行为由 `loop` 决定
 * - Home / End：当前列首个 / 最后一个可用项
 * - ArrowRight / Enter：有子级时展开并高亮子级首个可用项，否则选中
 * - ArrowLeft：返回上一列；位于首列时调用 `onBackAtRoot`
 * - 可打印字符：在当前列 typeahead（事件目标为输入控件时跳过）
 *
 * @returns keydown 处理函数，返回 true 表示按键已被消费
 */
export function useCascadeMenuKeyboard<T extends OptionLike>(options: UseCascadeMenuKeyboardOptions<T>) {
  const {
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    onSelect,
    onBackAtRoot,
    loop = false,
    getOptionText = defaultGetOptionText,
  } = options

  const level = Math.max(0, highlightedIndices.length - 1)
  const currentOptions = menuStack[level] ?? []
  const currentIndex = highlightedIndices[level] ?? -1

  const typeahead = useTypeahead({
    count: currentOptions.length,
    getLabel: (index) => getOptionText(currentOptions[index]!),
    isDisabled: (index) => isOptionDisabled(currentOptions[index]),
  })

  const setLevelHighlight = (index: number) => {
    setHighlightedIndices((prev) => [...prev.slice(0, level), index])
  }

  return useLatestCallback((event: KeyboardEvent): boolean => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setLevelHighlight(getNextEnabledIndex(
        currentOptions,
        currentIndex,
        event.key === 'ArrowDown'
          ? 1
          : -1,
        { loop },
      ))
      return true
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setLevelHighlight(getEnabledBoundaryIndex(
        currentOptions,
        event.key === 'Home'
          ? 1
          : -1,
      ))
      return true
    }

    if (event.key === 'ArrowRight' || event.key === 'Enter') {
      event.preventDefault()

      const optionIndex = normalizeEnabledIndex(currentOptions, currentIndex)
      const option = currentOptions[optionIndex]
      if (!option) return true

      const children = option.children as T[] | undefined
      if (children?.length) {
        typeahead.reset()
        setMenuStack(menuStack.slice(0, level + 1).concat([children]))
        setHighlightedIndices((prev) => [
          ...prev.slice(0, level),
          optionIndex,
          getEnabledBoundaryIndex(children, 1),
        ])
        return true
      }

      onSelect(option.value)
      return true
    }

    if (event.key === 'ArrowLeft') {
      if (level > 0) {
        event.preventDefault()
        typeahead.reset()
        setMenuStack((prev) => prev.slice(0, level))
        setHighlightedIndices((prev) => prev.slice(0, level))
        return true
      }
      if (onBackAtRoot) {
        event.preventDefault()
        onBackAtRoot()
        return true
      }
      return false
    }

    /** 自定义触发器内的输入控件自行处理字符输入 */
    if (isEditableTarget(event.target)) return false

    const matched = typeahead.handleKey(event, currentIndex)
    if (matched === -1) return false

    event.preventDefault()
    setLevelHighlight(matched)
    return true
  })
}

function defaultGetOptionText(option: OptionLike) {
  return getNodeText(option.label)
}

export type UseCascadeMenuKeyboardOptions<T extends OptionLike> = {
  menuStack: T[][]
  setMenuStack: Dispatch<SetStateAction<T[][]>>
  highlightedIndices: number[]
  setHighlightedIndices: Dispatch<SetStateAction<number[]>>
  /** 在叶子项上 Enter / ArrowRight 时调用 */
  onSelect: (value: string) => void
  /** 在首列按 ArrowLeft 时调用（如 Cascader 回到搜索框）；不传时首列 ArrowLeft 不处理 */
  onBackAtRoot?: () => void
  /**
   * 上下键到头时是否绕回另一端
   * @default false
   */
  loop?: boolean
  /**
   * 返回选项用于 typeahead 匹配的纯文本
   * @default 提取 `label` 中的可读文本
   */
  getOptionText?: (option: T) => string
}
