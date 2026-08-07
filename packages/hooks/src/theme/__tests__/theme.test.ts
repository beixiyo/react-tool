import { THEME_KEY } from 'config'
import { beforeEach, describe, expect, it } from 'vitest'
import { getCurrentTheme, setHTMLTheme, toggleTheme } from '../theme'

describe('主题辅助函数', () => {
  beforeEach(() => {
    document.documentElement.className = ''
  })

  it('仅设置选中的 html 主题类名', () => {
    setHTMLTheme('dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)

    setHTMLTheme('light')

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('持久化显式主题选择并将其读取为本地状态', () => {
    const nextTheme = toggleTheme('dark')

    expect(nextTheme).toBe('dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(getCurrentTheme()).toEqual({
      fromLocal: true,
      theme: 'dark',
    })
  })

  it('未提供目标主题时基于已存储主题切换', () => {
    localStorage.setItem(THEME_KEY, 'dark')
    setHTMLTheme('dark')

    const nextTheme = toggleTheme()

    expect(nextTheme).toBe('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
