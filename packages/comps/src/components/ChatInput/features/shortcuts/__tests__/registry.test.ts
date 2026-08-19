import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CHAT_INPUT_SHORTCUTS, getFirstChatInputShortcut, resolveChatInputShortcuts } from '../registry'

describe('chat input shortcut registry', () => {
  it('uses defaults when shortcuts are not provided', () => {
    expect(resolveChatInputShortcuts()).toEqual(DEFAULT_CHAT_INPUT_SHORTCUTS)
  })

  it('normalizes shortcuts and removes duplicates, leaving unlisted actions at their defaults', () => {
    expect(resolveChatInputShortcuts({
      send: ['Mod+Enter', 'Mod+Enter'],
      openPrompt: 'Ctrl+/',
    })).toEqual({
      send: ['Mod+Enter'],
      wrap: DEFAULT_CHAT_INPUT_SHORTCUTS.wrap,
      openPrompt: ['Ctrl+/'],
      openHistory: DEFAULT_CHAT_INPUT_SHORTCUTS.openHistory,
    })
  })

  /**
   * 空数组是**显式解绑**，不是「没填」
   *
   * 表单里的多行输入需要「Enter 换行、不发送」，而 send 默认绑着 Enter。
   * 若空数组回退默认值，这个需求只能靠给 send 占一个用不上的组合键来绕，
   * 那是把「不要」写成「随便要一个」，语义与意图相反
   */
  it('treats an explicitly empty list as unbinding that action', () => {
    const resolved = resolveChatInputShortcuts({
      send: [],
      wrap: ['Enter', 'Shift+Enter'],
    })

    expect(resolved.send).toEqual([])
    expect(resolved.wrap).toEqual(['Enter', 'Shift+Enter'])
    /** 没提到的动作仍取默认值，解绑只影响写了空数组的那个 */
    expect(resolved.openPrompt).toEqual(DEFAULT_CHAT_INPUT_SHORTCUTS.openPrompt)
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
