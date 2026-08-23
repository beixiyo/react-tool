import type { ChatInputShortcut, ChatInputShortcutEvent } from '../../types'
import { matchesKey, matchesModifiers } from 'utils/keyboard'

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

  return matchesKey(event, { key })
    && matchesModifiers(event, {
      mod: modifiers.has('mod'),
      ctrl: modifiers.has('ctrl'),
      shift: modifiers.has('shift'),
      alt: modifiers.has('alt'),
      meta: modifiers.has('meta'),
    })
}
