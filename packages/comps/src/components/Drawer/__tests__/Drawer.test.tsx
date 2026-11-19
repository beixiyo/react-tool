import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Drawer } from '../Drawer'
import { DrawerFramer } from '../subcomponents/DrawerFramer'

describe('Drawer 焦点管理', () => {
  it('打开时跳过隐藏和禁用控件，关闭后恢复原焦点', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()

    const { rerender } = render(
      <Drawer open closeButton={ false } ariaLabel="编辑抽屉">
        <div hidden>
          <button>隐藏操作</button>
        </div>
        <input disabled aria-label="禁用输入" />
        <button>可用操作</button>
      </Drawer>,
    )

    const enabledButton = screen.getByRole('button', { name: '可用操作' })
    await waitFor(() => expect(document.activeElement).toBe(enabledButton))

    rerender(
      <Drawer open={ false } closeButton={ false } ariaLabel="编辑抽屉">
        <button>可用操作</button>
      </Drawer>,
    )
    expect(document.activeElement).toBe(trigger)

    trigger.remove()
  })
})

describe.each([
  ['Drawer', Drawer],
  ['DrawerFramer', DrawerFramer],
] as const)('%s 模态语义', (_, Comp) => {
  it('Tab / Shift+Tab 在抽屉内循环，不逃出到页面', async () => {
    const outside = document.createElement('button')
    document.body.append(outside)

    render(
      <Comp open closeButton={ false } ariaLabel="循环抽屉">
        <button>第一个</button>
        <button>第二个</button>
      </Comp>,
    )

    const first = screen.getByRole('button', { name: '第一个' })
    const second = screen.getByRole('button', { name: '第二个' })
    await waitFor(() => expect(document.activeElement).toBe(first))

    expect(fireEvent.keyDown(first, { key: 'Tab' })).toBe(false)
    expect(document.activeElement).toBe(second)
    fireEvent.keyDown(second, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(second)

    outside.remove()
  })

  it('多个抽屉叠加时 Esc 只关闭最后打开的一层', async () => {
    const onBottomClose = vi.fn()
    const onTopClose = vi.fn()
    const { rerender } = render(
      <Comp open onClose={ onBottomClose } ariaLabel="底层抽屉" />,
    )
    rerender(
      <>
        <Comp open onClose={ onBottomClose } ariaLabel="底层抽屉" />
        <Comp open onClose={ onTopClose } ariaLabel="顶层抽屉" />
      </>,
    )

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    })
    expect(onTopClose).toHaveBeenCalledOnce()
    expect(onBottomClose).not.toHaveBeenCalled()
  })
})

describe('DrawerFramer 样式', () => {
  it('面板使用语义背景 Token 而非硬编码颜色', () => {
    render(<DrawerFramer open ariaLabel="样式抽屉" />)
    const dialog = screen.getByRole('dialog', { name: '样式抽屉' })
    expect(dialog.className).toContain('bg-background')
    expect(dialog.className).not.toMatch(/bg-white|slate/)
  })
})
