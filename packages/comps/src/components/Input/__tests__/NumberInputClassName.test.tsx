import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NumberInput } from '../subcomponents/NumberInput'

describe('NumberInput className', () => {
  it('className 作用于 input 元素，与 Input 组件一致', () => {
    render(<NumberInput className="custom-input" defaultValue={ 1 } />)
    expect(screen.getByRole('textbox').classList.contains('custom-input')).toBe(true)
  })
})
