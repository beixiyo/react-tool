import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from '../index'

describe('Switch 受控 / 非受控', () => {
  it('非受控：每次切换只触发一次 onChange，并携带事件对象', () => {
    const onChange = vi.fn()
    render(<Switch onChange={ onChange } />)
    const input = screen.getByRole('switch') as HTMLInputElement

    fireEvent.click(input)
    expect(input.checked).toBe(true)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBe(true)
    expect(onChange.mock.calls[0][1]).toHaveProperty('target', input)
  })

  it('受控：只通知上层，选中态以 checked 为准', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Switch checked={ false } onChange={ onChange } />)
    const input = screen.getByRole('switch') as HTMLInputElement

    fireEvent.click(input)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBe(true)
    expect(input.checked).toBe(false)

    rerender(<Switch checked onChange={ onChange } />)
    expect(input.checked).toBe(true)
  })
})
