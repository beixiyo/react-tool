import type { Theme } from '@jl-org/tool'
import { getCurTheme } from '@jl-org/tool'
import { THEME_KEY } from 'config'

/**
 * 获取当前主题
 * - 先取本地主题
 * - 没有则取系统主题
 */
export function getCurrentTheme() {
  const userTheme = localStorage.getItem(THEME_KEY)
  if (userTheme) {
    return {
      theme: userTheme as Theme,
      fromLocal: true,
    }
  }

  return {
    theme: getCurTheme() as Theme,
    fromLocal: false,
  }
}

/**
 * 设置主题色，包含 html、LocalStorage
 * @param theme 主题色，不传则为切换主题色
 */
export function toggleTheme(theme?: Theme) {
  if (theme) {
    localStorage.setItem(THEME_KEY, theme)
    setHTMLTheme(theme)

    return theme
  }

  const nextTheme = getCurrentTheme().theme === 'dark'
    ? 'light'
    : 'dark'
  localStorage.setItem(THEME_KEY, nextTheme)
  setHTMLTheme(nextTheme)

  return nextTheme
}

/**
 * 设置 html 元素的主题属性
 * @param theme
 */
export function setHTMLTheme(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark'

  root.classList.remove(isDark
    ? 'light'
    : 'dark',
  )

  root.classList.add(isDark
    ? 'dark'
    : 'light',
  )
}
