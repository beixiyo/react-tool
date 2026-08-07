import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_CHAT_INPUT_SHORTCUTS,
  getFirstChatInputShortcut,
  resolveChatInputShortcuts,
} from '../registry'

describe('聊天输入快捷键注册表', () => {
  it('未提供快捷键时使用默认值', () => {
    expect(resolveChatInputShortcuts()).toEqual(DEFAULT_CHAT_INPUT_SHORTCUTS)
  })

  it('规范化快捷键、移除重复项并在列表为空时回退', () => {
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

  it('安全返回第一个快捷键', () => {
    expect(getFirstChatInputShortcut(['Mod+Enter', 'Enter'])).toBe('Mod+Enter')
    expect(getFirstChatInputShortcut([])).toBe('')
  })

  it('同一快捷键分配给多个操作时发出警告', () => {
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
