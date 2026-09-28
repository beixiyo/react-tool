import { useLatestCallback } from 'hooks'
import { useEffect } from 'react'
import type { UseShortcutActionsOptions } from '../../types'
import { isChatInputShortcutMatch } from './match'

export function useShortcutActions(options: UseShortcutActionsOptions) {
  const {
    shortcuts,
    promptEnabled,
    historyEnabled,
    disabled,
    target,
    openPrompt,
    openHistory,
  } = options

  const handleKeyDown = useLatestCallback((event: KeyboardEvent) => {
    if (event.isComposing) return

    if (promptEnabled && isChatInputShortcutMatch(event, shortcuts.openPrompt)) {
      event.preventDefault()
      event.stopPropagation()
      openPrompt()
      return
    }

    if (historyEnabled && isChatInputShortcutMatch(event, shortcuts.openHistory)) {
      event.preventDefault()
      event.stopPropagation()
      openHistory()
    }
  })

  useEffect(() => {
    if (disabled || !target) return

    target.addEventListener('keydown', handleKeyDown)
    return () => target.removeEventListener('keydown', handleKeyDown)
  }, [disabled, handleKeyDown, target])
}
