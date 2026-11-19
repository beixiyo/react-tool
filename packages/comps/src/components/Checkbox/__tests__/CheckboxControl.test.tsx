import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from '../Checkbox'

describe('Checkbox 受控 / 非受控', () => {
  it('非受控：每次切换只触发一次 onChange，并携带事件对象', () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={ onChange } />)
    const checkbox = screen.getByRole('checkbox')

    fireEvent.click(checkbox)
    expect(checkbox.getAttribute('aria-checked')).toBe('true')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBe(true)
    expect(onChange.mock.calls[0][1]).toBeTruthy()

    fireEvent.keyDown(checkbox, { key: ' ' })
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([true, false])
  })

  it('受控：只通知上层，选中态以 checked 为准', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Checkbox checked={ false } onChange={ onChange } />)
    const checkbox = screen.getByRole('checkbox')

    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBe(true)
    expect(checkbox.getAttribute('aria-checked')).toBe('false')

    rerender(<Checkbox checked onChange={ onChange } />)
    expect(checkbox.getAttribute('aria-checked')).toBe('true')
  })
})
