import type { ChatInputShortcutEvent } from '../../../types'
import { afterEach, describe, expect, it } from 'vitest'
import { isChatInputShortcutMatch } from '../match'

const originalPlatform = navigator.platform
const originalUserAgent = navigator.userAgent

describe('isChatInputShortcutMatch', () => {
  afterEach(() => {
    setNavigatorPlatform(originalPlatform, originalUserAgent)
  })

  it('requires exact modifier state for explicit shortcuts', () => {
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

  it('matches keys case-insensitively across shortcut lists', () => {
    expect(isChatInputShortcutMatch(eventOf({
      ctrlKey: true,
      key: 'h',
    }), ['Ctrl+/', 'Ctrl+H'])).toBe(true)

    expect(isChatInputShortcutMatch(eventOf({
      ctrlKey: true,
      key: 'x',
    }), ['Ctrl+/', 'Ctrl+H'])).toBe(false)
  })

  it('maps Mod to Ctrl outside mac platforms', () => {
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

  it('maps Mod to Meta on mac platforms', () => {
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
