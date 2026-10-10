import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWheelSwipe } from '../useWheelSwipe'

function wheel(el: HTMLElement, init: { deltaX?: number; deltaY?: number }) {
  const event = new WheelEvent('wheel', { ...init, cancelable: true, bubbles: true })
  el.dispatchEvent(event)
  return event
}

describe('useWheelSwipe', () => {
  let el: HTMLDivElement

  beforeEach(() => {
    vi.useFakeTimers()
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  afterEach(() => {
    vi.useRealTimers()
    el.remove()
  })

  it('一次手势（含惯性）只触发一次，静默后下一次手势可再次触发', () => {
    const onSwipeRight = vi.fn()
    renderHook(() => useWheelSwipe({ onSwipeRight }, { target: el }))

    /** 一次连续手势：40 个 5px 事件，远超阈值，事件间隔小于 idleMs */
    for (let i = 0; i < 40; i++) {
      wheel(el, { deltaX: 5 })
      vi.advanceTimersByTime(16)
    }
    expect(onSwipeRight).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(200)
    for (let i = 0; i < 20; i++) wheel(el, { deltaX: 5 })
    expect(onSwipeRight).toHaveBeenCalledTimes(2)
  })

  it('惯性尾巴持续不断时不重复触发，但新手势（位移回升）立即可再次触发', () => {
    const onSwipeRight = vi.fn()
    renderHook(() => useWheelSwipe({ onSwipeRight }, { target: el }))

    /** 松手后的惯性：位移指数衰减、事件间隔 16ms，始终不满足静默 150ms */
    let delta = 40
    for (let i = 0; i < 80; i++) {
      wheel(el, { deltaX: Math.max(1, Math.round(delta)) })
      delta *= 0.93
      vi.advanceTimersByTime(16)
    }
    expect(onSwipeRight).toHaveBeenCalledTimes(1)

    /** 惯性尾巴中紧接着开始新手势：位移从 1 回升 */
    for (const d of [3, 8, 16, 24, 30]) {
      wheel(el, { deltaX: d })
      vi.advanceTimersByTime(16)
    }
    expect(onSwipeRight).toHaveBeenCalledTimes(2)
  })

  it('同一次手势内位移上下抖动不会翻两次，惯性中骤降再回升才算新手势', () => {
    const onSwipeRight = vi.fn()
    renderHook(() => useWheelSwipe({ onSwipeRight }, { target: el }))
    const play = (deltas: number[]) => {
      for (const d of deltas) {
        wheel(el, { deltaX: d })
        vi.advanceTimersByTime(7)
      }
    }

    /** 真机采集的一次手势：位移 36 → 28 → 16 → 26 → 44 抖动，事件间隔约 7ms */
    play([1, 4, 7, 8, 9, 8, 20, 22, 25, 26, 32, 36, 28, 16, 26, 44, 50, 53, 51, 52, 51, 50, 48, 46, 45, 45, 44, 44])
    expect(onSwipeRight).toHaveBeenCalledTimes(1)

    /** 缓慢衰减的惯性，随后触摸板被再次触碰：位移骤降到个位数再爬升 */
    play([43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 30, 30, 30, 30, 30, 30, 30])
    expect(onSwipeRight).toHaveBeenCalledTimes(1)
    play([8, 7, 11, 15, 17, 18, 29, 34, 40])
    expect(onSwipeRight).toHaveBeenCalledTimes(2)
  })

  it('锁定期间反向滑动立即可触发反向', () => {
    const onSwipeRight = vi.fn()
    const onSwipeLeft = vi.fn()
    renderHook(() => useWheelSwipe({ onSwipeRight, onSwipeLeft }, { target: el }))

    wheel(el, { deltaX: 80 })
    expect(onSwipeRight).toHaveBeenCalledTimes(1)

    /** 持续有事件（未静默），冷却期（默认 150ms）过后反向 */
    for (let i = 0; i < 12; i++) {
      vi.advanceTimersByTime(16)
      wheel(el, { deltaX: 30 })
    }
    wheel(el, { deltaX: -70 })
    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
  })

  it('纵向占优的滚动不触发也不被阻止，横向手势会被阻止默认行为', () => {
    const onSwipeRight = vi.fn()
    const onSwipeLeft = vi.fn()
    renderHook(() => useWheelSwipe({ onSwipeRight, onSwipeLeft }, { target: el }))

    const vertical = wheel(el, { deltaX: 30, deltaY: 120 })
    expect(vertical.defaultPrevented).toBe(false)
    expect(onSwipeRight).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    const horizontal = wheel(el, { deltaX: -80 })
    expect(horizontal.defaultPrevented).toBe(true)
    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
  })
})
