import type { PanelState } from '../../types'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePersistence } from '../usePersistence'

describe('usePersistence', () => {
  it('loads persisted state only when panel count matches', () => {
    const key = 'split-pane:load'
    localStorage.setItem(key, JSON.stringify({
      sizes: [120, 280],
      collapsedStates: [false, true],
      widthsBeforeCollapse: [120, 320],
    }))

    const { result, rerender } = renderHook(
      ({ panelCount }) => usePersistence({
        storageKey: key,
        panelCount,
        states: [],
      }),
      { initialProps: { panelCount: 2 } },
    )

    expect(result.current.loadState()).toEqual({
      sizes: [120, 280],
      collapsedStates: [false, true],
      widthsBeforeCollapse: [120, 320],
    })

    rerender({ panelCount: 3 })
    expect(result.current.loadState()).toBeNull()
  })

  it('debounces state saves and keeps the latest state', () => {
    vi.useFakeTimers()

    const key = 'split-pane:save'
    const { rerender } = renderHook(
      ({ states }) => usePersistence({
        storageKey: key,
        panelCount: 2,
        states,
      }),
      {
        initialProps: {
          states: makeStates(100, 300),
        },
      },
    )

    expect(localStorage.getItem(key)).toBeNull()

    rerender({ states: makeStates(180, 220) })
    act(() => vi.advanceTimersByTime(99))
    expect(localStorage.getItem(key)).toBeNull()

    act(() => vi.advanceTimersByTime(1))
    expect(JSON.parse(localStorage.getItem(key) || '{}')).toEqual({
      sizes: [180, 220],
      collapsedStates: [false, false],
      widthsBeforeCollapse: [180, 220],
    })
  })

  it('clears pending saves on unmount', () => {
    vi.useFakeTimers()

    const key = 'split-pane:unmount'
    const { unmount } = renderHook(() => usePersistence({
      storageKey: key,
      panelCount: 2,
      states: makeStates(100, 300),
    }))

    unmount()
    act(() => vi.advanceTimersByTime(100))

    expect(localStorage.getItem(key)).toBeNull()
  })
})

function makeStates(left: number, right: number): PanelState[] {
  return [
    { width: left, collapsed: false, widthBeforeCollapse: left },
    { width: right, collapsed: false, widthBeforeCollapse: right },
  ]
}
