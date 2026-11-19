import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Radio } from '../Radio'

describe('Radio 受控 / 非受控', () => {
  it('非受控：点击后选中，onChange 携带事件对象', () => {
    const onChange = vi.fn()
    render(<Radio label="A" onChange={ onChange } />)
    const radio = screen.getByRole('radio') as HTMLInputElement

    fireEvent.click(radio)

    expect(radio.checked).toBe(true)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBe(true)
    expect(onChange.mock.calls[0][1]).toHaveProperty('target', radio)
  })

  it('受控：点击只通知上层，选中态以 checked 为准', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Radio label="A" checked={ false } onChange={ onChange } />)
    const radio = screen.getByRole('radio') as HTMLInputElement

    fireEvent.click(radio)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(radio.checked).toBe(false)

    rerender(<Radio label="A" checked onChange={ onChange } />)
    expect(radio.checked).toBe(true)
  })
})
