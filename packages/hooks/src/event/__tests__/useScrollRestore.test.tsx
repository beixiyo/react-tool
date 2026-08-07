import { act, renderHook, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useScrollRestore } from '../useScrollRestore'

describe('useScrollRestore', () => {
  it('为元素容器恢复保存的滚动位置', () => {
    const container = createScrollContainer()
    const ref = createRef<HTMLDivElement>()
    ref.current = container

    sessionStorage.setItem('scroll:test', JSON.stringify({
      x: 18,
      y: 42,
    }))

    renderHook(() => useScrollRestore(ref, 'scroll:test'))

    expect(container.scrollLeft).toBe(18)
    expect(container.scrollTop).toBe(42)

    container.remove()
  })

  it('节流保存滚动位置并在清理时移除监听器', async () => {
    const container = createScrollContainer()
    const ref = createRef<HTMLDivElement>()
    ref.current = container
    const addListener = vi.spyOn(container, 'addEventListener')
    const removeListener = vi.spyOn(container, 'removeEventListener')

    const { unmount } = renderHook(() => useScrollRestore(ref, 'scroll:save'))

    container.scrollLeft = 7
    container.scrollTop = 9

    act(() => {
      container.dispatchEvent(new Event('scroll'))
    })

    await waitFor(() => {
      expect(sessionStorage.getItem('scroll:save')).toBe(JSON.stringify({
        x: 7,
        y: 9,
      }))
    })

    expect(addListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })

    unmount()

    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function))

    container.remove()
  })
})

function createScrollContainer() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  return container
}
