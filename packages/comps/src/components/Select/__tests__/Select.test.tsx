import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Select } from '../Select'
import type { Option } from '../types'

const options: Option[] = [
  { value: 'email', label: 'Email' },
]

describe('select', () => {
  it('默认 trigger hover 时显示清除按钮并清空单选值', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()

    render(
      <Select
        options={ options }
        defaultValue="email"
        clearable
        onChange={ onChange }
        onClear={ onClear }
      />,
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.mouseEnter(trigger.firstElementChild!)
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))

    expect(onChange.mock.calls[0]?.[0]).toBe('')
    expect(onClear).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()
  })

  it('键盘导航只经过 enabled option，并同步 listbox ARIA 状态', () => {
    const onChange = vi.fn()
    const selectOptions: Option[] = [
      { value: 'disabled-start', label: 'Disabled start', disabled: true },
      { value: 'first', label: 'First' },
      { value: 'disabled-middle', label: 'Disabled middle', disabled: true },
      { value: 'last', label: 'Last' },
      { value: 'disabled-end', label: 'Disabled end', disabled: true },
    ]

    render(<Select options={ selectOptions } onChange={ onChange } />)

    const trigger = screen.getByRole('combobox')
    expect(screen.queryByRole('listbox')).toBeNull()
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })

    const listbox = screen.getByRole('listbox')
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id)
    expect(document.activeElement).toBe(trigger)
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'First' }).id)
    expect(screen.getByRole('option', { name: 'First' }).getAttribute('aria-selected')).toBe('false')
    expect(screen.getByRole('option', { name: 'Disabled start' }).getAttribute('aria-disabled')).toBe('true')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Last' }).id)

    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'First' }).id)

    fireEvent.keyDown(trigger, { key: 'End' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Last' }).id)

    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'First' }).id)

    fireEvent.click(screen.getByRole('option', { name: 'Disabled start' }))
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.keyDown(trigger, { key: 'End' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange.mock.calls[0]?.[0]).toBe('last')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('级联菜单进入子层时跳过 disabled option', () => {
    const onChange = vi.fn()
    const selectOptions: Option[] = [
      { value: 'disabled-root', label: 'Disabled root', disabled: true },
      {
        value: 'group',
        label: 'Group',
        children: [
          { value: 'disabled-child', label: 'Disabled child', disabled: true },
          { value: 'leaf', label: 'Leaf' },
        ],
      },
      { value: 'last', label: 'Last' },
    ]

    render(<Select options={ selectOptions } onChange={ onChange } />)

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Group' }).id)

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(screen.getAllByRole('listbox')).toHaveLength(2)
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Leaf' }).id)
    expect(screen.getByRole('option', { name: 'Disabled child' }).getAttribute('aria-disabled')).toBe('true')

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange.mock.calls[0]?.[0]).toBe('leaf')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('Escape 只在打开且可用时由全局键盘层消费', () => {
    const selectOptions: Option[] = [{ value: 'first', label: 'First' }]
    const { rerender } = render(<Select options={ selectOptions } />)

    const closedEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(closedEvent)
    expect(closedEvent.defaultPrevented).toBe(false)

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })

    const openEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    act(() => document.dispatchEvent(openEvent))
    expect(openEvent.defaultPrevented).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    rerender(<Select options={ selectOptions } disabled />)
    const disabledEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(disabledEvent)
    expect(disabledEvent.defaultPrevented).toBe(false)
  })

  it('editable input 的 Escape 仍回退已提交值', () => {
    render(
      <Select
        options={ options }
        defaultValue="email"
        editable
      />,
    )

    const trigger = screen.getByRole('combobox')
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'custom' } })
    expect(input.value).toBe('custom')

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('email')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})
