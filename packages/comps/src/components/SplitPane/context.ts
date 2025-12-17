import type { PanelState } from './types'
import { createContext, use } from 'react'

export type SplitPaneContextValue = {
  /**
   * 所有面板状态（按 id 索引）
   */
  panelStates: Record<string, PanelState>
  /**
   * 切换面板收起/展开状态
   */
  togglePanel: (id: string) => void
}

export const SplitPaneContext = createContext<SplitPaneContextValue | null>(null)

/**
 * 获取指定面板的状态和控制方法
 * @param id 面板 id
 * @returns 面板状态和切换方法
 */
export function usePanelState(id: string) {
  const ctx = use(SplitPaneContext)
  if (!ctx) {
    console.warn('usePanelState must be used within a SplitPane')
    return { state: undefined, toggle: () => { } }
  }

  return {
    state: ctx.panelStates[id] as PanelState | undefined,
    toggle: () => ctx.togglePanel(id),
  }
}

export function useTogglePanel(id: string) {
  const ctx = use(SplitPaneContext)
  if (!ctx) {
    console.warn('usePanelState must be used within a SplitPane')
    return
  }

  ctx.togglePanel(id)
}
