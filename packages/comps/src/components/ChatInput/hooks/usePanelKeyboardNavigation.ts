/** 为 ChatInput 浮层提供一致的元素作用域列表键盘导航 */

import { useKeyboardLayer, useLatestCallback } from 'hooks'
import type { RefObject } from 'react'
import { useEffect } from 'react'
import { getBoundaryEnabledIndex, getNextEnabledIndex, isComposingEvent } from 'utils/keyboard'
import { Z } from '../../../constants/z-index'
import { useNestedLayerPriority } from '../../../hooks/useKeyboardLayerHost'

export function usePanelKeyboardNavigation(options: UsePanelKeyboardNavigationOptions) {
  const {
    active,
    targetRef,
    itemCount,
    highlightedIndex,
    confirmKey = 'Enter',
    wrap = false,
    isItemDisabled,
    onHighlightChange,
    onConfirm,
    onClose,
  } = options

  /** 面板不走 Portal，ChatInput 嵌在弹窗里时要压过弹窗，否则 Esc 关掉的是整个弹窗 */
  const layerPriority = useNestedLayerPriority(Z.dropdown)

  useKeyboardLayer({
    active,
    keys: ['Escape'],
    priority: layerPriority,
    allowRepeat: false,
    onKeyDown: onClose,
  })

  const handleKeyDown = useLatestCallback((event: KeyboardEvent) => {
    if (isComposingEvent(event) || itemCount === 0) return

    const isDisabled = (index: number) => !!isItemDisabled?.(index)
    const currentValid = highlightedIndex >= 0 && highlightedIndex < itemCount && !isDisabled(highlightedIndex)

    /** 尚无有效高亮时：↓ 落到首个可用项；↑ 在 wrap 下落到末个可用项，否则同样落到首个 */
    const step = (direction: 1 | -1) => currentValid
      ? getNextEnabledIndex({ count: itemCount, current: highlightedIndex, direction, loop: wrap, isDisabled })
      : getBoundaryEnabledIndex(itemCount, direction === -1 && wrap
        ? -1
        : 1, isDisabled)

    let nextIndex: number | undefined

    if (event.key === 'ArrowDown') {
      nextIndex = step(1)
    }
    else if (event.key === 'ArrowUp') {
      nextIndex = step(-1)
    }
    else if (event.key === 'Home') {
      nextIndex = getBoundaryEnabledIndex(itemCount, 1, isDisabled)
    }
    else if (event.key === 'End') {
      nextIndex = getBoundaryEnabledIndex(itemCount, -1, isDisabled)
    }
    else if (event.key === confirmKey && currentValid) {
      event.preventDefault()
      event.stopPropagation()
      onConfirm(highlightedIndex)
      return
    }

    if (nextIndex === undefined) return

    event.preventDefault()
    event.stopPropagation()
    /** 全部禁用时只消费按键，不改变高亮 */
    if (nextIndex !== -1 && nextIndex !== highlightedIndex) onHighlightChange(nextIndex)
  })

  useEffect(() => {
    const target = targetRef.current
    if (!active || !target) return

    target.addEventListener('keydown', handleKeyDown)
    return () => target.removeEventListener('keydown', handleKeyDown)
  }, [active, handleKeyDown, targetRef])
}

type UsePanelKeyboardNavigationOptions = {
  active: boolean
  targetRef: RefObject<HTMLElement | null>
  itemCount: number
  highlightedIndex: number
  confirmKey?: 'Enter' | 'Tab'
  wrap?: boolean
  /** 判断下标对应项是否禁用；方向键、Home / End 跳过禁用项，确认键不选中禁用项 */
  isItemDisabled?: (index: number) => boolean
  onHighlightChange: (index: number) => void
  onConfirm: (index: number) => void
  onClose: () => void
}
