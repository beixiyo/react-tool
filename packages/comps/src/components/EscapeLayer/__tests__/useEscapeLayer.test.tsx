import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useEscapeLayer } from '../useEscapeLayer'

describe('useEscapeLayer', () => {
  it('同一次 Escape 只交给最后打开的浮层', () => {
    const onParentEscape = vi.fn()
    const onChildEscape = vi.fn()
    const { rerender } = renderHook(
      ({ childOpen }) => {
        const parent = useEscapeLayer({
          open: true,
          onEscape: onParentEscape,
        })
        const child = useEscapeLayer({
          open: childOpen,
          onEscape: onChildEscape,
        })

        return { parent, child }
      },
      {
        initialProps: {
          childOpen: true,
        },
      },
    )

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }))
    })

    expect(onChildEscape).toHaveBeenCalledOnce()
    expect(onParentEscape).not.toHaveBeenCalled()

    rerender({ childOpen: false })

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }))
    })

    expect(onParentEscape).toHaveBeenCalledOnce()
  })

  it('不可关闭的栈顶层会阻止 Escape 穿透', () => {
    const onParentEscape = vi.fn()
    const onChildEscape = vi.fn()
    renderHook(() => {
      useEscapeLayer({
        open: true,
        onEscape: onParentEscape,
      })
      useEscapeLayer({
        open: true,
        dismissible: false,
        onEscape: onChildEscape,
      })
    })

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    act(() => {
      document.dispatchEvent(event)
    })

    expect(event.defaultPrevented).toBe(true)
    expect(onChildEscape).not.toHaveBeenCalled()
    expect(onParentEscape).not.toHaveBeenCalled()
  })

  it('更新回调不会改变现有浮层顺序', () => {
    const firstParentEscape = vi.fn()
    const latestParentEscape = vi.fn()
    const onChildEscape = vi.fn()
    const { rerender, result } = renderHook(
      ({ onParentEscape }) => {
        const parent = useEscapeLayer({
          open: true,
          onEscape: onParentEscape,
        })
        const child = useEscapeLayer({
          open: true,
          onEscape: onChildEscape,
        })

        return { parent, child }
      },
      {
        initialProps: {
          onParentEscape: firstParentEscape,
        },
      },
    )

    rerender({ onParentEscape: latestParentEscape })

    expect(result.current.parent.isTopLayer).toBe(false)
    expect(result.current.child.isTopLayer).toBe(true)

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }))
    })

    expect(onChildEscape).toHaveBeenCalledOnce()
    expect(firstParentEscape).not.toHaveBeenCalled()
    expect(latestParentEscape).not.toHaveBeenCalled()
  })
})
