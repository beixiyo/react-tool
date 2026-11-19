import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Tabs } from '../Tabs'
import type { TabItemType } from '../types'

const baseItems: TabItemType<string>[] = [
  { value: 'a', label: 'Alpha', children: 'A panel' },
  { value: 'b', label: 'Beta', children: 'B panel', disabled: true },
  { value: 'c', label: 'Gamma', children: 'C panel' },
  { value: 'd', label: 'Delta', children: 'D panel' },
]

describe('Tabs 激活状态与禁用', () => {
  it('没有激活项时第一个可用 tab 可通过 Tab 键进入', () => {
    render(<Tabs items={ [{ ...baseItems[1] }, ...baseItems.filter((i) => i.value !== 'b')] } mode="none" />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1, -1])
  })

  it('非受控：defaultActiveKey 初始化，点击后内部切换并回调', () => {
    const onChange = vi.fn()
    render(<Tabs items={ baseItems } defaultActiveKey="c" onChange={ onChange } mode="none" />)

    expect(screen.getByRole('tab', { name: 'Gamma' }).getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByRole('tab', { name: 'Delta' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'd' }))
    expect(screen.getByRole('tab', { name: 'Delta' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('D panel')
  })

  it('禁用项带 aria-disabled，点击不切换也不回调', () => {
    const onChange = vi.fn()
    render(<Tabs items={ baseItems } defaultActiveKey="a" onChange={ onChange } mode="none" />)

    const beta = screen.getByRole('tab', { name: 'Beta' })
    expect(beta.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(beta)
    expect(onChange).not.toHaveBeenCalled()
    expect(beta.getAttribute('aria-selected')).toBe('false')
  })

  it('方向键跳过禁用项并循环，Home / End 到首尾可用项', () => {
    render(<Tabs items={ baseItems } defaultActiveKey="a" mode="none" />)

    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()

    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    const gamma = screen.getByRole('tab', { name: 'Gamma' })
    expect(document.activeElement).toBe(gamma)
    expect(gamma.getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(gamma, { key: 'End' })
    const delta = screen.getByRole('tab', { name: 'Delta' })
    expect(document.activeElement).toBe(delta)

    fireEvent.keyDown(delta, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(alpha)

    fireEvent.keyDown(alpha, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(delta)

    fireEvent.keyDown(delta, { key: 'Home' })
    expect(document.activeElement).toBe(alpha)
  })
})

describe('Tabs 溢出菜单键盘导航', () => {
  const overflowItems: TabItemType<string>[] = [
    { value: 'one', label: 'One' },
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana', disabled: true },
    { value: 'cherry', label: 'Cherry' },
    { value: 'avocado', label: 'Avocado' },
  ]

  async function openMenu() {
    const trigger = screen.getByRole('button', { name: /more/i })
    trigger.focus()
    fireEvent.click(trigger)
    const menu = await screen.findByRole('menu')
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true))
    return { trigger, menu }
  }

  it('打开后聚焦首个可用项，上下循环跳过禁用项，Home / End 与 typeahead', async () => {
    render(<Tabs items={ overflowItems } defaultActiveKey="one" maxVisibleTabs={ 1 } mode="none" />)

    const { trigger } = await openMenu()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    const item = (name: string) => screen.getByRole('menuitemradio', { name })
    expect(document.activeElement).toBe(item('Apple'))

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(item('Cherry'))

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(item('Apple'))

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(item('Avocado'))

    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(document.activeElement).toBe(item('Apple'))

    fireEvent.keyDown(document.activeElement!, { key: 'End' })
    expect(document.activeElement).toBe(item('Avocado'))

    fireEvent.keyDown(document.activeElement!, { key: 'c' })
    expect(document.activeElement).toBe(item('Cherry'))
  })

  it('Escape 关闭菜单并把焦点还给触发按钮', async () => {
    render(<Tabs items={ overflowItems } defaultActiveKey="one" maxVisibleTabs={ 1 } mode="none" />)

    const { trigger } = await openMenu()
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })

    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(trigger)
  })

  it('在菜单中选择项后切换激活标签', async () => {
    const onChange = vi.fn()
    render(<Tabs items={ overflowItems } defaultActiveKey="one" maxVisibleTabs={ 1 } onChange={ onChange } mode="none" />)

    await openMenu()
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Cherry' }))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'cherry' }))
    await waitFor(() => expect(screen.getByRole('button', { name: /more/i }).getAttribute('aria-expanded')).toBe('false'))
  })
})
