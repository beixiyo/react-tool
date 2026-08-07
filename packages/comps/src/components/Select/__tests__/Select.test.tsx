import type { Option } from '../types'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Select } from '../Select'

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
})
