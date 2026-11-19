// @vitest-environment jsdom

/**
 * useMenuNavigation 契约：跳过禁用项、Tab 不拦截、监听只绑在容器上且不随高亮移动重绑
 */
import { act, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMenuNavigation } from '../hooks/useMenuNavigation'

type Item = { label: string; disabled?: boolean }

const ITEMS: Item[] = [
  { label: 'a' },
  { label: 'b', disabled: true },
  { label: 'c' },
  { label: 'd', disabled: true },
]

function setup(options: { onSelect?: (item: Item) => void; loop?: boolean } = {}) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const addSpy = vi.spyOn(container, 'addEventListener')
  /** 与组件里的 useRef 一样保持引用稳定 */
  const containerRef = { current: container }

  const hook = renderHook(() =>
    useMenuNavigation<Item>({
      containerRef,
      items: ITEMS,
      isItemDisabled: (item) => !!item.disabled,
      ...options,
    })
  )

  const press = (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
    act(() => {
      container.dispatchEvent(event)
    })
    return event
  }

  return { ...hook, container, addSpy, press }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useMenuNavigation', () => {
  it('方向键与 Home / End 跳过禁用项，默认循环', () => {
    const { result, press } = setup()
    expect(result.current.selectedIndex).toBe(0)

    press('ArrowDown')
    expect(result.current.selectedIndex).toBe(2)
    press('ArrowDown')
    expect(result.current.selectedIndex).toBe(0)
    press('ArrowUp')
    expect(result.current.selectedIndex).toBe(2)

    press('Home')
    expect(result.current.selectedIndex).toBe(0)
    press('End')
    expect(result.current.selectedIndex).toBe(2)
  })

  it('loop=false 时到头停住', () => {
    const { result, press } = setup({ loop: false })
    press('ArrowUp')
    expect(result.current.selectedIndex).toBe(0)
  })

  it('Enter 选中当前项，Tab 不拦截且不移动高亮', () => {
    const onSelect = vi.fn()
    const { result, press } = setup({ onSelect })

    press('ArrowDown')
    press('Enter')
    expect(onSelect).toHaveBeenCalledWith(ITEMS[2])

    const tab = press('Tab')
    expect(tab.defaultPrevented).toBe(false)
    expect(result.current.selectedIndex).toBe(2)
  })

  it('高亮移动不重新绑定 keydown 监听', () => {
    const { addSpy, press } = setup()
    const countKeydownBinds = () => addSpy.mock.calls.filter(([type]) => type === 'keydown').length
    const before = countKeydownBinds()

    press('ArrowDown')
    press('ArrowDown')
    expect(countKeydownBinds()).toBe(before)
  })

  it('不监听 window', () => {
    const { result } = setup()
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowDown' })
    })
    expect(result.current.selectedIndex).toBe(0)
  })
})
