import { useLatestCallback } from 'hooks'
import { getEnabledBoundaryIndex, getNextEnabledIndex } from '../../../utils/optionTree'
import type { CascaderOption } from '../types'

const isOptionDisabled = (option: CascaderOption) => !!option.disabled

/** 为 Cascader editable 输入补充 Home/End 与 disabled-safe 的方向键导航 */
export function useCascaderEditableKeyboard(options: UseCascaderEditableKeyboardOptions) {
  const {
    highlightedIndex,
    filteredOptions,
    setHighlightedIndex,
    handleInputKeyDown,
  } = options

  return useLatestCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key !== 'ArrowDown'
      && event.key !== 'ArrowUp'
      && event.key !== 'Home'
      && event.key !== 'End'
    ) {
      handleInputKeyDown(event)
      return
    }

    event.preventDefault()
    const currentOption = filteredOptions[highlightedIndex]
    const currentIndex = currentOption && !isOptionDisabled(currentOption)
      ? highlightedIndex
      : -1
    const direction = event.key === 'ArrowUp' || event.key === 'End'
      ? -1
      : 1
    const next = event.key === 'Home' || event.key === 'End'
      ? getEnabledBoundaryIndex(filteredOptions, direction, isOptionDisabled)
      : getNextEnabledIndex(filteredOptions, currentIndex, direction, isOptionDisabled)

    setHighlightedIndex(next)
  })
}

type UseCascaderEditableKeyboardOptions = {
  highlightedIndex: number
  filteredOptions: CascaderOption[]
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}
