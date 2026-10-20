/** 按方向计算的间距必须同时参与翻面判断和箭头距离换算 */
import { act, renderHook, waitFor } from '@testing-library/react'
import type { FloatingOffsetContext } from 'hooks'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useFloatingLayer } from '../hooks/useFloatingLayer'

describe('useFloatingLayer directional offset', () => {
  it('候选方向使用各自的间距，缩放后收敛到同一方向与坐标', async () => {
    const reference = document.createElement('div')
    const floating = document.createElement('div')
    document.body.append(reference, floating)

    reference.getBoundingClientRect = () => new DOMRect(500, 300, 24, 24)
    floating.getBoundingClientRect = () => new DOMRect(0, 0, 400, 200)
    Object.defineProperty(floating, 'offsetWidth', { value: 400 })
    Object.defineProperty(floating, 'offsetHeight', { value: 200 })

    const referenceRef = createRef<HTMLDivElement>()
    const floatingRef = createRef<HTMLDivElement>()
    Object.assign(referenceRef, { current: reference })
    Object.assign(floatingRef, { current: floating })

    const offset = ({ placement, referenceElement }: FloatingOffsetContext) => {
      expect(referenceElement).toBe(reference)
      return placement === 'right'
        ? 120
        : 12
    }
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024)

    const { result, unmount } = renderHook(() =>
      useFloatingLayer(referenceRef, floatingRef, {
        placement: 'right',
        offset,
        arrow: true,
      })
    )

    try {
      /** 右侧溢出；左侧箭头尖端距 reference 12px，面板还需让出箭头凸出的 6px */
      await waitFor(() => {
        expect(result.current.placement).toBe('left')
        expect(result.current.style.left).toBe('82px')
      })

      /** 只用左侧的短间距评估右侧会错误地认为它放得下；宽屏时才应恢复右侧 */
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1100)
      act(() => window.dispatchEvent(new Event('resize')))
      await waitFor(() => {
        expect(result.current.placement).toBe('right')
        expect(result.current.style.left).toBe('650px')
      })

      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024)
      act(() => window.dispatchEvent(new Event('resize')))
      await waitFor(() => {
        expect(result.current.placement).toBe('left')
        expect(result.current.style.left).toBe('82px')
      })

      act(() => {
        result.current.update()
        result.current.update()
      })
      expect(result.current.placement).toBe('left')
      expect(result.current.style.left).toBe('82px')
    }
    finally {
      unmount()
      reference.remove()
      floating.remove()
    }
  })
})
