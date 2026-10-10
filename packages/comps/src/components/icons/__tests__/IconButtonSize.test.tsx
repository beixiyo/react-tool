import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CloseBtn } from '../../CloseBtn'

/**
 * 默认外框尺寸回归：不传 size 时，各 mode 的外框都是 md（24px = size-6）
 * 此前代码读取未归一的 props.mode，意图（absolute → sm）从未生效，实际一直是 md
 */
describe('IconButton 默认 size', () => {
  it.each(['absolute', 'fixed', 'static'] as const)('mode=%s 不传 size 时外框为 24px（含显式 absolute）', (mode) => {
    render(<CloseBtn mode={ mode } aria-label="close" />)
    expect(screen.getByRole('button').classList.contains('size-6')).toBe(true)
  })

  it('不传 mode 与 size 时外框为 24px', () => {
    render(<CloseBtn aria-label="close" />)
    expect(screen.getByRole('button').classList.contains('size-6')).toBe(true)
  })

  it('显式传 size 时按档位生效', () => {
    render(<CloseBtn size="sm" aria-label="close" />)
    expect(screen.getByRole('button').classList.contains('size-4')).toBe(true)
  })
})
