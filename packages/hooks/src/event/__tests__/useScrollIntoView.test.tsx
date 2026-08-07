import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScrollIntoView } from '../useScrollIntoView'

afterEach(() => {
  vi.useRealTimers()
})

describe('useScrollIntoView', () => {
  it('immediately scrolls one or multiple targets when delay is not positive', () => {
    const first = createTarget()
    const second = createTarget()
    const { result } = renderHook(() => useScrollIntoView({
      delay: 0,
      block: 'center',
    }))

    act(() => result.current.scrollIntoView([first.element, () => second.element]))

    const expectedOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    }
    expect(first.scrollIntoView).toHaveBeenCalledWith(expectedOptions)
    expect(second.scrollIntoView).toHaveBeenCalledWith(expectedOptions)
  })

  it('debounces calls and supports cancelling the pending scroll', () => {
    vi.useFakeTimers()
    const first = createTarget()
    const second = createTarget()
    const { result } = renderHook(() => useScrollIntoView({ delay: 100 }))

    act(() => {
      result.current.scrollIntoView(first.element)
      result.current.scrollIntoView(second.element)
      vi.advanceTimersByTime(100)
    })

    expect(first.scrollIntoView).not.toHaveBeenCalled()
    expect(second.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })

    act(() => {
      result.current.scrollIntoView(first.element)
      result.current.cancelScroll()
      vi.advanceTimersByTime(100)
    })
    expect(first.scrollIntoView).not.toHaveBeenCalled()
  })
})

function createTarget() {
  const scrollIntoView = vi.fn()
  const element = { scrollIntoView } as unknown as Element
  return { element, scrollIntoView }
}
