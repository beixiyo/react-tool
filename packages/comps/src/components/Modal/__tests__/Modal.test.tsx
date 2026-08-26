import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from '../Modal'

describe('模态框', () => {
  it('显式 z-index 同时决定视觉栈顶和 Escape 响应层', () => {
    const onHighClose = vi.fn()
    const onLowClose = vi.fn()
    render(
      <>
        <Modal isOpen zIndex={ 5000 } onClose={ onHighClose }>high</Modal>
        <Modal isOpen zIndex={ 100 } onClose={ onLowClose }>low</Modal>
      </>,
    )

    const highMask = document.querySelector<HTMLElement>('[style*="z-index: 5000"]')
    const lowMask = document.querySelector<HTMLElement>('[style*="z-index: 100"]')
    expect(highMask?.dataset.modalTop).toBe('true')
    expect(lowMask?.dataset.modalTop).toBe('false')

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    expect(onHighClose).toHaveBeenCalledOnce()
    expect(onLowClose).not.toHaveBeenCalled()
  })

  it('提供 dialog 语义、把焦点移入并循环 Tab，关闭后恢复触发元素焦点', async () => {
    function ModalHarness() {
      const [open, setOpen] = useState(false)

      return (
        <>
          <button onClick={ () => setOpen(true) }>打开</button>
          <Modal
            isOpen={ open }
            onClose={ () => setOpen(false) }
            titleText="测试弹窗"
          >
            <button>第一个</button>
            <button>第二个</button>
          </Modal>
        </>
      )
    }

    render(<ModalHarness />)
    const trigger = screen.getByRole('button', { name: '打开' })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = await screen.findByRole('dialog', { name: '测试弹窗' })
    const first = screen.getByRole('button', { name: '第一个' })
    const second = screen.getByRole('button', { name: '第二个' })
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    const ok = screen.getByRole('button', { name: 'OK' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(first))

    fireEvent.keyDown(first, { key: 'Tab' })
    expect(document.activeElement).toBe(second)
    fireEvent.keyDown(second, { key: 'Tab' })
    expect(document.activeElement).toBe(cancel)
    fireEvent.keyDown(cancel, { key: 'Tab' })
    expect(document.activeElement).toBe(ok)
    fireEvent.keyDown(ok, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(ok)

    const outsideTab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(outsideTab)
    expect(outsideTab.defaultPrevented).toBe(false)

    fireEvent.click(cancel)
    expect(document.activeElement).toBe(trigger)
  })

  it('仅在打开期间消费 Escape，关闭后注销键盘层', async () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={ false } onClose={ onClose } titleText="生命周期弹窗" />,
    )

    const closedBeforeOpen = dispatchKey('Escape')
    expect(closedBeforeOpen.defaultPrevented).toBe(false)

    rerender(<Modal isOpen onClose={ onClose } titleText="生命周期弹窗" />)
    await screen.findByRole('dialog', { name: '生命周期弹窗' })
    const openEvent = dispatchKey('Escape')
    expect(openEvent.defaultPrevented).toBe(true)
    expect(onClose).toHaveBeenCalledOnce()

    rerender(<Modal isOpen={ false } onClose={ onClose } titleText="生命周期弹窗" />)
    const closedAfterOpen = dispatchKey('Escape')
    expect(closedAfterOpen.defaultPrevented).toBe(false)
  })

  it('默认允许在单行输入中按 Enter 触发确认', async () => {
    const onOk = vi.fn()
    render(
      <Modal isOpen onOk={ onOk } titleText="Enter 确认">
        <input aria-label="名称" />
      </Modal>,
    )

    const input = await screen.findByRole('textbox', { name: '名称' })
    const event = dispatchKeyFrom(input, 'Enter')

    expect(event.defaultPrevented).toBe(true)
    expect(onOk).toHaveBeenCalledOnce()
  })

  it('可关闭 Enter 确认，并保留 textarea 自身的换行语义', async () => {
    const onOk = vi.fn()
    const { rerender } = render(
      <Modal isOpen enterToConfirm={ false } onOk={ onOk } titleText="关闭 Enter 确认">
        <input aria-label="名称" />
      </Modal>,
    )

    const input = await screen.findByRole('textbox', { name: '名称' })
    const disabledEvent = dispatchKeyFrom(input, 'Enter')
    expect(disabledEvent.defaultPrevented).toBe(false)
    expect(onOk).not.toHaveBeenCalled()

    rerender(
      <Modal isOpen onOk={ onOk } titleText="保留多行输入">
        <textarea aria-label="备注" />
      </Modal>,
    )
    const textareaEvent = dispatchKeyFrom(screen.getByRole('textbox', { name: '备注' }), 'Enter')
    expect(textareaEvent.defaultPrevented).toBe(false)
    expect(onOk).not.toHaveBeenCalled()
  })

  it('确认加载或禁用时不响应 Enter', async () => {
    const onOk = vi.fn()
    const { rerender } = render(
      <Modal isOpen footer={ null } okLoading onOk={ onOk } titleText="确认中">
        <input aria-label="内容" />
      </Modal>,
    )

    const input = await screen.findByRole('textbox', { name: '内容' })
    expect(dispatchKeyFrom(input, 'Enter').defaultPrevented).toBe(false)
    expect(onOk).not.toHaveBeenCalled()

    rerender(
      <Modal isOpen footer={ null } okButtonProps={ { disabled: true } } onOk={ onOk } titleText="确认禁用">
        <input aria-label="内容" />
      </Modal>,
    )
    expect(dispatchKeyFrom(input, 'Enter').defaultPrevented).toBe(false)
    expect(onOk).not.toHaveBeenCalled()
  })

  it('多个 Modal 同时打开时只确认视觉栈顶', async () => {
    const onHighOk = vi.fn()
    const onLowOk = vi.fn()
    render(
      <>
        <Modal isOpen zIndex={ 5000 } onOk={ onHighOk } titleText="高层弹窗">
          <input aria-label="高层输入" />
        </Modal>
        <Modal isOpen zIndex={ 100 } onOk={ onLowOk } titleText="低层弹窗">
          <input aria-label="低层输入" />
        </Modal>
      </>,
    )

    const highInput = await screen.findByRole('textbox', { name: '高层输入' })
    dispatchKeyFrom(highInput, 'Enter')

    expect(onHighOk).toHaveBeenCalledOnce()
    expect(onLowOk).not.toHaveBeenCalled()
  })
})

function dispatchKey(key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  })
  act(() => document.dispatchEvent(event))
  return event
}

function dispatchKeyFrom(target: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  })
  act(() => target.dispatchEvent(event))
  return event
}
