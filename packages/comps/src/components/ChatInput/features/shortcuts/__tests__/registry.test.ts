import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_CHAT_INPUT_SHORTCUTS,
  getFirstChatInputShortcut,
  resolveChatInputShortcuts,
} from '../registry'

describe('chat input shortcut registry', () => {
  it('uses defaults when shortcuts are not provided', () => {
    expect(resolveChatInputShortcuts()).toEqual(DEFAULT_CHAT_INPUT_SHORTCUTS)
  })

  it('normalizes shortcuts, removes duplicates and falls back from empty lists', () => {
    expect(resolveChatInputShortcuts({
      send: ['Mod+Enter', 'Mod+Enter'],
      wrap: [],
      openPrompt: 'Ctrl+/',
    })).toEqual({
      send: ['Mod+Enter'],
      wrap: DEFAULT_CHAT_INPUT_SHORTCUTS.wrap,
      openPrompt: ['Ctrl+/'],
      openHistory: DEFAULT_CHAT_INPUT_SHORTCUTS.openHistory,
    })
  })

  it('returns the first shortcut safely', () => {
    expect(getFirstChatInputShortcut(['Mod+Enter', 'Enter'])).toBe('Mod+Enter')
    expect(getFirstChatInputShortcut([])).toBe('')
  })

  it('warns when the same shortcut is assigned to multiple actions', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    resolveChatInputShortcuts({
      send: 'Enter',
      wrap: 'Enter',
    })

    expect(warn).toHaveBeenCalledWith(
      '[ChatInput] shortcut conflicts detected: Enter: send, wrap',
    )
  })
})
