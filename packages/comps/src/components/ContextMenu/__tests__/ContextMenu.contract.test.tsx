import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { expectPattern } from '../../../__tests__/utils/ariaPatterns'
import { ContextMenu } from '../ContextMenu'
import { ContextMenuItem } from '../subcomponents/ContextMenuItem'
import type { ContextMenuRef } from '../types'

function Harness({ onCopy, onCut }: { onCopy?: () => void; onCut?: () => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<ContextMenuRef>(null)

  return (
    <>
      <button
        type="button"
        onClick={ () => menuRef.current?.open(new MouseEvent('contextmenu', { clientX: 24, clientY: 24 })) }
      >
        打开菜单
      </button>
      <ContextMenu ref={ menuRef } open={ open } onOpenChange={ setOpen }>
        <ContextMenuItem disabled>撤销</ContextMenuItem>
        <ContextMenuItem onClick={ onCopy }>复制</ContextMenuItem>
        <ContextMenuItem disabled onClick={ onCut }>剪切</ContextMenuItem>
        <ContextMenuItem>粘贴</ContextMenuItem>
        <ContextMenuItem disabled>删除</ContextMenuItem>
      </ContextMenu>
    </>
  )
}

function dispatchKey(key: string) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    document.dispatchEvent(event)
  })
  return event
}

async function openMenu() {
  const trigger = screen.getByRole('button', { name: '打开菜单' })
  trigger.focus()
  fireEvent.click(trigger)
  const menu = await screen.findByRole('menu')
  await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true))
  return { trigger, menu }
}

describe('ContextMenu ARIA 契约', () => {
  it('menu > menuitem 结构成立，菜单内不产生额外 Tab 停靠点，禁用项带 aria-disabled', async () => {
    render(<Harness />)
    const { menu } = await openMenu()

    expectPattern(menu, 'menu')
    expect(screen.getByRole('menuitem', { name: '剪切' }).getAttribute('aria-disabled')).toBe('true')

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expectPattern(menu, 'menu')
  })

  it('首尾都是禁用项时 Home / End 停在首末可用项', async () => {
    render(<Harness />)
    const { menu } = await openMenu()

    fireEvent.keyDown(menu, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: '粘贴' }))
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: '复制' }))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: '粘贴' }))
  })

  it('禁用项点击不触发回调', async () => {
    const onCut = vi.fn()
    render(<Harness onCut={ onCut } />)
    await openMenu()

    fireEvent.click(screen.getByRole('menuitem', { name: '剪切' }))
    expect(onCut).not.toHaveBeenCalled()
  })

  it('Escape 关闭后焦点归还触发器，关闭后不再消费 Escape / 方向键', async () => {
    const onCopy = vi.fn()
    render(<Harness onCopy={ onCopy } />)
    const { trigger, menu } = await openMenu()
    fireEvent.keyDown(menu, { key: 'ArrowDown' })

    expect(dispatchKey('Escape').defaultPrevented).toBe(true)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger)

    expect(dispatchKey('Escape').defaultPrevented).toBe(false)
    expect(dispatchKey('ArrowDown').defaultPrevented).toBe(false)
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(document.activeElement).toBe(trigger)
    expect(onCopy).not.toHaveBeenCalled()
  })
})
