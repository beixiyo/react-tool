import type { ChatInputShortcut, ChatInputShortcutEvent } from '../../types'
import { getModifierKey } from '../../constants'

export function isChatInputShortcutMatch(
  event: ChatInputShortcutEvent,
  shortcuts: readonly ChatInputShortcut[],
): boolean {
  return shortcuts.some(shortcut => isSingleShortcutMatch(event, shortcut))
}

function isSingleShortcutMatch(event: ChatInputShortcutEvent, shortcut: ChatInputShortcut): boolean {
  const parts = shortcut.split('+')
  const key = parts.at(-1)
  const modifiers = new Set(parts.slice(0, -1).map(part => part.toLowerCase()))
  const mod = getModifierKey()

  return event.key.toLowerCase() === key?.toLowerCase()
    && event.ctrlKey === (modifiers.has('ctrl') || (modifiers.has('mod') && mod.ctrl))
    && event.metaKey === (modifiers.has('meta') || (modifiers.has('mod') && mod.meta))
    && event.shiftKey === modifiers.has('shift')
    && event.altKey === modifiers.has('alt')
}
