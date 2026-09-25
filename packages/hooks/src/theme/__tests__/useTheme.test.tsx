import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setHTMLTheme, toggleTheme } from '../theme'
import { useChangeTheme, useTheme } from '../useTheme'

/** 展示 useTheme 返回值的受试组件 */
function ThemeProbe() {
  const [theme] = useTheme()
  return <div data-testid="theme">{ theme }</div>
}

function ChangeThemeProbe(props: {
  onDark: VoidFunction
  onLight: VoidFunction
}) {
  const theme = useChangeTheme({ ...props, sync: false })
  return <div data-testid="change-theme">{ theme }</div>
}

describe('useTheme / theme store', () => {
  beforeEach(() => {
    /** store 是模块级缓存，每个用例先重置到浅色（同步 DOM 与缓存） */
    setHTMLTheme('light')
  })

  it('初始为 dark 时，切到 light 的变化同步到订阅者', async () => {
    /**
     * 复现旧实现的缺陷：useChangeTheme 内 MutationObserver 的 lastTheme
     * 起点硬编码 'light'，初始为 dark 时第一次切回 light 被判定为「未变化」，
     * 订阅者的 state 停留在 dark
     */
    setHTMLTheme('dark')
    render(<ThemeProbe />)
    expect(screen.getByTestId('theme').textContent).toBe('dark')

    await act(async () => {
      toggleTheme('light')
    })
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('setTheme 后所有订阅组件同步更新', async () => {
    render(
      <>
        <ThemeProbe />
        <ThemeProbe />
      </>,
    )

    await act(async () => {
      toggleTheme('dark')
    })
    expect(screen.getAllByTestId('theme').every(el => el.textContent === 'dark')).toBe(true)
  })

  it('外部直接修改 html class 时经 MutationObserver 兜底同步', async () => {
    render(<ThemeProbe />)

    await act(async () => {
      /** 绕过 setHTMLTheme，模拟外部脚本改 class */
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      /** MutationObserver 回调在微任务时机执行 */
      await Promise.resolve()
    })
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('useChangeTheme 返回响应式主题并触发对应回调', async () => {
    const onDark = vi.fn()
    const onLight = vi.fn()

    render(<ChangeThemeProbe onDark={ onDark } onLight={ onLight } />)
    expect(screen.getByTestId('change-theme').textContent).toBe('light')
    /** 首次挂载触发一次当前主题对应的回调 */
    expect(onLight).toHaveBeenCalledTimes(1)
    expect(onDark).not.toHaveBeenCalled()

    await act(async () => {
      toggleTheme('dark')
    })
    expect(screen.getByTestId('change-theme').textContent).toBe('dark')
    expect(onDark).toHaveBeenCalledTimes(1)

    await act(async () => {
      toggleTheme('light')
    })
    expect(onLight).toHaveBeenCalledTimes(2)
  })
})
