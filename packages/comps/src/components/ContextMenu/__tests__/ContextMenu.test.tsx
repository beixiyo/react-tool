import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { ContextMenu } from '../ContextMenu'
import type { ContextMenuRef } from '../ContextMenu'

describe('ContextMenu 可访问交互', () => {
  it('提供 menu 语义、打开后聚焦容器，Escape 关闭并恢复触发元素焦点', async () => {
    render(<ContextMenuHarness />)

    const trigger = screen.getByRole('button', { name: '打开菜单' })
    trigger.focus()

    const closedBeforeOpen = dispatchKey('Escape')
    expect(closedBeforeOpen.defaultPrevented).toBe(false)

    fireEvent.click(trigger)

    const menu = await screen.findByRole('menu')
    expect(menu.getAttribute('tabindex')).toBe('-1')
    await waitFor(() => expect(document.activeElement).toBe(menu))

    const openEvent = dispatchKey('Escape')
    expect(openEvent.defaultPrevented).toBe(true)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger)

    const closedAfterOpen = dispatchKey('Escape')
    expect(closedAfterOpen.defaultPrevented).toBe(false)
  })
})

function ContextMenuHarness() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<ContextMenuRef>(null)

  return (
    <>
      <button
        onClick={ () => {
          menuRef.current?.open(
            new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              clientX: 24,
              clientY: 24,
            }),
          )
        } }
      >
        打开菜单
      </button>
      <ContextMenu
        ref={ menuRef }
        open={ open }
        onOpenChange={ setOpen }
      >
        任意 ReactNode
      </ContextMenu>
    </>
  )
}

function dispatchKey(key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  })
  act(() => document.dispatchEvent(event))
  return event
}
