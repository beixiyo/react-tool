import { THEME_KEY } from 'config'
import { beforeEach, describe, expect, it } from 'vitest'
import { getCurrentTheme, setHTMLTheme, toggleTheme } from '../theme'

describe('theme helpers', () => {
  beforeEach(() => {
    document.documentElement.className = ''
  })

  it('sets only the selected html theme class', () => {
    setHTMLTheme('dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)

    setHTMLTheme('light')

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists explicit theme selection and reads it as local state', () => {
    const nextTheme = toggleTheme('dark')

    expect(nextTheme).toBe('dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(getCurrentTheme()).toEqual({
      fromLocal: true,
      theme: 'dark',
    })
  })

  it('toggles from the stored theme when no target theme is provided', () => {
    localStorage.setItem(THEME_KEY, 'dark')
    setHTMLTheme('dark')

    const nextTheme = toggleTheme()

    expect(nextTheme).toBe('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
