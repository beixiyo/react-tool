import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { expectPattern, getAccessibleName } from '../../../__tests__/utils/ariaPatterns'
import { Modal } from '../Modal'

function dispatchKey(key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  act(() => {
    document.dispatchEvent(event)
  })
  return event
}

function Harness({ titleText, ariaLabel, header }: { titleText?: string; ariaLabel?: string; header?: null }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={ () => setOpen(true) }>打开弹窗</button>
      <Modal open={ open } onOpenChange={ setOpen } titleText={ titleText } ariaLabel={ ariaLabel } header={ header }>
        <input aria-label="名称" />
      </Modal>
    </>
  )
}

describe('Modal ARIA 契约', () => {
  it('titleText 渲染为 aria-labelledby 指向的标题，aria-modal=true', async () => {
    render(<Harness titleText="编辑资料" />)
    fireEvent.click(screen.getByRole('button', { name: '打开弹窗' }))

    const dialog = await screen.findByRole('dialog')
    expectPattern(dialog, 'dialog')
    expect(getAccessibleName(dialog)).toBe('编辑资料')
    expect(dialog.hasAttribute('aria-labelledby')).toBe(true)
  })

  it('header 置空时 ariaLabel 作为可访问名', async () => {
    render(<Harness ariaLabel="快捷操作" header={ null } />)
    fireEvent.click(screen.getByRole('button', { name: '打开弹窗' }))

    const dialog = await screen.findByRole('dialog')
    expectPattern(dialog, 'dialog')
    expect(getAccessibleName(dialog)).toBe('快捷操作')
  })

  it('未传 titleText 时仍显示默认标题，但给了 ariaLabel 时以 ariaLabel 为可访问名', async () => {
    render(<Harness ariaLabel="快捷操作" />)
    fireEvent.click(screen.getByRole('button', { name: '打开弹窗' }))

    const dialog = await screen.findByRole('dialog')
    expect(screen.getByRole('heading', { name: 'Modal Title' })).toBeTruthy()
    expect(getAccessibleName(dialog)).toBe('快捷操作')
    expectPattern(dialog, 'dialog')
  })

  it('Escape 关闭后焦点归还触发器，关闭后不再拦截 Escape 与 Tab', async () => {
    render(<Harness titleText="编辑资料" />)
    const trigger = screen.getByRole('button', { name: '打开弹窗' })
    trigger.focus()
    fireEvent.click(trigger)

    const input = await screen.findByRole('textbox', { name: '名称' })
    await waitFor(() => expect(document.activeElement).toBe(input))

    expect(dispatchKey('Escape').defaultPrevented).toBe(true)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)

    expect(dispatchKey('Escape').defaultPrevented).toBe(false)
    expect(fireEvent.keyDown(trigger, { key: 'Tab' })).toBe(true)
    expect(document.activeElement).toBe(trigger)
  })
})
