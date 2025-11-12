import type { RefObject } from 'react'
import { useClickOutside } from 'hooks'
import { useMemo, useState } from 'react'

/**
 * 用于管理面板（提示、历史、自动完成）可见性的 Hook
 * @param containerRef - 对主容器元素的引用
 * @returns 一个包含面板可见性状态及其切换处理程序的对象
 */
export function usePanelManager(containerRef: RefObject<HTMLDivElement | null>) {
  const [showPromptPanel, setShowPromptPanel] = useState(false)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [showAutoComplete, setShowAutoComplete] = useState(false)

  const closeAllPanels = () => {
    setShowPromptPanel(false)
    setShowHistoryPanel(false)
    setShowAutoComplete(false)
  }

  const clickOutsideOptions = useMemo(() => ({
    enabled: showPromptPanel || showHistoryPanel || showAutoComplete,
    trigger: 'mousedown' as const,
    additionalSelectors: [
      '[data-panel="prompt"]',
      '[data-panel="history"]',
      '[data-panel="autocomplete"]',
    ],
  }), [showPromptPanel, showHistoryPanel, showAutoComplete])

  useClickOutside(
    [containerRef as RefObject<HTMLElement>],
    closeAllPanels,
    clickOutsideOptions,
  )

  const handleShowPromptPanelToggle = () => {
    const isOpening = !showPromptPanel
    closeAllPanels()
    setShowPromptPanel(isOpening)
  }

  const handleShowHistoryPanelToggle = () => {
    const isOpening = !showHistoryPanel
    closeAllPanels()
    setShowHistoryPanel(isOpening)
  }

  return {
    showPromptPanel,
    setShowPromptPanel,
    showHistoryPanel,
    setShowHistoryPanel,
    showAutoComplete,
    setShowAutoComplete,
    closeAllPanels,
    handleShowPromptPanelToggle,
    handleShowHistoryPanelToggle,
  }
}
