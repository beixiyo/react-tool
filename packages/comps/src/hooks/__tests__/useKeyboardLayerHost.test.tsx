/**
 * 嵌套浮层的 Esc 顺序
 *
 * 守的是「弹窗里的下拉开着按 Esc，关掉的是整个弹窗」：Select 下拉不走 Portal，
 * 写死的 `Z.dropdown`（1000）在全局键盘层栈里比 Modal（1400 起）低
 * 修复前第一下 Esc 就触发 Modal 的 onClose；修复后先关下拉，再关弹窗
 */

import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'

function pressEscape(): void {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
  })
}

describe('嵌套浮层的 Esc 顺序', () => {
  it('弹窗里的 Select 下拉开着：第一下 Esc 只关下拉，第二下才关弹窗', () => {
    const onModalClose = vi.fn()
    render(
      <Modal isOpen onClose={ onModalClose }>
        <Select options={ [{ value: 'a', label: 'A' }] } />
      </Modal>,
    )

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(screen.getByRole('listbox')).toBeTruthy()

    pressEscape()
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onModalClose).not.toHaveBeenCalled()

    pressEscape()
    expect(onModalClose).toHaveBeenCalledOnce()
  })

  it('后开的弹窗压过前一个弹窗里的下拉', () => {
    const onOuterClose = vi.fn()
    const onInnerClose = vi.fn()
    render(
      <>
        <Modal isOpen onClose={ onOuterClose }>
          <Select options={ [{ value: 'a', label: 'A' }] } />
        </Modal>
        <Modal isOpen onClose={ onInnerClose }>inner</Modal>
      </>,
    )

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(screen.getByRole('listbox')).toBeTruthy()

    pressEscape()
    expect(onInnerClose).toHaveBeenCalledOnce()
    expect(onOuterClose).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeTruthy()
  })
})
