import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Popover } from '..'

describe('Popover', () => {
  it('关闭控件使用可聚焦的原生按钮并能关闭浮层', async () => {
    render(
      <Popover
        trigger="click"
        showCloseBtn
        content={ <div>Popover content</div> }
      >
        <button type="button">Open popover</button>
      </Popover>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }))

    const closeButton = await screen.findByRole('button', { name: 'Close popover' })
    closeButton.focus()
    expect(document.activeElement).toBe(closeButton)
    expect(closeButton).toHaveProperty('tabIndex', 0)

    fireEvent.click(closeButton)

    await waitFor(() => expect(closeButton.parentElement?.style.display).toBe('none'))
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
})
