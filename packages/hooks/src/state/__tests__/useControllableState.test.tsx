import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from '../useControllableState'

describe('useControllableState', () => {
  it('非受控时更新内部状态并通知 onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultValue: false, onChange }))

    act(() => result.current[1](true))

    expect(result.current[0]).toBe(true)
    expect(result.current[2]).toBe(false)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('受控时只通知 onChange，值由上层决定', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: 'a', onChange }),
      { initialProps: { value: 'x' } },
    )

    act(() => result.current[1]('y'))
    expect(result.current[0]).toBe('x')
    expect(onChange).toHaveBeenCalledWith('y')

    rerender({ value: 'y' })
    expect(result.current[0]).toBe('y')
  })

  it('受控时上层拒绝变更，重复请求仍会通知 onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ value: false, defaultValue: false, onChange }))

    act(() => result.current[1](true))
    act(() => result.current[1](true))

    expect(result.current[0]).toBe(false)
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('值未变化时不触发 onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }))

    act(() => result.current[1](1))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('同一批次内连续函数式更新基于上一次结果', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultValue: 0, onChange }))

    act(() => {
      result.current[1]((prev) => prev + 1)
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(2)
    expect(onChange).toHaveBeenLastCalledWith(2)
  })
})
