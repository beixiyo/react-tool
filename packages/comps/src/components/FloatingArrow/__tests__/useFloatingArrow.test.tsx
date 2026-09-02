import { act, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useFloatingArrow } from '../useFloatingArrow'

describe('useFloatingArrow', () => {
  const originalResizeObserver = globalThis.ResizeObserver
  let resizeCallbacks: ResizeObserverCallback[] = []

  beforeEach(() => {
    resizeCallbacks = []
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallbacks.push(callback)
      }

      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  })

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver
  })

  it('浮层尚未布局时不采信测量，布局完成后按尺寸重测并贴边收敛', () => {
    const reference = document.createElement('div')
    const floating = document.createElement('div')
    document.body.append(reference, floating)

    /** reference 中心在 x=400，远超浮层宽度，箭头应贴到浮层右侧的安全内边距处 */
    reference.getBoundingClientRect = () => rect({ left: 100, top: 0, width: 600, height: 40 })
    defineSize(floating, 0)

    const referenceRef = createRef<HTMLDivElement>()
    const floatingRef = createRef<HTMLDivElement>()
    Object.assign(referenceRef, { current: reference })
    Object.assign(floatingRef, { current: floating })

    const { result } = renderHook(() => useFloatingArrow({
      enabled: true,
      placement: 'bottom-start',
      floatingStyle: { left: '100px', top: '48px' },
      referenceRef,
      floatingRef,
      size: 12,
      padding: 16,
    }))

    /** 修复前：宽度为 0 时被夹到 0，箭头压在圆角上 */
    expect(result.current).not.toBe(0)

    defineSize(floating, 272)
    act(() => {
      resizeCallbacks.forEach(callback => callback([], {} as ResizeObserver))
    })

    /** 272 - (12 / 2 + 16) */
    expect(result.current).toBe(250)

    reference.remove()
    floating.remove()
  })
})

function defineSize(el: HTMLElement, width: number) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: 40, configurable: true })
  Object.defineProperty(el, 'offsetLeft', { value: 0, configurable: true })
  Object.defineProperty(el, 'offsetTop', { value: 0, configurable: true })
}

function rect(input: Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>): DOMRect {
  return {
    ...input,
    x: input.left,
    y: input.top,
    right: input.left + input.width,
    bottom: input.top + input.height,
    toJSON: () => ({}),
  }
}
