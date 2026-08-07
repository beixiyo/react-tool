import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tooltip } from '..'
import { DATA_FLOATING_ARROW } from '../../FloatingArrow'

const floatingArrowSelector = `[${DATA_FLOATING_ARROW}]`

describe('tooltip', () => {
  it('renders one tooltip with the configured arrow', () => {
    render(
      <Tooltip
        visible
        content="提示内容"
        arrow={ { size: 16 } }
      >
        <button type="button">触发器</button>
      </Tooltip>,
    )

    expect(screen.getAllByText('提示内容')).toHaveLength(1)
    expect(document.querySelectorAll(floatingArrowSelector)).toHaveLength(1)
    expect(document.querySelector(floatingArrowSelector)?.getAttribute('width')).toBe('16')
  })

  it('does not render an arrow when disabled', () => {
    render(
      <Tooltip visible content="无箭头" arrow={ false }>
        <button type="button">触发器</button>
      </Tooltip>,
    )

    expect(screen.getByText('无箭头')).toBeTruthy()
    expect(document.querySelector(floatingArrowSelector)).toBeNull()
  })
})
