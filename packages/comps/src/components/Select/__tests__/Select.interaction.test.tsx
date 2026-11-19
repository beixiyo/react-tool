import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Form } from '../../Form'
import { Select } from '../Select'
import type { Option } from '../types'

const fruitOptions: Option[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'avocado', label: 'Avocado', disabled: true },
  { value: 'apricot', label: 'Apricot' },
  {
    value: 'banana',
    label: (
      <span>
        <b>Ba</b>nana
      </span>
    ),
  },
  { value: 'cherry', label: 'Cherry' },
]

const cascadeOptions: Option[] = [
  {
    value: 'fruit',
    label: 'Fruit',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ],
  },
  {
    value: 'veg',
    label: 'Vegetable',
    children: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'potato', label: 'Potato' },
    ],
  },
]

function activeOptionName(trigger: HTMLElement) {
  const id = trigger.getAttribute('aria-activedescendant')
  return id
    ? document.getElementById(id)?.textContent
    : null
}

describe('Select 点击外部', () => {
  it('关闭状态下点击外部不触发 onClickOutside 与表单 blur 校验', () => {
    const onClickOutside = vi.fn()
    const validator = vi.fn(() => 'Required')

    render(
      <Form validators={ { fruit: validator } }>
        <Select name="fruit" options={ fruitOptions } onClickOutside={ onClickOutside } />
      </Form>,
    )

    fireEvent.mouseDown(document.body)
    fireEvent.mouseDown(document.body)

    expect(onClickOutside).not.toHaveBeenCalled()
    expect(validator).not.toHaveBeenCalled()
    expect(screen.queryByText('Required')).toBeNull()
  })

  it('打开后点击外部关闭，onClickOutside 与 blur 校验各触发一次', () => {
    const onClickOutside = vi.fn()
    const validator = vi.fn(() => 'Required')

    render(
      <Form validators={ { fruit: validator } }>
        <Select name="fruit" options={ fruitOptions } onClickOutside={ onClickOutside } />
      </Form>,
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    fireEvent.mouseDown(document.body)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(onClickOutside).toHaveBeenCalledTimes(1)
    expect(validator).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Required')).toBeTruthy()

    /** 关闭后监听解除，再次点击外部不再触发 */
    fireEvent.mouseDown(document.body)
    expect(onClickOutside).toHaveBeenCalledTimes(1)
    expect(validator).toHaveBeenCalledTimes(1)
  })
})

describe('Select 打开状态受控', () => {
  it('defaultOpen 初始打开，onOpenChange 在非受控模式也会触发', () => {
    const onOpenChange = vi.fn()
    render(<Select options={ fruitOptions } defaultOpen onOpenChange={ onOpenChange } />)

    const trigger = screen.getByRole('combobox')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    fireEvent.mouseDown(document.body)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('受控 open 只通过 onOpenChange 请求变更', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(<Select options={ fruitOptions } open={ false } onOpenChange={ onOpenChange } />)

    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    rerender(<Select options={ fruitOptions } open onOpenChange={ onOpenChange } />)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(activeOptionName(trigger)).toBe('Apple')
  })
})

describe('Select typeahead', () => {
  it('聚焦未打开时输入字符会打开并高亮匹配项，跳过 disabled', () => {
    render(<Select options={ fruitOptions } />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()

    fireEvent.keyDown(trigger, { key: 'c' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(activeOptionName(trigger)).toBe('Cherry')
  })

  it('打开后重复同一字母在匹配项间轮换，JSX label 按可读文本匹配', () => {
    vi.useFakeTimers()
    try {
      render(<Select options={ fruitOptions } />)
      const trigger = screen.getByRole('combobox')
      fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(activeOptionName(trigger)).toBe('Apple')

      /** Avocado 禁用，下一个 a 开头的是 Apricot，再按一次回到 Apple */
      fireEvent.keyDown(trigger, { key: 'a' })
      expect(activeOptionName(trigger)).toBe('Apricot')
      fireEvent.keyDown(trigger, { key: 'a' })
      expect(activeOptionName(trigger)).toBe('Apple')

      act(() => {
        vi.advanceTimersByTime(600)
      })
      fireEvent.keyDown(trigger, { key: 'b' })
      expect(activeOptionName(trigger)).toBe('Banana')
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('searchable 模式不启用 typeahead', () => {
    render(<Select options={ fruitOptions } searchable />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'c' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('级联模式在当前列 typeahead', () => {
    render(<Select options={ cascadeOptions } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(activeOptionName(trigger)).toBe('Fruit')

    fireEvent.keyDown(trigger, { key: 'v' })
    expect(activeOptionName(trigger)).toBe('Vegetable')

    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    expect(activeOptionName(trigger)).toBe('Carrot')
    fireEvent.keyDown(trigger, { key: 'p' })
    expect(activeOptionName(trigger)).toBe('Potato')
  })
})

describe('Select 键盘', () => {
  it('列表到头时停住不循环', () => {
    render(<Select options={ fruitOptions } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(activeOptionName(trigger)).toBe('Cherry')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(activeOptionName(trigger)).toBe('Cherry')

    fireEvent.keyDown(trigger, { key: 'Home' })
    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(activeOptionName(trigger)).toBe('Apple')
  })

  it('打开期间 options 变短或高亮项变 disabled 时，高亮归一到可用项', () => {
    const list: Option[] = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ]
    const { rerender } = render(<Select options={ list } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'End' })
    expect(activeOptionName(trigger)).toBe('Cherry')

    /** 变短：原下标越界 */
    rerender(<Select options={ list.slice(0, 2) } />)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(activeOptionName(trigger)).toBe('Apple')

    /** 高亮项变 disabled：回退到首个可用项，键盘从归一后的位置继续 */
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(activeOptionName(trigger)).toBe('Banana')
    rerender(<Select options={ [list[0]!, { ...list[1]!, disabled: true }, list[2]!] } />)
    expect(activeOptionName(trigger)).toBe('Apple')
    expect(document.querySelector(`[${DATA_ATTR.highlighted}="true"]`)?.textContent).toBe('Apple')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(activeOptionName(trigger)).toBe('Cherry')
  })

  it('父组件内联传入 options 重渲染时保留级联展开状态', () => {
    function Host() {
      const [count, setCount] = useState(0)
      return (
        <>
          <button type="button" onClick={ () => setCount(count + 1) }>rerender</button>
          <Select options={ cascadeOptions.map((option) => ({ ...option })) } />
        </>
      )
    }

    render(<Host />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    expect(screen.getAllByRole('listbox')).toHaveLength(2)
    expect(activeOptionName(trigger)).toBe('Apple')

    fireEvent.click(screen.getByText('rerender'))
    expect(screen.getAllByRole('listbox')).toHaveLength(2)
    expect(activeOptionName(trigger)).toBe('Apple')
  })
})
