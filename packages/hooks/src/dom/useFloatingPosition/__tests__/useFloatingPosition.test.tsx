import { renderHook, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { useFloatingPosition } from '../useFloatingPosition'

describe('useFloatingPosition', () => {
  it('溢出浮层的绝对定位子元素（如箭头）不计入浮层尺寸', async () => {
    const reference = document.createElement('div')
    const floating = document.createElement('div')
    document.body.append(reference, floating)

    mockRect(reference, { top: 300, left: 100, width: 80, height: 40 })
    /** 面板布局高度 72，箭头向下溢出 11px 使 scrollHeight 变为 83 */
    mockRect(floating, { top: 0, left: 0, width: 200, height: 72 })
    Object.defineProperty(floating, 'scrollWidth', { value: 200, configurable: true })
    Object.defineProperty(floating, 'scrollHeight', { value: 83, configurable: true })

    const referenceRef = createRef<HTMLDivElement>()
    const floatingRef = createRef<HTMLDivElement>()
    Object.assign(referenceRef, { current: reference })
    Object.assign(floatingRef, { current: floating })

    const { result } = renderHook(() => useFloatingPosition(referenceRef, floatingRef, {
      placement: 'top',
      offset: 13,
      flip: false,
      shift: false,
    }))

    /** top 方向：y = reference.top - 布局高度 72 - offset 13 */
    await waitFor(() => expect(result.current.style.top).toBe('215px'))

    reference.remove()
    floating.remove()
  })
})

function mockRect(
  el: HTMLElement,
  input: Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>,
) {
  Object.defineProperty(el, 'offsetWidth', { value: input.width, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: input.height, configurable: true })
  el.getBoundingClientRect = () => ({
    ...input,
    x: input.left,
    y: input.top,
    right: input.left + input.width,
    bottom: input.top + input.height,
    toJSON: () => ({}),
  })
}
