import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Select } from '../Select'

describe('Select DOM 状态契约', () => {
  it('同步 trigger 与 option 的公共状态属性', () => {
    render(
      <Select
        options={ [
          { value: 'first', label: 'First' },
          { value: 'disabled', label: 'Disabled', disabled: true },
        ] }
        defaultValue="first"
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger.getAttribute('data-vv-state')).toBe('closed')
    expect(trigger.getAttribute('data-vv-selected')).toBe('true')

    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(trigger.getAttribute('data-vv-state')).toBe('open')
    expect(screen.getByRole('option', { name: 'First' }).getAttribute('data-vv-selected')).toBe('true')
    expect(screen.getByRole('option', { name: 'First' }).getAttribute('data-vv-highlighted')).toBe('true')
    expect(screen.getByRole('option', { name: 'Disabled' }).getAttribute('data-vv-disabled')).toBe('true')
  })
})
