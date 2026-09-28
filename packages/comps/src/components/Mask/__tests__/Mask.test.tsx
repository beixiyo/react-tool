import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Mask } from '../index'

describe('Mask', () => {
  it('不把 aria-hidden 施加到包含交互内容的根节点', () => {
    const { container } = render(
      <Mask>
        <button>遮罩内容</button>
      </Mask>,
    )

    expect(screen.getByRole('button', { name: '遮罩内容' })).toBeTruthy()
    expect(container.firstElementChild?.getAttribute('aria-hidden')).not.toBe('true')
  })
})
