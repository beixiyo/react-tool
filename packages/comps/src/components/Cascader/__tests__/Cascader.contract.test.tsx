import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectPattern, getAriaViolations } from '../../../__tests__/utils/ariaPatterns'
import { Cascader } from '../Cascader'
import type { CascaderOption } from '../types'

const options: CascaderOption[] = [
  { value: 'disabled-root', label: 'Disabled root', disabled: true },
  {
    value: 'fruit',
    label: 'Fruit',
    children: [
      { value: 'apple', label: 'Apple', disabled: true },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ],
  },
  { value: 'veg', label: 'Vegetable' },
  { value: 'disabled-end', label: 'Disabled end', disabled: true },
]

function structuralViolations() {
  return getAriaViolations(document.body, 'combobox')
}

function activeOptionName(el: HTMLElement) {
  const id = el.getAttribute('aria-activedescendant')
  return id
    ? document.getElementById(id)?.textContent
    : null
}

function dispatchEscape() {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  act(() => {
    document.dispatchEvent(event)
  })
  return event
}

async function openSearchForSelection(onChange?: (value: string) => void) {
  render(
    <>
      <Cascader
        aria-label="鱼类"
        searchable
        options={ [{ value: 'fish', label: '鱼', children: [{ value: 'goldfish', label: '金鱼' }] }] }
        onChange={ onChange }
      />
      <button type="button">outside</button>
    </>,
  )
  const trigger = screen.getByRole('combobox', { name: '鱼类' })
  trigger.focus()
  fireEvent.click(trigger)
  const input = await screen.findByPlaceholderText('Search...')
  await waitFor(() => expect(document.activeElement).toBe(input))
  fireEvent.change(input, { target: { value: '金' } })
  return { trigger, input }
}

describe('Cascader ARIA 契约', () => {
  it('打开后 combobox > listbox > option 结构成立，展开子列后仍成立', async () => {
    render(<Cascader aria-label="食物" options={ options } />)
    const trigger = screen.getByRole('combobox')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)

    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await screen.findByRole('option', { name: 'Fruit' })
    expect(structuralViolations()).toEqual([])

    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    await screen.findByRole('option', { name: 'Banana' })
    expect(activeOptionName(trigger)).toBe('Banana')
    expect(structuralViolations()).toEqual([])
  })

  it('首列 Home / End 跳过首尾禁用项', async () => {
    render(<Cascader aria-label="食物" options={ options } />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await screen.findByRole('option', { name: 'Fruit' })

    fireEvent.keyDown(trigger, { key: 'End' })
    expect(activeOptionName(trigger)).toBe('Vegetable')
    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(activeOptionName(trigger)).toBe('Fruit')
  })

  it('Escape 关闭后焦点在触发器上，aria-activedescendant 清除，后续方向键不移动高亮', async () => {
    render(<Cascader aria-label="食物" options={ options } />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await screen.findByRole('option', { name: 'Fruit' })
    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    await screen.findByRole('option', { name: 'Banana' })

    expect(dispatchEscape().defaultPrevented).toBe(true)
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(trigger)
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)
    expect(trigger.hasAttribute('aria-controls')).toBe(false)

    fireEvent.keyDown(trigger, { key: 'End' })
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)
    expect(dispatchEscape().defaultPrevented).toBe(false)
  })

  it('搜索模式：搜索框作为输入，aria-controls 指向搜索结果 listbox，Escape 后焦点回到触发器', async () => {
    render(<Cascader aria-label="食物" searchable options={ options } />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.click(trigger)

    const input = await screen.findByPlaceholderText('Search...')
    await waitFor(() => expect(document.activeElement).toBe(input))
    const results = screen.getByRole('listbox', { name: 'Search results' })
    expect(input.getAttribute('aria-controls')).toBe(results.id)
    expectPattern(results, 'listbox')

    /** 搜索结果里同样跳过禁用项 */
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const active = document.getElementById(input.getAttribute('aria-activedescendant') ?? '')
    expect(active?.getAttribute('aria-disabled')).not.toBe('true')
    expect(results.contains(active)).toBe(true)

    dispatchEscape()
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(trigger)
  })

  it('搜索后按方向键和 Enter 选中金鱼，面板卸载前归还焦点并保持键盘操作连续', async () => {
    const selectedValues: string[] = []
    const { trigger, input } = await openSearchForSelection((value) => {
      selectedValues.push(value)
    })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(selectedValues).toEqual(['goldfish'])
    expect(trigger.textContent).toContain('金鱼')
    expect(input.closest('[inert]')).not.toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)
    await waitFor(() => expect(document.body.contains(input)).toBe(false))

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('鼠标选中前搜索输入已失焦到 BODY 时，选中后仍归还触发器', async () => {
    const { trigger, input } = await openSearchForSelection()
    /** 模拟鼠标点击不可聚焦选项时先失焦的原生事件顺序 */
    act(() => input.blur())
    expect(document.activeElement).toBe(document.body)
    fireEvent.click(screen.getByRole('option', { name: /金鱼/ }))

    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(trigger)
  })

  it('选中回调主动聚焦外部按钮时，关闭面板不抢回焦点', async () => {
    const { trigger, input } = await openSearchForSelection(() => {
      screen.getByRole('button', { name: 'outside' }).focus()
    })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'outside' }))
  })

  it('禁用时不可 Tab 聚焦，按键不打开', () => {
    render(<Cascader disabled options={ options } />)
    const trigger = screen.getByRole('combobox')

    expect(trigger.getAttribute('aria-disabled')).toBe('true')
    expect(trigger.tabIndex).toBe(-1)
    for (const key of ['Enter', ' ', 'ArrowDown']) fireEvent.keyDown(trigger, { key })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('aria-label / aria-labelledby 作为 combobox 的可访问名，可编辑模式的输入框同名', () => {
    const { unmount } = render(<Cascader aria-label="选择食物" options={ options } />)
    expectPattern(screen.getByRole('combobox', { name: '选择食物' }), 'combobox')
    unmount()

    render(
      <>
        <span id="food-label">食物</span>
        <Cascader editable aria-labelledby="food-label" options={ options } />
      </>,
    )
    expect(screen.getByRole('combobox', { name: '食物' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: '食物' })).toBeTruthy()
  })
})
