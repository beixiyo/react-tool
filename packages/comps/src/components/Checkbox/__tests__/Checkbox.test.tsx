import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Checkbox } from '../Checkbox'

describe('Checkbox DOM 状态契约', () => {
  it('同步选中、半选和禁用状态到 ARIA 与 data 属性', () => {
    const { rerender } = render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')

    expect(checkbox.getAttribute('aria-checked')).toBe('false')
    expect(checkbox.getAttribute(DATA_ATTR.state)).toBe('unchecked')
    expect(checkbox.getAttribute(DATA_ATTR.disabled)).toBe('false')

    fireEvent.click(checkbox)
    expect(checkbox.getAttribute('aria-checked')).toBe('true')
    expect(checkbox.getAttribute(DATA_ATTR.state)).toBe('checked')

    rerender(<Checkbox indeterminate disabled />)
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed')
    expect(checkbox.getAttribute('aria-disabled')).toBe('true')
    expect(checkbox.getAttribute(DATA_ATTR.state)).toBe('indeterminate')
    expect(checkbox.getAttribute(DATA_ATTR.disabled)).toBe('true')
  })
})
