import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Button } from '../Button'
import { ButtonGroup } from '../ButtonGroup'

describe('ButtonGroup DOM 状态契约', () => {
  it('同步活动按钮到 aria-pressed 与 data-vv-selected', () => {
    render(<ButtonGroupHarness />)
    const first = screen.getByRole('button', { name: 'First' })
    const second = screen.getByRole('button', { name: 'Second' })

    expect(first.getAttribute('aria-pressed')).toBe('true')
    expect(first.dataset.vvSelected).toBe('true')
    expect(second.getAttribute('aria-pressed')).toBe('false')
    expect(second.dataset.vvSelected).toBe('false')

    fireEvent.click(second)

    expect(first.getAttribute('aria-pressed')).toBe('false')
    expect(first.dataset.vvSelected).toBe('false')
    expect(second.getAttribute('aria-pressed')).toBe('true')
    expect(second.dataset.vvSelected).toBe('true')
  })
})

function ButtonGroupHarness() {
  const [active, setActive] = useState('first')

  return (
    <ButtonGroup active={ active } onChange={ setActive }>
      <Button name="first">First</Button>
      <Button name="second">Second</Button>
    </ButtonGroup>
  )
}
