import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScrollIntoView } from '../useScrollIntoView'

afterEach(() => {
  vi.useRealTimers()
})

describe('useScrollIntoView', () => {
  it('delay 非正数时立即滚动一个或多个目标', () => {
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

  it('对调用进行防抖并支持取消待处理滚动', () => {
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
