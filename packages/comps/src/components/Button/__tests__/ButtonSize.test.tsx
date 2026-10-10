import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '../Button'

/**
 * 尺寸收敛回归：Button 各档位类名与数字 size 的行内样式
 */
describe('Button size', () => {
  it.each([
    ['sm', ['px-3', 'py-1', 'text-xs']],
    ['md', ['px-4', 'py-2', 'text-sm']],
    ['lg', ['px-6', 'py-3', 'text-base']],
  ] as const)('%s 档保持内边距与字号类名', (size, classes) => {
    render(<Button size={ size }>文字</Button>)
    const cls = screen.getByRole('button').classList

    classes.forEach(c => expect(cls.contains(c)).toBe(true))
  })

  it.each([
    ['sm', 'h-8', 'w-8'],
    ['md', 'h-10', 'w-10'],
    ['lg', 'h-12', 'w-12'],
  ] as const)('%s 档纯图标按钮为 32 / 40 / 48', (size, h, w) => {
    render(<Button size={ size } iconOnly aria-label="icon" />)
    const cls = screen.getByRole('button').classList

    expect(cls.contains(h)).toBe(true)
    expect(cls.contains(w)).toBe(true)
  })

  it('数字 size：高度 = size，横向内边距与字号 = size * 0.4', () => {
    render(<Button size={ 50 }>文字</Button>)
    const { style } = screen.getByRole('button')

    expect(style.height).toBe('50px')
    expect(style.minHeight).toBe('50px')
    expect(style.paddingLeft).toBe('20px')
    expect(style.paddingRight).toBe('20px')
    expect(style.fontSize).toBe('20px')
  })

  it('数字 size 不应再带默认 md 档的类名（否则残留 py-2）', () => {
    render(<Button size={ 50 }>文字</Button>)
    const cls = screen.getByRole('button').classList

    expect(cls.contains('py-2')).toBe(false)
    expect(cls.contains('px-4')).toBe(false)
    expect(cls.contains('text-sm')).toBe(false)
  })
})
