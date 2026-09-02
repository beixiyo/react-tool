import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFloatingTrigger } from '../useFloatingTrigger'

describe('useFloatingTrigger', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('hover 模式：移出触发器后延迟关闭，期间移入浮层可取消关闭', () => {
    const { result } = renderHook(() => useFloatingTrigger({
      trigger: 'hover',
      hideDelay: 200,
    }))

    act(() => result.current.triggerProps.onMouseEnter())
    expect(result.current.isOpen).toBe(true)

    /** 移出触发器后在 hideDelay 内移入浮层，不应关闭 */
    act(() => result.current.triggerProps.onMouseLeave())
    act(() => {
      vi.advanceTimersByTime(100)
    })
    act(() => result.current.floatingProps.onMouseEnter())
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.isOpen).toBe(true)

    /** 移出浮层后才真正延迟关闭 */
    act(() => result.current.floatingProps.onMouseLeave())
    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(result.current.isOpen).toBe(true)
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('showDelay 内移出触发器会取消尚未发生的打开', () => {
    const { result } = renderHook(() => useFloatingTrigger({
      trigger: 'hover',
      showDelay: 300,
    }))

    act(() => result.current.triggerProps.onMouseEnter())
    act(() => {
      vi.advanceTimersByTime(100)
    })
    act(() => result.current.triggerProps.onMouseLeave())
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('受控模式下不改内部状态，只通过 onOpenChange 通知', () => {
    const onOpenChange = vi.fn()
    const { result } = renderHook(() => useFloatingTrigger({
      trigger: 'click',
      open: false,
      onOpenChange,
    }))

    act(() => result.current.triggerProps.onClick())
    expect(result.current.isOpen).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })
})
