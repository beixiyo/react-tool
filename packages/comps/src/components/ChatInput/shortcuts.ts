import type { ChatInputShortcut, ChatInputShortcuts } from './types'
import { getModifierKey, getModifierKeyText } from './constants'

export const DEFAULT_CHAT_INPUT_SHORTCUTS: Required<ChatInputShortcuts> = {
  send: 'Enter',
  wrap: 'Shift+Enter',
}

export function resolveChatInputShortcuts(shortcuts?: ChatInputShortcuts): Required<ChatInputShortcuts> {
  return {
    ...DEFAULT_CHAT_INPUT_SHORTCUTS,
    ...shortcuts,
  }
}

export function isChatInputShortcutMatch(
  event: ChatInputShortcutEvent,
  shortcut: ChatInputShortcut | ChatInputShortcut[],
): boolean {
  return toShortcutList(shortcut).some(item => isSingleShortcutMatch(event, item))
}

export function formatChatInputShortcut(shortcut: ChatInputShortcut | ChatInputShortcut[]): string {
  return toShortcutList(shortcut)
    .map(item => item
      .split('+')
      .map(formatShortcutToken)
      .join(' + '))
    .join(' / ')
}

function toShortcutList(shortcut: ChatInputShortcut | ChatInputShortcut[]): ChatInputShortcut[] {
  return Array.isArray(shortcut)
    ? shortcut
    : [shortcut]
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

type ChatInputShortcutEvent = {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
}
