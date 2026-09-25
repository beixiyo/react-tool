import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from '../useMediaQuery'

/** 可控的 MediaQueryList 替身：能主动改 matches 并通知监听者 */
class FakeMediaQueryList {
  matches = false
  readonly media: string
  private readonly listeners = new Set<() => void>()

  constructor(media: string) {
    this.media = media
  }

  addEventListener = (_type: 'change', listener: () => void) => {
    this.listeners.add(listener)
  }

  removeEventListener = (_type: 'change', listener: () => void) => {
    this.listeners.delete(listener)
  }

  /** 模拟匹配结果变化 */
  setMatches(matches: boolean) {
    this.matches = matches
    for (const listener of this.listeners)
      listener()
  }
}

function SchemeProbe() {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)')
  return <div data-testid="match">{ isDark 
		? 'dark' 
		: 'light' }</div>
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('matchMedia 匹配变化时同步更新', async () => {
    const darkQuery = new FakeMediaQueryList('(prefers-color-scheme: dark)')
    vi.stubGlobal('matchMedia', vi.fn((query: string) => {
      if (query === darkQuery.media)
        return darkQuery
      return new FakeMediaQueryList(query)
    }))

    render(<SchemeProbe />)
    expect(screen.getByTestId('match').textContent).toBe('light')

    await act(async () => {
      darkQuery.setMatches(true)
    })
    expect(screen.getByTestId('match').textContent).toBe('dark')

    await act(async () => {
      darkQuery.setMatches(false)
    })
    expect(screen.getByTestId('match').textContent).toBe('light')
  })
})
