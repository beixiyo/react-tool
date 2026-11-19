import { useLatestCallback, useTypeahead } from 'hooks'
import { useCascadeMenuKeyboard } from '../../../hooks/useCascadeMenuKeyboard'
import { getNodeText } from '../../../utils/getNodeText'
import { getEnabledBoundaryIndex, getNextEnabledIndex, isOptionDisabled } from '../../../utils/optionTree'
import type { Option } from '../types'

/**
 * Select 非 editable trigger 的键盘导航
 */
export function useSelectKeyboard(options: SelectKeyboardOptions) {
  const {
    disabled,
    loading,
    isOpen,
    openSelect,
    isCascading,
    typeahead: typeaheadEnabled,
    rootOptions,
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    highlightedIndex,
    setHighlightedIndex,
    filteredOptions,
    handleOptionClick,
  } = options

  /** 级联模式到头停住，与非级联列表一致 */
  const handleCascadeKey = useCascadeMenuKeyboard({
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    onSelect: handleOptionClick,
  })

  /** 非级联打开态在 filteredOptions 中匹配；关闭态在首列（未过滤）中匹配 */
  const typeaheadList = isOpen && !isCascading
    ? filteredOptions
    : rootOptions
  const typeahead = useTypeahead({
    count: typeaheadList.length,
    getLabel: (index) => getNodeText(typeaheadList[index]?.label),
    isDisabled: (index) => isOptionDisabled(typeaheadList[index]),
  })

  return useLatestCallback((e: React.KeyboardEvent) => {
    if (disabled || loading) return

    /** input 元素（editable / search / footer 输入）自行处理按键，不拦截 */
    const isInputTarget = (e.target as HTMLElement).tagName === 'INPUT'

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        typeahead.reset()
        openSelect(
          e.key === 'ArrowUp'
            ? -1
            : 1,
        )
        return
      }

      /** 聚焦未打开时输入字符：打开并高亮匹配项 */
      if (typeaheadEnabled && !isInputTarget) {
        const matched = typeahead.handleKey(e, -1)
        if (matched !== -1) {
          e.preventDefault()
          openSelect(1, matched)
        }
      }
      return
    }

    if (isInputTarget) return

    if (isCascading) {
      if (!typeaheadEnabled && e.key.length === 1) return
      handleCascadeKey(e)
      return
    }

    const list = filteredOptions
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = getNextEnabledIndex(
        list,
        highlightedIndex,
        e.key === 'ArrowDown'
          ? 1
          : -1,
      )
      if (next !== highlightedIndex) setHighlightedIndex(next)
      return
    }

    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      const next = getEnabledBoundaryIndex(
        list,
        e.key === 'Home'
          ? 1
          : -1,
      )
      if (next !== highlightedIndex) setHighlightedIndex(next)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const option = list[highlightedIndex]
      if (option && !option.disabled) handleOptionClick(option.value)
      return
    }

    if (!typeaheadEnabled) return
    const matched = typeahead.handleKey(e, highlightedIndex)
    if (matched !== -1) {
      e.preventDefault()
      setHighlightedIndex(matched)
    }
  })
}

type SelectKeyboardOptions = {
  disabled: boolean
  loading: boolean
  isOpen: boolean
  /** 打开面板；`highlightIndex` 为打开后首列直接高亮的下标（typeahead 命中） */
  openSelect: (direction: 1 | -1, highlightIndex?: number) => void
  isCascading: boolean
  /** 是否启用 typeahead（searchable / editable 时由输入框负责过滤，不启用） */
  typeahead: boolean
  /** 未过滤的首列选项，关闭态 typeahead 在其中匹配 */
  rootOptions: Option[]
  menuStack: Option[][]
  setMenuStack: React.Dispatch<React.SetStateAction<Option[][]>>
  highlightedIndices: number[]
  setHighlightedIndices: React.Dispatch<React.SetStateAction<number[]>>
  highlightedIndex: number
  setHighlightedIndex: (n: number) => void
  filteredOptions: Option[]
  handleOptionClick: (value: string) => void
}
