import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectPattern, getIdRefViolations } from '../../../__tests__/utils/ariaPatterns'
import { Popover } from '../Popover'

function dispatchEscape() {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  act(() => {
    document.dispatchEvent(event)
  })
  return event
}

function renderClickPopover() {
  render(
    <Popover trigger="click" content={ <button type="button">浮层操作</button> }>
      <button type="button">更多设置</button>
    </Popover>,
  )
  return screen.getByRole('button', { name: '更多设置' })
}

async function open(button: HTMLElement) {
  button.focus()
  fireEvent.click(button)
  const dialog = await screen.findByRole('dialog')
  await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
  return dialog
}

describe('Popover（click 模式）ARIA 契约', () => {
  it('浮层为非模态 dialog，打开时所有 ID 引用可解析', async () => {
    const button = renderClickPopover()
    const dialog = await open(button)

    expect(dialog.getAttribute('aria-modal')).toBeNull()
    expect(getIdRefViolations(document.body)).toEqual([])
  })

  it('Escape 关闭后焦点归还触发按钮，关闭后不再消费 Escape，ID 引用不悬空', async () => {
    const button = renderClickPopover()
    await open(button)

    expect(dispatchEscape().defaultPrevented).toBe(true)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(button)
    expect(getIdRefViolations(document.body)).toEqual([])

    expect(dispatchEscape().defaultPrevented).toBe(false)
  })

  it('可重复开合：第二次打开同样把焦点移入并在 Escape 后归还', async () => {
    const button = renderClickPopover()
    await open(button)
    dispatchEscape()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    await open(button)
    dispatchEscape()
    await waitFor(() => expect(document.activeElement).toBe(button))
  })

  it('展开状态挂在可聚焦的触发元素上，子元素自身声明的 aria-haspopup 优先', async () => {
    const button = renderClickPopover()
    expect(button.getAttribute('aria-expanded')).toBe('false')
    await open(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    expect(button.getAttribute('aria-controls')).toBe(screen.getByRole('dialog').id)
    expect(getIdRefViolations(document.body)).toEqual([])
  })

  it('子元素自身声明的 aria-haspopup 不被覆盖', () => {
    render(
      <Popover trigger="click" content="菜单">
        <button type="button" aria-haspopup="menu">操作</button>
      </Popover>,
    )
    expect(screen.getByRole('button', { name: '操作' }).getAttribute('aria-haspopup')).toBe('menu')
  })

  it('children 不是单个元素时状态回退到包裹层', () => {
    render(<Popover trigger="click" content="内容">纯文本触发器</Popover>)
    expect(screen.getByText('纯文本触发器').getAttribute('aria-expanded')).toBe('false')
  })

  it('aria-label / aria-labelledby 作为 dialog 浮层的可访问名', async () => {
    render(
      <Popover trigger="click" aria-label="显示设置" content={ <button type="button">浮层操作</button> }>
        <button type="button">更多设置</button>
      </Popover>,
    )
    await open(screen.getByRole('button', { name: '更多设置' }))
    expectPattern(document.body, 'dialog', { modal: false })
    expect(screen.getByRole('dialog', { name: '显示设置' })).toBeTruthy()
  })
})
