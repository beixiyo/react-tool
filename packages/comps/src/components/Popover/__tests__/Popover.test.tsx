import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Popover } from '..'
import type { PopoverRef } from '..'

describe('Popover', () => {
  it('hover 触发：移出后延迟关闭，移入浮层内容可取消关闭', async () => {
    render(
      <Popover
        trigger="hover"
        removeDelay={ 120 }
        content={ <div>Hover popover content</div> }
      >
        <button type="button">Hover me</button>
      </Popover>,
    )

    const trigger = screen.getByRole('button', { name: 'Hover me' }).parentElement!
    fireEvent.mouseEnter(trigger)
    const floating = screen.getByText('Hover popover content').parentElement!
    expect(floating.style.display).not.toBe('none')

    /** 移出触发器后，在 removeDelay 内移入浮层内容，不应关闭 */
    fireEvent.mouseLeave(trigger)
    await sleep(40)
    fireEvent.mouseEnter(floating)
    await sleep(250)
    expect(floating.style.display).not.toBe('none')

    /** 移出浮层内容后才延迟关闭 */
    fireEvent.mouseLeave(floating)
    await waitFor(() => expect(floating.style.display).toBe('none'))
  })

  it('开启箭头时把箭头凸出量计入定位偏移，保证可见间距与无箭头一致', async () => {
    /** jsdom 中触发器矩形为 0，右侧浮层的 left 即为定位偏移 */
    const getFloatingLeft = async (arrow: boolean) => {
      const label = arrow
        ? 'Open arrow popover'
        : 'Open plain popover'
      const text = arrow
        ? 'Arrow popover content'
        : 'Plain popover content'
      const view = render(
        <Popover
          trigger="click"
          position="right"
          arrow={ arrow }
          content={ <div>{ text }</div> }
        >
          <button type="button">{ label }</button>
        </Popover>,
      )

      fireEvent.click(screen.getByRole('button', { name: label }))
      const floating = (await screen.findByText(text)).parentElement!
      await waitFor(() => expect(floating.style.left).not.toBe('-9999px'))
      const left = floating.style.left
      view.unmount()
      return left
    }

    /** 默认 offset 8：无箭头时面板边缘距目标 8px */
    expect(await getFloatingLeft(false)).toBe('8px')
    /** 默认箭头高 7，压入面板 1px 后尖端凸出 6，面板需再远这一段 */
    expect(await getFloatingLeft(true)).toBe('14px')
  })

  it('内容中的自定义按钮可用 ref.close() 关闭浮层并归还焦点', async () => {
    const ref = createRef<PopoverRef>()
    render(
      <Popover
        ref={ ref }
        trigger="click"
        content={ <button type="button" onClick={ () => ref.current?.close() }>完成</button> }
      >
        <button type="button">Open popover</button>
      </Popover>,
    )

    const trigger = screen.getByRole('button', { name: 'Open popover' })
    trigger.focus()
    fireEvent.click(trigger)

    const done = await screen.findByRole('button', { name: '完成' })
    await waitFor(() => expect(document.activeElement).toBe(done))
    fireEvent.click(done)

    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(trigger)
  })

  it('自定义非 Escape 关闭键只响应浮层自身事件', async () => {
    render(
      <Popover
        trigger="click"
        closeKeys={ ['ArrowRight'] }
        content={ <div>Scoped popover content</div> }
      >
        <button type="button">Open scoped popover</button>
      </Popover>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open scoped popover' }))
    const content = await screen.findByText('Scoped popover content')
    const outsideEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })

    fireEvent(document, outsideEvent)
    expect(outsideEvent.defaultPrevented).toBe(false)
    expect(content.parentElement?.style.display).not.toBe('none')

    fireEvent.keyDown(content, { key: 'ArrowRight' })
    await waitFor(() => expect(content.parentElement?.style.display).toBe('none'))
  })

  it('click 触发器同步 aria-expanded / aria-controls，浮层为 dialog', async () => {
    render(
      <Popover trigger="click" content={ <div>Dialog content</div> }>
        <button type="button">Open dialog popover</button>
      </Popover>,
    )

    /** 单个元素 children 时状态注入到该元素本身，包裹层不再携带 */
    const triggerEl = screen.getByRole('button', { name: 'Open dialog popover' })
    const button = triggerEl
    expect(triggerEl.parentElement!.hasAttribute('aria-expanded')).toBe(false)
    expect(triggerEl.getAttribute('aria-haspopup')).toBe('dialog')
    expect(triggerEl.getAttribute('aria-expanded')).toBe('false')
    expect(triggerEl.hasAttribute('aria-controls')).toBe(false)

    fireEvent.click(button)
    const dialog = await screen.findByRole('dialog')
    expect(triggerEl.getAttribute('aria-expanded')).toBe('true')
    expect(triggerEl.getAttribute('aria-controls')).toBe(dialog.id)
  })

  it('click 打开后焦点移入浮层首个可聚焦元素，Esc 关闭后归还触发器', async () => {
    render(
      <Popover trigger="click" content={ <input aria-label="Popover input" /> }>
        <button type="button">Open focus popover</button>
      </Popover>,
    )

    const button = screen.getByRole('button', { name: 'Open focus popover' })
    button.focus()
    fireEvent.click(button)

    const input = await screen.findByRole('textbox', { name: 'Popover input' })
    await waitFor(() => expect(document.activeElement).toBe(input))

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    })
    await waitFor(() => expect(document.activeElement).toBe(button))
  })

  it('restoreFocusOnOpen 时不把焦点移入浮层', async () => {
    render(
      <Popover trigger="click" restoreFocusOnOpen content={ <input aria-label="Toolbar input" /> }>
        <button type="button">Open toolbar popover</button>
      </Popover>,
    )

    const button = screen.getByRole('button', { name: 'Open toolbar popover' })
    button.focus()
    fireEvent.click(button)
    await screen.findByRole('textbox', { name: 'Toolbar input' })
    await sleep(50)
    expect(document.activeElement).toBe(button)
  })

  it('支持 defaultOpen 与受控 open / onOpenChange', async () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Popover trigger="click" defaultOpen onOpenChange={ onOpenChange } content={ <div>Default open</div> }>
        <button type="button">Default trigger</button>
      </Popover>,
    )
    const content = screen.getByText('Default open')
    expect(content.parentElement?.style.display).not.toBe('none')

    fireEvent.click(screen.getByRole('button', { name: 'Default trigger' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(content.parentElement?.style.display).toBe('none'))

    /** 受控：点击只通知，不改内部状态 */
    const onControlledChange = vi.fn()
    rerender(
      <Popover trigger="click" open={ false } onOpenChange={ onControlledChange } content={ <div>Default open</div> }>
        <button type="button">Default trigger</button>
      </Popover>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Default trigger' }))
    expect(onControlledChange).toHaveBeenCalledExactlyOnceWith(true)
    await sleep(20)
    expect(content.parentElement?.style.display).toBe('none')

    rerender(
      <Popover trigger="click" open onOpenChange={ onControlledChange } content={ <div>Default open</div> }>
        <button type="button">Default trigger</button>
      </Popover>,
    )
    await waitFor(() => expect(content.parentElement?.style.display).not.toBe('none'))
  })
})

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
