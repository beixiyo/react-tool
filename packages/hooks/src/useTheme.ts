import type { Theme } from '@jl-org/tool'
import { onChangeTheme } from '@jl-org/tool'
import { useCallback, useEffect, useState } from 'react'
import { useWatchRef } from './state'
import { getCurrentTheme, setHTMLTheme, toggleTheme } from './theme'

/**
 * - 监听用户主题变化，自动设置主题色，触发对应回调
 * - 首次执行会优先设置用户主题，没有则为系统主题
 * - 监听 HTML 的 class 变化、切换系统主题事件
 *
 * @param onLight 用户切换到浅色模式时触发
 * @param onDark 用户切换到深色模式时触发
 */
export function useChangeTheme(
  onLight?: VoidFunction,
  onDark?: VoidFunction,
) {
  const handleLight = useWatchRef(onLight)
  const handleDark = useWatchRef(onDark)

  useEffect(
    () => {
      let lastTheme: Theme = 'light'

      // ======================
      // * Mutation Observer
      // ======================
      const observer = new MutationObserver((mutations) => {
        const isDark = (mutations[0]?.target as HTMLElement)?.classList.contains('dark')
        const isThemeChange = lastTheme !== (isDark
          ? 'dark'
          : 'light')
        lastTheme = isDark
          ? 'dark'
          : 'light'

        if (!isThemeChange) {
          return
        }

        isDark
          ? handleDark.current?.()
          : handleLight.current?.()
      })

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: false,
        childList: false,
        characterData: false,
        attributeOldValue: false,
        characterDataOldValue: false,
      })

      // ======================
      // * Theme
      // ======================
      const { theme } = getCurrentTheme()
      toggleTheme(theme)

      theme === 'dark'
        ? handleDark.current?.()
        : handleLight.current?.()

      const unbindSystemTheme = onChangeTheme(
        () => handleLight.current?.(),
        () => handleDark.current?.(),
      )

      return () => {
        observer.disconnect()
        unbindSystemTheme()
      }
    },
    [],
  )
}

/**
 * 获取和设置当前主题
 */
export function useTheme(defaultTheme: Theme = 'light') {
  const [theme, setTheme] = useState(() => getCurrentTheme().theme || defaultTheme)

  const _setTheme = useCallback(
    (theme?: Theme) => {
      const nextTheme = toggleTheme(theme)
      setTheme(nextTheme)
    },
    [setTheme],
  )

  useEffect(
    () => {
      const themeInfo = getCurrentTheme()
      setTheme(themeInfo.theme)
      setHTMLTheme(themeInfo.theme)
    },
    [],
  )

  useChangeTheme(
    () => _setTheme('light'),
    () => _setTheme('dark'),
  )

  return [theme, _setTheme] as const
}

/**
 * 丝滑地动画切换主题
 * @example
 * const [theme, setTheme] = useTheme()
 * useInsertStyle({
 *   lightStyleStrOrUrl: new URL('styles/transition/theme.css', import.meta.url).href,
 *   darkStyleStrOrUrl: new URL('styles/transition/theme.css', import.meta.url).href,
 * })
 * const handleToggle = useToggleThemeWithTransition(theme, setTheme)
 *
 * <Button onClick={ handleToggle }>Toggle</Button>
 */
export function useToggleThemeWithTransition(
  theme: Theme,
  setTheme: VoidFunction,
) {
  return useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const x = event.clientX
      const y = event.clientY
      const isDark = theme === 'dark'
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      )

      /** 兼容性处理 */
      if (!document.startViewTransition) {
        setTheme()
        return
      }
      const transition = document.startViewTransition(() => {
        setTheme()
      })

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]

        document.documentElement.animate(
          {
            clipPath: isDark
              ? clipPath
              : [...clipPath].reverse(),
          },
          {
            duration: 400,
            easing: 'ease-in',
            pseudoElement: isDark
              ? '::view-transition-new(root)'
              : '::view-transition-old(root)',
          },
        )
      })
    },
    [setTheme, theme],
  )
}
