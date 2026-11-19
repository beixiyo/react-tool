// @vitest-environment jsdom

/**
 * 面板列表键盘导航契约：跳过禁用项、保留 wrap 语义、确认键不选中禁用项
 */
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePanelKeyboardNavigation } from '../usePanelKeyboardNavigation'

function setup(options: { highlightedIndex: number; wrap?: boolean; disabled?: number[] }) {
  const target = document.createElement('div')
  const onHighlightChange = vi.fn()
  const onConfirm = vi.fn()
  const disabled = new Set(options.disabled ?? [])

  renderHook(() =>
    usePanelKeyboardNavigation({
      active: true,
      targetRef: { current: target },
      itemCount: 4,
      highlightedIndex: options.highlightedIndex,
      wrap: options.wrap,
      isItemDisabled: (index) => disabled.has(index),
      onHighlightChange,
      onConfirm,
      onClose: vi.fn(),
    })
  )

  const press = (key: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }))

  return { press, onHighlightChange, onConfirm }
}

describe('usePanelKeyboardNavigation', () => {
  it('上下键跳过禁用项', () => {
    const { press, onHighlightChange } = setup({ highlightedIndex: 0, disabled: [1] })
    press('ArrowDown')
    expect(onHighlightChange).toHaveBeenLastCalledWith(2)
  })

  it('wrap 时越界绕回并跳过禁用项；不 wrap 时停住', () => {
    const wrapped = setup({ highlightedIndex: 2, wrap: true, disabled: [3, 0] })
    wrapped.press('ArrowDown')
    expect(wrapped.onHighlightChange).toHaveBeenLastCalledWith(1)

    const clamped = setup({ highlightedIndex: 2, disabled: [3] })
    clamped.press('ArrowDown')
    expect(clamped.onHighlightChange).not.toHaveBeenCalled()
  })

  it('无高亮时：↓ 落到首个可用项，↑ 在 wrap 下落到末个可用项', () => {
    const down = setup({ highlightedIndex: -1, disabled: [0] })
    down.press('ArrowDown')
    expect(down.onHighlightChange).toHaveBeenLastCalledWith(1)

    const up = setup({ highlightedIndex: -1, wrap: true, disabled: [3] })
    up.press('ArrowUp')
    expect(up.onHighlightChange).toHaveBeenLastCalledWith(2)
  })

  it('Home / End 跳过禁用项', () => {
    const { press, onHighlightChange } = setup({ highlightedIndex: 1, disabled: [0, 3] })
    press('Home')
    expect(onHighlightChange).not.toHaveBeenCalled()
    press('End')
    expect(onHighlightChange).toHaveBeenLastCalledWith(2)
  })

  it('确认键不选中禁用项', () => {
    const { press, onConfirm } = setup({ highlightedIndex: 1, disabled: [1] })
    press('Enter')
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
