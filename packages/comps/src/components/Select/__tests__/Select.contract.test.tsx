import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectPattern, getAriaViolations } from '../../../__tests__/utils/ariaPatterns'
import { Select } from '../Select'
import type { Option } from '../types'

const fruitOptions: Option[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian', disabled: true },
]

const cascadeOptions: Option[] = [
  {
    value: 'fruit',
    label: 'Fruit',
    children: [
      { value: 'apple', label: 'Apple', disabled: true },
      { value: 'banana', label: 'Banana' },
    ],
  },
  { value: 'veg', label: 'Vegetable' },
]

function structuralViolations() {
  return getAriaViolations(document.body, 'combobox')
}

function activeOptionName(trigger: HTMLElement) {
  const id = trigger.getAttribute('aria-activedescendant')
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

describe('Select ARIA 契约：普通模式', () => {
  it('关闭态 combobox 有名称、aria-expanded=false，且不残留 aria-activedescendant / aria-controls', () => {
    render(<Select aria-label="Fruit" options={ fruitOptions } />)
    const trigger = screen.getByRole('combobox', { name: 'Fruit' })

    expectPattern(trigger, 'combobox')
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
  })

  it('打开态 combobox > listbox > option 结构与 aria-activedescendant 一致', () => {
    render(<Select aria-label="Fruit" options={ fruitOptions } defaultValue="cherry" />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(structuralViolations()).toEqual([])
    /** 打开时高亮落在已选项上，且选中态只在它身上 */
    expect(activeOptionName(trigger)).toBe('Cherry')
    expect(screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true')).toHaveLength(1)
  })

  it('Home / End 跳过首尾的禁用项', () => {
    const edges: Option[] = [{ value: 'x', label: 'X', disabled: true }, ...fruitOptions]
    render(<Select aria-label="Fruit" options={ edges } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })

    fireEvent.keyDown(trigger, { key: 'End' })
    expect(activeOptionName(trigger)).toBe('Cherry')
    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(activeOptionName(trigger)).toBe('Apple')
    expect(structuralViolations()).toEqual([])
  })

  it('Escape 关闭后焦点保留在 combobox，并清除 aria-activedescendant', () => {
    render(<Select aria-label="Fruit" options={ fruitOptions } />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('aria-activedescendant')).not.toBeNull()

    expect(dispatchEscape().defaultPrevented).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)

    /** 关闭后 Home / End 不会悄悄移动高亮，Escape 也不再被消费 */
    fireEvent.keyDown(trigger, { key: 'End' })
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)
    expect(dispatchEscape().defaultPrevented).toBe(false)
  })

  it('禁用的 combobox 不响应打开键', () => {
    render(<Select aria-label="Fruit" options={ fruitOptions } disabled />)
    const trigger = screen.getByRole('combobox')

    expect(trigger.getAttribute('aria-disabled')).toBe('true')
    expect(trigger.tabIndex).toBe(-1)
    for (const key of ['Enter', ' ', 'ArrowDown', 'a']) fireEvent.keyDown(trigger, { key })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('listbox 与触发器同名：aria-label 继承，label 时 aria-labelledby 指向标签', () => {
    const { unmount } = render(<Select aria-label="Fruit" options={ fruitOptions } />)
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
    expectPattern(document.body, 'combobox')
    expect(screen.getByRole('listbox', { name: 'Fruit' })).toBeTruthy()
    unmount()

    render(<Select label="水果" options={ fruitOptions } />)
    fireEvent.keyDown(screen.getByRole('combobox', { name: '水果' }), { key: 'Enter' })
    expect(screen.getByRole('listbox', { name: '水果' })).toBeTruthy()
  })
})

describe('Select ARIA 契约：搜索模式', () => {
  it('搜索过滤后 activedescendant 只指向仍在 listbox 中的可用项', () => {
    render(<Select aria-label="Fruit" searchable options={ fruitOptions } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })

    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'ch' } })
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Cherry'])

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(activeOptionName(trigger)).toBe('Cherry')
    expect(structuralViolations()).toEqual([])
  })

  it('无匹配结果时不残留指向已卸载 option 的 aria-activedescendant', () => {
    render(<Select aria-label="Fruit" searchable options={ fruitOptions } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(activeOptionName(trigger)).toBe('Apple')

    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'zzz' } })
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(getAriaViolations(document.body, 'combobox').filter((v) => v.startsWith('idref'))).toEqual([])
  })

  it('搜索框作为 combobox：输入后方向键 / Home / End 跳过禁用项，Enter 选中，Tab 不拦截', () => {
    render(<Select aria-label="Fruit" searchable options={ fruitOptions } />)
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Fruit' }), { key: 'Enter' })

    const search = screen.getByRole('combobox', { name: 'Search...' })
    const listbox = screen.getByRole('listbox')
    search.focus()
    expect(search.getAttribute('aria-expanded')).toBe('true')
    expect(search.getAttribute('aria-controls')).toBe(listbox.id)
    expect(activeOptionName(search)).toBe('Apple')

    fireEvent.keyDown(search, { key: 'End' })
    expect(activeOptionName(search)).toBe('Cherry')
    fireEvent.keyDown(search, { key: 'Home' })
    expect(activeOptionName(search)).toBe('Apple')
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    expect(activeOptionName(search)).toBe('Cherry')
    expectPattern(document.body, 'combobox')

    expect(fireEvent.keyDown(search, { key: 'Tab' })).toBe(true)

    fireEvent.change(search, { target: { value: 'ch' } })
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(screen.getByRole('combobox', { name: 'Fruit' }).textContent).toContain('Cherry')
  })

  it('搜索框内 Escape 关闭面板，焦点还给触发器', () => {
    render(<Select aria-label="Fruit" searchable options={ fruitOptions } />)
    const trigger = screen.getByRole('combobox', { name: 'Fruit' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    const search = screen.getByRole('combobox', { name: 'Search...' })
    search.focus()

    fireEvent.keyDown(search, { key: 'Escape' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('焦点已移出面板时关闭不抢焦点', () => {
    render(
      <>
        <Select aria-label="Fruit" searchable options={ fruitOptions } />
        <button type="button">outside</button>
      </>,
    )
    const trigger = screen.getByRole('combobox', { name: 'Fruit' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    const outside = screen.getByRole('button', { name: 'outside' })
    outside.focus()

    fireEvent.mouseDown(outside)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(outside)
  })
})

describe('Select 关闭面板的焦点隔离', () => {
  it('关闭时隔离搜索、footer 和自定义选项内容，重开后保留 footer 草稿并恢复交互', () => {
    render(
      <Select
        aria-label="Fruit"
        searchable
        options={ fruitOptions }
        renderOptionExtra={ (option) => <a href={ `#${option.value}` }>Details { option.value }</a> }
        renderDropdownFooter={ () => <input aria-label="Footer draft" defaultValue="初始内容" /> }
      />,
    )

    const trigger = screen.getByRole('combobox', { name: 'Fruit' })
    const search = screen.getByPlaceholderText('Search...')
    const footer = screen.getByLabelText('Footer draft') as HTMLInputElement
    const extra = screen.getByText('Details apple')
    const panelControls = [search, footer, extra]

    /** aria-hidden 不能阻止原生 Tab；整个关闭子树必须被 inert 隔离 */
    for (const control of panelControls) expect(control.closest('[inert]')).not.toBeNull()

    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    for (const control of panelControls) expect(control.closest('[inert]')).toBeNull()

    fireEvent.change(footer, { target: { value: '未提交的草稿' } })
    footer.focus()
    fireEvent.keyDown(footer, { key: 'Escape' })

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    for (const control of panelControls) {
      expect(document.body.contains(control)).toBe(true)
      expect(control.closest('[inert]')).not.toBeNull()
    }

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(screen.getByLabelText('Footer draft')).toBe(footer)
    expect(footer.value).toBe('未提交的草稿')
    for (const control of panelControls) expect(control.closest('[inert]')).toBeNull()
  })

  it('受控关闭时立即隔离级联各列中的自定义交互元素，打开请求未被接受时仍保持隔离', () => {
    const renderSelect = (open: boolean) => (
      <Select
        aria-label="Food"
        options={ cascadeOptions }
        open={ open }
        renderOptionExtra={ (option) => <button type="button">Details { option.value }</button> }
      />
    )
    const { rerender } = render(renderSelect(false))
    const trigger = screen.getByRole('combobox', { name: 'Food' })
    const rootExtra = screen.getByText('Details fruit')

    expect(rootExtra.closest('[inert]')).not.toBeNull()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(rootExtra.closest('[inert]')).not.toBeNull()

    rerender(renderSelect(true))
    expect(rootExtra.closest('[inert]')).toBeNull()
    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    const childExtra = screen.getByRole('button', { name: 'Details banana' })
    expect(childExtra.closest('[inert]')).toBeNull()

    rerender(renderSelect(false))
    expect(document.body.contains(rootExtra)).toBe(true)
    expect(document.body.contains(childExtra)).toBe(true)
    expect(rootExtra.closest('[inert]')).not.toBeNull()
    expect(childExtra.closest('[inert]')).not.toBeNull()
  })
})

describe('Select ARIA 契约：级联模式', () => {
  it('每一列都是 listbox，展开子列后 activedescendant 指向子列可用项', () => {
    render(<Select aria-label="Food" options={ cascadeOptions } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(activeOptionName(trigger)).toBe('Fruit')

    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    expect(screen.getAllByRole('listbox')).toHaveLength(2)
    /** 子列首项禁用，进入子列直接落在 Banana */
    expect(activeOptionName(trigger)).toBe('Banana')
    expect(structuralViolations()).toEqual([])

    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(activeOptionName(trigger)).toBe('Banana')

    fireEvent.keyDown(trigger, { key: 'ArrowLeft' })
    expect(activeOptionName(trigger)).toBe('Fruit')
    expect(structuralViolations()).toEqual([])
  })

  it('Escape 从子列直接关闭整个弹层，焦点留在 combobox', () => {
    render(<Select aria-label="Food" options={ cascadeOptions } />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'ArrowRight' })

    dispatchEscape()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryAllByRole('listbox')).toHaveLength(0)
    expect(document.activeElement).toBe(trigger)
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)
  })
})
