import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Button } from '../Button'
import { ButtonGroup } from '../ButtonGroup'

describe('ButtonGroup DOM 状态契约', () => {
  it('同步活动按钮到 aria-pressed 与公共状态属性', () => {
    render(<ButtonGroupHarness />)
    const first = screen.getByRole('button', { name: 'First' })
    const second = screen.getByRole('button', { name: 'Second' })

    expect(first.getAttribute('aria-pressed')).toBe('true')
    expect(first.getAttribute(DATA_ATTR.selected)).toBe('true')
    expect(second.getAttribute('aria-pressed')).toBe('false')
    expect(second.getAttribute(DATA_ATTR.selected)).toBe('false')

    fireEvent.click(second)

    expect(first.getAttribute('aria-pressed')).toBe('false')
    expect(first.getAttribute(DATA_ATTR.selected)).toBe('false')
    expect(second.getAttribute('aria-pressed')).toBe('true')
    expect(second.getAttribute(DATA_ATTR.selected)).toBe('true')
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
