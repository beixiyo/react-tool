import type { ChatInputShortcutEvent } from '../../../types'
import { afterEach, describe, expect, it } from 'vitest'
import { isChatInputShortcutMatch } from '../match'

const originalPlatform = navigator.platform
const originalUserAgent = navigator.userAgent

describe('isChatInputShortcutMatch', () => {
  afterEach(() => {
    setNavigatorPlatform(originalPlatform, originalUserAgent)
  })

  it('显式快捷键要求修饰键状态完全匹配', () => {
    expect(isChatInputShortcutMatch(eventOf({
      ctrlKey: true,
      key: 'Enter',
    }), ['Ctrl+Enter'])).toBe(true)

    expect(isChatInputShortcutMatch(eventOf({
      ctrlKey: true,
      key: 'Enter',
      shiftKey: true,
    }), ['Ctrl+Enter'])).toBe(false)

    expect(isChatInputShortcutMatch(eventOf({
      key: 'Enter',
      shiftKey: true,
    }), ['Shift+Enter'])).toBe(true)
  })

  it('在快捷键列表中不区分大小写匹配按键', () => {
    expect(isChatInputShortcutMatch(eventOf({
      ctrlKey: true,
      key: 'h',
    }), ['Ctrl+/', 'Ctrl+H'])).toBe(true)

    expect(isChatInputShortcutMatch(eventOf({
      ctrlKey: true,
      key: 'x',
    }), ['Ctrl+/', 'Ctrl+H'])).toBe(false)
  })

  it('在 mac 平台之外将 Mod 映射为 Ctrl', () => {
    setNavigatorPlatform('Win32')

    expect(isChatInputShortcutMatch(eventOf({
      ctrlKey: true,
      key: '/',
    }), ['Mod+/'])).toBe(true)

    expect(isChatInputShortcutMatch(eventOf({
      key: '/',
      metaKey: true,
    }), ['Mod+/'])).toBe(false)
  })

  it('在 mac 平台将 Mod 映射为 Meta', () => {
    setNavigatorPlatform('MacIntel')

    expect(isChatInputShortcutMatch(eventOf({
      key: '/',
      metaKey: true,
    }), ['Mod+/'])).toBe(true)

    expect(isChatInputShortcutMatch(eventOf({
      ctrlKey: true,
      key: '/',
    }), ['Mod+/'])).toBe(false)
  })
})

function eventOf(event: Partial<ChatInputShortcutEvent>): ChatInputShortcutEvent {
  return {
    altKey: false,
    ctrlKey: false,
    key: 'Enter',
    metaKey: false,
    shiftKey: false,
    ...event,
  }
}

function setNavigatorPlatform(platform: string, userAgent = 'Mozilla/5.0') {
  Object.defineProperty(navigator, 'platform', {
    configurable: true,
    value: platform,
  })
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  })
}
