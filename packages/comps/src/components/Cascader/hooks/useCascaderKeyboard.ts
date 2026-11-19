import { useLatestCallback } from 'hooks'
import { useCascadeMenuKeyboard } from '../../../hooks/useCascadeMenuKeyboard'
import { getNodeText } from '../../../utils/getNodeText'
import type { CascaderOption } from '../types'

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

  const handleMenuKey = useCascadeMenuKeyboard({
    menuStack,
    setMenuStack,
    highlightedIndices,
    setHighlightedIndices,
    onSelect: handleOptionClick,
    onBackAtRoot: onFocusSearchByKeyboard,
    getOptionText: getCascaderOptionText,
  })

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

    handleMenuKey(event)
  })
}

/** typeahead 优先使用纯文本 searchLabel，JSX label 时提取可读文本 */
function getCascaderOptionText(option: CascaderOption) {
  return option.searchLabel ?? getNodeText(option.label)
}
