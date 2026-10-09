import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
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
    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('closed')
    expect(trigger.getAttribute(DATA_ATTR.selected)).toBe('true')

    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('open')
    expect(screen.getByRole('option', { name: 'First' }).getAttribute(DATA_ATTR.selected)).toBe('true')
    expect(screen.getByRole('option', { name: 'First' }).getAttribute(DATA_ATTR.highlighted)).toBe('true')
    expect(screen.getByRole('option', { name: 'Disabled' }).getAttribute(DATA_ATTR.disabled)).toBe('true')
  })

  it('打开时高亮落在已选项而非首项', () => {
    render(
      <Select
        options={ [
          { value: 'first', label: 'First' },
          { value: 'second', label: 'Second' },
        ] }
        defaultValue="second"
      />,
    )

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })

    expect(screen.getByRole('option', { name: 'First' }).getAttribute(DATA_ATTR.highlighted)).toBe('false')
    expect(screen.getByRole('option', { name: 'Second' }).getAttribute(DATA_ATTR.highlighted)).toBe('true')
  })
})
