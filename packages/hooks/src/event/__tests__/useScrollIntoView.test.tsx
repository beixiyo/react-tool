import { act, render, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScrollIntoView } from '../useScrollIntoView'

afterEach(() => {
  vi.useRealTimers()
})

describe('useScrollIntoView', () => {
  it('delay 非正数时立即滚动一个或多个目标', () => {
    const first = createTarget()
    const second = createTarget()
    const { result } = renderHook(() =>
      useScrollIntoView({
        delay: 0,
        block: 'center',
      })
    )

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

describe('useScrollIntoView 滚动边界', () => {
  it.each(
    [
      { alignment: 'nearest', top: 240, left: 120 },
      { alignment: 'start', top: 280, left: 200 },
      { alignment: 'center', top: 260, left: 160 },
      { alignment: 'end', top: 240, left: 120 },
    ] as const,
  )('$alignment 对齐时只滚动边界内最近的容器', ({ alignment, top, left }) => {
    const fixture = createScrollFixture()
    fixture.boundary.scrollTop = 55
    const { result } = renderHook(() =>
      useScrollIntoView({
        boundary: fixture.boundary,
        block: alignment,
        inline: alignment,
        behavior: 'instant',
      })
    )
    act(() => result.current.scrollIntoView(fixture.target))
    expect(fixture.scroller.scrollTop).toBe(top)
    expect(fixture.scroller.scrollLeft).toBe(left)
    expect(fixture.boundary.scrollTop).toBe(55)
    expect(fixture.target.scrollIntoView).not.toHaveBeenCalled()
  })

  it('边界 ref 尚未挂载或目标位于边界之外时，不回退到页面原生滚动', () => {
    const fixture = createScrollFixture()
    const boundary = { current: null as Element | null }
    const { result } = renderHook(() => useScrollIntoView({ boundary, behavior: 'instant' }))
    act(() => result.current.scrollIntoView(fixture.target))
    expect(fixture.target.scrollIntoView).not.toHaveBeenCalled()
    expect(fixture.scroller.scrollTop).toBe(0)

    boundary.current = document.createElement('div')
    act(() => result.current.scrollIntoView(fixture.target))
    expect(fixture.target.scrollIntoView).not.toHaveBeenCalled()

    boundary.current = fixture.boundary
    act(() => result.current.scrollIntoView(fixture.target))
    expect(fixture.scroller.scrollTop).toBe(240)
  })

  it('已经可见或跨越整个视区的超高选项，在 nearest 模式下不反复拉动', () => {
    const fixture = createScrollFixture({ left: 0, top: -20, width: 20, height: 200 })
    const { result } = renderHook(() => useScrollIntoView({ boundary: fixture.boundary }))
    act(() => result.current.scrollIntoView(fixture.target))
    expect(fixture.scroller.scrollTop).toBe(0)
    expect(fixture.scroller.scrollTo).not.toHaveBeenCalled()
  })

  it('防抖等待期间被禁用后，不执行旧滚动请求', () => {
    vi.useFakeTimers()
    const target = createTarget()
    const { result, rerender } = renderHook(({ enabled }) => useScrollIntoView({ enabled, delay: 100 }), {
      initialProps: { enabled: true },
    })
    act(() => result.current.scrollIntoView(target.element))
    rerender({ enabled: false })
    act(() => vi.advanceTimersByTime(100))
    expect(target.scrollIntoView).not.toHaveBeenCalled()
  })
})

function createScrollFixture(rect = { left: 200, top: 280, width: 20, height: 40 }) {
  const boundary = render(<div />).container
  const scroller = document.createElement('div')
  const target = document.createElement('div')
  boundary.append(scroller)
  scroller.append(target)
  scroller.style.overflow = 'auto'
  scroller.style.overflowX = 'auto'
  scroller.style.overflowY = 'auto'
  Object.defineProperties(scroller, {
    clientWidth: { value: 100 },
    offsetWidth: { value: 100 },
    scrollWidth: { value: 500 },
    clientHeight: { value: 80 },
    offsetHeight: { value: 80 },
    scrollHeight: { value: 600 },
    getBoundingClientRect: { value: () => new DOMRect(0, 0, 100, 80) },
    scrollTo: {
      value: vi.fn((position: ScrollToOptions) => {
        scroller.scrollTop = position.top ?? scroller.scrollTop
        scroller.scrollLeft = position.left ?? scroller.scrollLeft
      }),
    },
  })
  target.getBoundingClientRect = () => new DOMRect(rect.left - scroller.scrollLeft, rect.top - scroller.scrollTop, rect.width, rect.height)
  target.scrollIntoView = vi.fn()
  return { boundary, scroller, target }
}

function createTarget() {
  const scrollIntoView = vi.fn()
  const element = { scrollIntoView } as unknown as Element
  return { element, scrollIntoView }
}
