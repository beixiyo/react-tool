import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { expectPattern } from '../../../__tests__/utils/ariaPatterns'
import { Tabs } from '../Tabs'
import type { TabItemType } from '../types'

const items: TabItemType<string>[] = [
  { value: 'a', label: 'Alpha', children: 'A panel' },
  { value: 'b', label: 'Beta', children: 'B panel', disabled: true },
  { value: 'c', label: 'Gamma', children: 'C panel' },
]

const overflowItems: TabItemType<string>[] = [
  { value: 'one', label: 'One', children: 'One panel' },
  { value: 'apple', label: 'Apple', children: 'Apple panel' },
  { value: 'banana', label: 'Banana', children: 'Banana panel', disabled: true },
  { value: 'cherry', label: 'Cherry', children: 'Cherry panel' },
]

function dispatchEscape() {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  document.dispatchEvent(event)
  return event
}

async function openMoreMenu() {
  const trigger = screen.getByRole('button', { name: /more/i })
  trigger.focus()
  fireEvent.click(trigger)
  const menu = await screen.findByRole('menu')
  await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true))
  return { trigger, menu }
}

describe('Tabs ARIA 契约', () => {
  it('tablist > tab 结构、tab 与 tabpanel 互指、单选与 roving tabindex 在切换前后都成立', () => {
    const { container } = render(<Tabs items={ items } defaultActiveKey="a" mode="none" />)
    expectPattern(container, 'tabs')

    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()
    fireEvent.keyDown(alpha, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Gamma' }))
    expectPattern(container, 'tabs')
  })

  it('禁用 tab 不可经键盘抵达：Home / End / 方向键都跳过它', () => {
    const disabledEdges: TabItemType<string>[] = [
      { value: 'x', label: 'X', disabled: true },
      { value: 'a', label: 'Alpha' },
      { value: 'c', label: 'Gamma' },
      { value: 'y', label: 'Y', disabled: true },
    ]
    render(<Tabs items={ disabledEdges } defaultActiveKey="a" mode="none" />)

    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()
    fireEvent.keyDown(alpha, { key: 'Home' })
    expect(document.activeElement).toBe(alpha)
    fireEvent.keyDown(alpha, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Gamma' }))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(alpha)
  })

  it('溢出菜单打开时为 menu > menuitemradio，aria-checked 反映当前激活项', async () => {
    render(<Tabs items={ overflowItems } defaultActiveKey="cherry" maxVisibleTabs={ 1 } mode="none" />)

    const { trigger, menu } = await openMoreMenu()
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expectPattern(menu, 'menu', { requireName: true })
    expect(screen.getByRole('menuitemradio', { name: 'Cherry' }).getAttribute('aria-checked')).toBe('true')
    /** 当前激活项在菜单里时，焦点直接落到它 */
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'Cherry' }))
  })

  it('溢出菜单中的禁用项点击不切换、不关闭菜单', async () => {
    const onChange = vi.fn()
    render(<Tabs items={ overflowItems } defaultActiveKey="one" maxVisibleTabs={ 1 } onChange={ onChange } mode="none" />)

    const { trigger } = await openMoreMenu()
    const banana = screen.getByRole('menuitemradio', { name: 'Banana' })
    expect(banana.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(banana)

    expect(onChange).not.toHaveBeenCalled()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('Tab 键离开溢出菜单时关闭菜单', async () => {
    render(<Tabs items={ overflowItems } defaultActiveKey="one" maxVisibleTabs={ 1 } mode="none" />)

    const { trigger } = await openMoreMenu()
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
  })

  it('Escape 关闭溢出菜单后焦点回到触发器，之后不再消费 Escape', async () => {
    render(<Tabs items={ overflowItems } defaultActiveKey="one" maxVisibleTabs={ 1 } mode="none" />)

    expect(dispatchEscape().defaultPrevented).toBe(false)

    const { trigger } = await openMoreMenu()
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(trigger)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())

    expect(dispatchEscape().defaultPrevented).toBe(false)
    /** 关闭后方向键不会把焦点带回菜单 */
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(trigger)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('溢出模式下 tablist 只包含 tab，溢出项面板由「更多」按钮命名，所有引用可解析', () => {
    const { container } = render(<Tabs items={ overflowItems } defaultActiveKey="one" maxVisibleTabs={ 1 } mode="none" />)
    expectPattern(container, 'tabs')

    const more = screen.getByRole('button', { name: /more/i })
    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels.slice(1).map((panel) => panel.getAttribute('aria-labelledby'))).toEqual([more.id, more.id, more.id])
  })
})
