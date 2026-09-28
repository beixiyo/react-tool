import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Switch } from '../index'

describe('Switch state DOM contract', () => {
  it('keeps the semantic switch state and CSS state marker in sync', () => {
    render(<Switch defaultChecked={ false } />)

    const switchInput = screen.getByRole('switch')
    const root = switchInput.closest(`[${DATA_ATTR.state}]`)

    expect(switchInput.getAttribute('aria-checked')).toBe('false')
    expect(root?.getAttribute(DATA_ATTR.state)).toBe('unchecked')
    expect(root?.getAttribute(DATA_ATTR.disabled)).toBe('false')
    expect(root?.getAttribute(DATA_ATTR.invalid)).toBe('false')

    fireEvent.click(switchInput)

    expect(switchInput.getAttribute('aria-checked')).toBe('true')
    expect(root?.getAttribute(DATA_ATTR.state)).toBe('checked')
  })

  it('exposes disabled and invalid states on the public root', () => {
    render(<Switch disabled error errorMessage="Invalid value" />)

    const switchInput = screen.getByRole('switch')
    const root = switchInput.closest(`[${DATA_ATTR.state}]`)

    expect(switchInput.hasAttribute('disabled')).toBe(true)
    expect(root?.getAttribute(DATA_ATTR.disabled)).toBe('true')
    expect(root?.getAttribute(DATA_ATTR.invalid)).toBe('true')
    expect(switchInput.getAttribute('aria-invalid')).toBe('true')
  })
})
