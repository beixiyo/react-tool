import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ContextMenu } from '../ContextMenu'
import { ContextMenuItem } from '../subcomponents/ContextMenuItem'
import type { ContextMenuRef } from '../types'

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

  it('方向键在菜单项间循环并跳过 disabled，Home / End 跳到首末可用项', async () => {
    render(
      <ContextMenu>
        <ContextMenuItem>复制</ContextMenuItem>
        <ContextMenuItem disabled>剪切</ContextMenuItem>
        <ContextMenuItem>粘贴</ContextMenuItem>
        <ContextMenuItem>删除</ContextMenuItem>
      </ContextMenu>,
    )
    fireEvent.contextMenu(document.body, { clientX: 10, clientY: 10 })
    const menu = await screen.findByRole('menu')
    await waitFor(() => expect(document.activeElement).toBe(menu))

    const [copy, cut, paste, del] = screen.getAllByRole('menuitem')
    expect(copy!.tabIndex).toBe(-1)

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(copy)
    fireEvent.keyDown(copy!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(paste)
    expect(cut).not.toBe(document.activeElement)
    fireEvent.keyDown(paste!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(del)
    fireEvent.keyDown(del!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(copy)
    fireEvent.keyDown(copy!, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(del)
    fireEvent.keyDown(del!, { key: 'Home' })
    expect(document.activeElement).toBe(copy)
    fireEvent.keyDown(copy!, { key: 'End' })
    expect(document.activeElement).toBe(del)
  })

  it('typeahead 按首字母跳转，跳过 disabled 项', async () => {
    render(
      <ContextMenu>
        <ContextMenuItem>Apple</ContextMenuItem>
        <ContextMenuItem disabled>Banana</ContextMenuItem>
        <ContextMenuItem>Blueberry</ContextMenuItem>
        <ContextMenuItem>Cherry</ContextMenuItem>
      </ContextMenu>,
    )
    fireEvent.contextMenu(document.body)
    const menu = await screen.findByRole('menu')

    fireEvent.keyDown(menu, { key: 'c' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Cherry' }))

    /** 超时后缓冲清空，新查询从当前项之后绕回查找 */
    await new Promise((resolve) => setTimeout(resolve, 550))
    fireEvent.keyDown(document.activeElement!, { key: 'b' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Blueberry' }))

    /** 超时内连续输入构成前缀 */
    fireEvent.keyDown(document.activeElement!, { key: 'l' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Blueberry' }))
  })

  it('Enter / Space 激活自定义 menuitem；Tab 关闭菜单并归还焦点', async () => {
    const onActivate = vi.fn()
    render(<ContextMenuHarness>
      <div role="menuitem" tabIndex={ -1 } onClick={ onActivate }>自定义项</div>
    </ContextMenuHarness>)
    const trigger = screen.getByRole('button', { name: '打开菜单' })
    trigger.focus()
    fireEvent.click(trigger)

    const menu = await screen.findByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    const item = screen.getByRole('menuitem', { name: '自定义项' })
    expect(document.activeElement).toBe(item)

    fireEvent.keyDown(item, { key: 'Enter' })
    expect(onActivate).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger)

    fireEvent.click(trigger)
    const reopened = await screen.findByRole('menu')
    fireEvent.keyDown(reopened, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement!, { key: ' ' })
    expect(onActivate).toHaveBeenCalledTimes(2)

    fireEvent.click(trigger)
    const third = await screen.findByRole('menu')
    expect(fireEvent.keyDown(third, { key: 'Tab' })).toBe(false)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('typeahead 输入中按 Space 只进查询：命中则移动焦点，无匹配也不激活', async () => {
    const onSave = vi.fn()
    const onSaveAs = vi.fn()
    render(
      <ContextMenu>
        <div role="menuitem" tabIndex={ -1 } onClick={ onSave }>Save</div>
        <div role="menuitem" tabIndex={ -1 } onClick={ onSaveAs }>Save as</div>
      </ContextMenu>,
    )
    fireEvent.contextMenu(document.body)
    const menu = await screen.findByRole('menu')

    await waitFor(() => expect(document.activeElement).toBe(menu))
    for (const key of ['s', 'a', 'v', 'e']) fireEvent.keyDown(document.activeElement!, { key })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Save' }))

    /** 输入中的空格作为查询字符：「save 」跳到 Save as，而不是激活 Save */
    fireEvent.keyDown(document.activeElement!, { key: ' ' })
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Save as' }))
    expect(onSave).not.toHaveBeenCalled()

    /** 无匹配的空格：仍在输入中，不激活当前项 */
    fireEvent.keyDown(document.activeElement!, { key: 'x' })
    const spaceEvent = fireEvent.keyDown(document.activeElement!, { key: ' ' })
    expect(spaceEvent).toBe(false)
    expect(onSave).not.toHaveBeenCalled()
    expect(onSaveAs).not.toHaveBeenCalled()

    /** 超时后空格恢复激活语义 */
    await new Promise((resolve) => setTimeout(resolve, 550))
    fireEvent.keyDown(document.activeElement!, { key: ' ' })
    expect(onSaveAs).toHaveBeenCalledOnce()
  })

  it('默认非受控时响应整个页面右键，并通过 onOpenChange 通知', async () => {
    const onOpenChange = vi.fn()
    render(<ContextMenu onOpenChange={ onOpenChange }>菜单</ContextMenu>)

    const event = createContextMenuEvent()
    act(() => document.body.dispatchEvent(event))
    expect(event.defaultPrevented).toBe(true)
    expect(await screen.findByRole('menu')).toBeTruthy()
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true)
  })

  it.each([
    ['选择器', 'selector'],
    ['ref', 'ref'],
    ['元素', 'element'],
  ] as const)('传入 target（%s）后只在区域内右键打开，区域外保留原生菜单', async (_, kind) => {
    function TargetHarness() {
      const areaRef = useRef<HTMLDivElement>(null)
      const [area, setArea] = useState<HTMLDivElement | null>(null)
      const target = kind === 'selector'
        ? '[data-testid="area"]'
        : kind === 'ref'
          ? areaRef
          : area

      return (
        <>
          <div data-testid="area" ref={ (el) => { areaRef.current = el; setArea(el) } }>
            <span data-testid="inner">区域内</span>
          </div>
          <div data-testid="outside">区域外</div>
          { (kind !== 'element' || area) && <ContextMenu target={ target ?? undefined }>菜单</ContextMenu> }
        </>
      )
    }

    render(<TargetHarness />)

    const outsideEvent = createContextMenuEvent()
    act(() => screen.getByTestId('outside').dispatchEvent(outsideEvent))
    expect(outsideEvent.defaultPrevented).toBe(false)
    expect(screen.queryByRole('menu')).toBeNull()

    const insideEvent = createContextMenuEvent()
    act(() => screen.getByTestId('inner').dispatchEvent(insideEvent))
    expect(insideEvent.defaultPrevented).toBe(true)
    expect(await screen.findByRole('menu')).toBeTruthy()
  })

  it('卸载后不再拦截页面右键', () => {
    const { unmount } = render(<ContextMenu>菜单</ContextMenu>)
    unmount()

    const event = createContextMenuEvent()
    document.body.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})

function createContextMenuEvent() {
  return new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 12, clientY: 12 })
}

function ContextMenuHarness({ children }: { children?: React.ReactNode }) {
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
        { children ?? '任意 ReactNode' }
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
