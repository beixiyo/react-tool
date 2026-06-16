import type { ChatInputShortcut } from '../../types'
import { getModifierKeyText } from '../../constants'

export function formatChatInputShortcut(shortcuts: readonly ChatInputShortcut[]): string {
  return shortcuts
    .map(item => item
      .split('+')
      .map(formatShortcutToken)
      .join(' + '))
    .join(' / ')
}

function formatShortcutToken(token: string): string {
  switch (token) {
    case 'Mod':
      return getModifierKeyText()
    case 'Meta':
      return '⌘'
    case 'Ctrl':
      return 'Ctrl'
    case 'Shift':
      return 'Shift'
    case 'Alt':
      return 'Alt'
    default:
      return token
  }
}
