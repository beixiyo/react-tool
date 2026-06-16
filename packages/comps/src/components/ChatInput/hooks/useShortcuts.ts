import { useShortCutKey } from 'hooks'
import { getModifierKey } from '../constants'

type ShortcutProps = {
  /** 面板控件 */
  enablePromptTemplates: boolean
  setShowPromptPanel: (show: boolean) => void
  setPromptHighlightIndex: (index: number) => void

  enableHistory: boolean
  setShowHistoryPanel: (show: boolean) => void
  setHistoryHighlightIndex: (index: number) => void

  setShowAutoComplete: (show: boolean) => void

  /** 处理程序 */
  setSearchQuery: (query: string) => void
}

/**
 * 用于管理键盘快捷键的 Hook
 */
export function useShortcuts({
  enablePromptTemplates,
  setShowPromptPanel,
  setPromptHighlightIndex,
  enableHistory,
  setShowHistoryPanel,
  setHistoryHighlightIndex,
  setShowAutoComplete,
  setSearchQuery,
}: ShortcutProps) {
  const modifierKey = getModifierKey()

  /** 打开提示面板的快捷键 */
  useShortCutKey({
    key: '/',
    ...modifierKey,
    fn: () => {
      if (enablePromptTemplates) {
        setShowPromptPanel(true)
        setShowHistoryPanel(false)
        setShowAutoComplete(false)
        setSearchQuery('')
        setPromptHighlightIndex(0)
      }
    },
  })

  /** 打开历史面板的快捷键 */
  useShortCutKey({
    key: 'h',
    ...modifierKey,
    fn: () => {
      if (enableHistory) {
        setShowHistoryPanel(true)
        setShowPromptPanel(false)
        setShowAutoComplete(false)
        setSearchQuery('')
        setHistoryHighlightIndex(0)
      }
    },
  })
}
