import type { RefObject } from 'react'
import { useClickOutside } from 'hooks'
import { useCallback, useMemo, useRef, useState } from 'react'

/**
 * 用于管理面板（提示、历史、自动完成）可见性的 Hook
 * @param containerRef - 对主容器元素的引用
 * @returns 一个包含面板可见性状态及其切换处理程序的对象
 */
export function usePanelManager(containerRef: RefObject<HTMLDivElement | null>) {
  const [showPromptPanel, setShowPromptPanel] = useState(false)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [showAutoComplete, setShowAutoComplete] = useState(false)

  const closeAllPanels = useCallback(() => {
    setShowPromptPanel(false)
    setShowHistoryPanel(false)
    setShowAutoComplete(false)
  }, [])

  const clickOutsideOptions = useMemo(() => ({
    enabled: showPromptPanel || showHistoryPanel || showAutoComplete,
    trigger: 'mousedown' as const,
    additionalSelectors: [
      '[data-panel="prompt"]',
      '[data-panel="history"]',
      '[data-panel="autocomplete"]',
    ],
  }), [showPromptPanel, showHistoryPanel, showAutoComplete])

  const stableRefs = useRef([containerRef as RefObject<HTMLElement>])
  stableRefs.current[0] = containerRef as RefObject<HTMLElement>

  useClickOutside(
    stableRefs.current,
    closeAllPanels,
    clickOutsideOptions,
  )

  const handleShowPromptPanelToggle = useCallback(() => {
    setShowPromptPanel(prev => !prev)
    setShowHistoryPanel(false)
    setShowAutoComplete(false)
  }, [])

  const handleShowHistoryPanelToggle = useCallback(() => {
    setShowHistoryPanel(prev => !prev)
    setShowPromptPanel(false)
    setShowAutoComplete(false)
  }, [])

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
