import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Switch } from '../index'

describe('Switch state DOM contract', () => {
  it('keeps the semantic switch state and CSS state marker in sync', () => {
    render(<Switch defaultChecked={ false } />)

    const switchInput = screen.getByRole('switch')
    const root = switchInput.closest('[data-state]')

    expect(switchInput.getAttribute('aria-checked')).toBe('false')
    expect(root?.getAttribute('data-state')).toBe('unchecked')
    expect(root?.getAttribute('data-disabled')).toBe('false')
    expect(root?.getAttribute('data-invalid')).toBe('false')

    fireEvent.click(switchInput)

    expect(switchInput.getAttribute('aria-checked')).toBe('true')
    expect(root?.getAttribute('data-state')).toBe('checked')
  })

  it('exposes disabled and invalid states on the public root', () => {
    render(<Switch disabled error errorMessage="Invalid value" />)

    const switchInput = screen.getByRole('switch')
    const root = switchInput.closest('[data-state]')

    expect(switchInput.hasAttribute('disabled')).toBe(true)
    expect(root?.getAttribute('data-disabled')).toBe('true')
    expect(root?.getAttribute('data-invalid')).toBe('true')
    expect(switchInput.getAttribute('aria-invalid')).toBe('true')
  })
})
