import type { Theme } from '@jl-org/tool'
import { onChangeTheme } from '@jl-org/tool'
import { useCallback, useEffect, useState } from 'react'
import { useLatestRef } from './ref'
import { getCurrentTheme, toggleTheme } from './theme'

/**
 * - 监听用户主题变化，自动设置主题色，触发对应回调
 * - 首次执行会优先设置用户主题，没有则为系统主题
 * - 监听 HTML 的 class 变化、切换系统主题事件
 *
 */
export function useChangeTheme(options?: UseChangeThemeOptions) {
  const { onLight, onDark, sync = true } = options || {}
  const handleLight = useLatestRef(onLight)
  const handleDark = useLatestRef(onDark)

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

      /** 只在同步模式下修改主题 */
      if (sync) {
        toggleTheme(theme)
      }

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
    [sync],
  )
}

/**
 * 获取和设置当前主题
 *
 * @param options 配置选项
 * @returns [theme, setTheme] - 主题值和设置函数
 *
 * @example
 * // 同步模式：初始化时自动设置主题，适合主题切换按钮
 * const [theme, setTheme] = useTheme({ sync: true })
 *
 * @example
 * // 非同步模式：初始化时不自动设置主题，但 setTheme 仍然可以调用
 * const [theme, setTheme] = useTheme({ sync: false })
 * // 适合需要获取设置主题函数，但不希望初始化时自动改变主题的场景
 */
export function useTheme(options?: UseThemeOptions) {
  const { sync = false } = options || {}

  /** 初始化主题：同步模式从 getCurrentTheme() 读取，只读模式从 HTML class 读取 */
  const [theme, setThemeState] = useState(() => {
    if (sync) {
      return getCurrentTheme().theme
    }
    /** 只读模式：从 HTML class 读取，这是最准确的 */
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light'
  })

  const _setTheme = useCallback(
    (newTheme?: Theme) => {
      const nextTheme = toggleTheme(newTheme)
      setThemeState(nextTheme)
    },
    [],
  )

  useEffect(
    () => {
      /** 只在同步模式下初始化时自动设置主题 */
      if (sync) {
        const themeInfo = getCurrentTheme()
        /** 使用 toggleTheme 完整设置主题（包括 localStorage 和 HTML class） */
        toggleTheme(themeInfo.theme)
        setThemeState(themeInfo.theme)
      }
      /** sync: false 时，不自动设置主题，只从 HTML class 读取（已在 useState 初始化时读取） */
    },
    [sync],
  )

  /** 使用 useChangeTheme 统一处理主题监听，避免重复实现 MutationObserver */
  useChangeTheme({
    onLight: sync
      ? () => _setTheme('light')
      : () => {
          /** 只读模式：从 HTML class 读取主题并更新 state */
          const currentTheme = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light'
          setThemeState(currentTheme)
        },
    onDark: sync
      ? () => _setTheme('dark')
      : () => {
          /** 只读模式：从 HTML class 读取主题并更新 state */
          const currentTheme = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light'
          setThemeState(currentTheme)
        },
    sync,
  })

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

interface UseChangeThemeOptions {
  /**
   * 用户切换到浅色模式时触发
   */
  onLight?: VoidFunction
  /**
   * 用户切换到深色模式时触发
   */
  onDark?: VoidFunction
  /**
   * 是否同步主题到 HTML class 和 localStorage
   * - `true`（默认）：自动同步主题
   * - `false`：只监听主题变化，不修改任何东西
   * @default true
   */
  sync?: boolean
}

interface UseThemeOptions {
  /**
   * 是否在初始化时自动同步主题到 HTML class 和 localStorage
   * - `true`：初始化时自动设置主题（适合主题切换按钮）
   * - `false`（默认）：初始化时不自动设置主题，但返回的 setTheme 函数仍然可以调用并设置主题
   * @default false
   */
  sync?: boolean
}
