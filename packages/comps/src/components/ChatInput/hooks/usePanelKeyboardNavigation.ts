/** 为 ChatInput 浮层提供一致的元素作用域列表键盘导航。 */

import { useKeyboardLayer, useLatestCallback } from 'hooks'
import type { RefObject } from 'react'
import { useEffect } from 'react'
import { Z } from '../../../constants/z-index'

export function usePanelKeyboardNavigation(options: UsePanelKeyboardNavigationOptions) {
  const {
    active,
    targetRef,
    itemCount,
    highlightedIndex,
    confirmKey = 'Enter',
    wrap = false,
    onHighlightChange,
    onConfirm,
    onClose,
  } = options

  useKeyboardLayer({
    active,
    keys: ['Escape'],
    priority: Z.dropdown,
    allowRepeat: false,
    onKeyDown: onClose,
  })

  const handleKeyDown = useLatestCallback((event: KeyboardEvent) => {
    if (event.isComposing || itemCount === 0) return

    let nextIndex: number | undefined

    if (event.key === 'ArrowDown') {
      nextIndex = highlightedIndex >= itemCount - 1
        ? (wrap
          ? 0
          : itemCount - 1)
        : highlightedIndex + 1
    }
    else if (event.key === 'ArrowUp') {
      nextIndex = highlightedIndex <= 0
        ? (wrap
          ? itemCount - 1
          : 0)
        : highlightedIndex - 1
    }
    else if (event.key === 'Home') {
      nextIndex = 0
    }
    else if (event.key === 'End') {
      nextIndex = itemCount - 1
    }
    else if (event.key === confirmKey && highlightedIndex >= 0 && highlightedIndex < itemCount) {
      event.preventDefault()
      event.stopPropagation()
      onConfirm(highlightedIndex)
      return
    }

    if (nextIndex === undefined) return

    event.preventDefault()
    event.stopPropagation()
    onHighlightChange(nextIndex)
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
  onHighlightChange: (index: number) => void
  onConfirm: (index: number) => void
  onClose: () => void
}
