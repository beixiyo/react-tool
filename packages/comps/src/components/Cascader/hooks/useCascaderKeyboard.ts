import { useLatestCallback } from 'hooks'
import { getEnabledBoundaryIndex, getNextEnabledIndex, normalizeEnabledIndex } from '../../../utils/optionTree'
import type { CascaderOption } from '../types'

const isOptionDisabled = (option: CascaderOption) => !!option.disabled

/**
 * 处理默认触发器上的 Cascader 键盘导航
 *
 * 菜单使用 `aria-activedescendant` 由触发器保持焦点，因此这里仅更新
 * 高亮状态，不把焦点转移到不可聚焦的 option 节点
 */
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

  return useLatestCallback((event: React.KeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setOpen(true)
      }
      return
    }

    /** Escape 由 popup 的 useKeyboardLayer 捕获；不可见层不应在此处消费它 */
    if (event.key === 'Escape') return

    const level = Math.max(0, highlightedIndices.length - 1)
    const currentOptions = menuStack[level] ?? []
    const currentIndex = highlightedIndices[level] ?? -1

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = getNextEnabledIndex(
        currentOptions,
        currentIndex,
        event.key === 'ArrowDown'
          ? 1
          : -1,
        isOptionDisabled,
      )
      setLevelHighlight(setHighlightedIndices, level, next)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const next = getEnabledBoundaryIndex(
        currentOptions,
        event.key === 'Home'
          ? 1
          : -1,
        isOptionDisabled,
      )
      setLevelHighlight(setHighlightedIndices, level, next)
      return
    }

    if (event.key === 'ArrowRight' || event.key === 'Enter') {
      event.preventDefault()

      const optionIndex = normalizeEnabledIndex(currentOptions, currentIndex, isOptionDisabled)
      const option = optionIndex === -1
        ? undefined
        : currentOptions[optionIndex]

      if (!option || option.disabled) return

      if (option.children?.length) {
        const childOptions = option.children
        const childIndex = getEnabledBoundaryIndex(childOptions, 1, isOptionDisabled)
        const newStack = menuStack.slice(0, level + 1).concat([childOptions])
        setMenuStack(newStack)
        setHighlightedIndices((prev) => [
          ...prev.slice(0, level),
          optionIndex,
          childIndex,
        ])
        return
      }

      handleOptionClick(option.value)
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (level > 0) {
        setMenuStack((prev) => prev.slice(0, level))
        setHighlightedIndices((prev) => prev.slice(0, level))
      }
      else {
        onFocusSearchByKeyboard?.()
      }
    }
  })
}

function setLevelHighlight(
  setHighlightedIndices: React.Dispatch<React.SetStateAction<number[]>>,
  level: number,
  index: number,
) {
  setHighlightedIndices((prev) => [
    ...prev.slice(0, level),
    index,
  ])
}
