import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '../Input'
import { NumberInput } from '../subcomponents/NumberInput'

/**
 * 尺寸收敛回归：Input / NumberInput 各档位渲染出的高度、字号、步进图标必须与收敛前一致
 */

const STRING_SIZES = [
  { size: 'sm', height: 'h-8', text: 'text-sm', stepper: '14' },
  { size: 'md', height: 'h-10', text: 'text-base', stepper: '16' },
  { size: 'lg', height: 'h-12', text: 'text-lg', stepper: '18' },
] as const

/** 找到承载尺寸类名 / 行内尺寸的容器 */
function findSizeHost(root: HTMLElement, matcher: (el: HTMLElement) => boolean) {
  return Array.from(root.querySelectorAll<HTMLElement>('*')).find(matcher)
}

describe('Input / NumberInput 尺寸映射', () => {
  it.each(STRING_SIZES)('Input $size 保持 $height + $text', ({ size, height, text }) => {
    const { container } = render(<Input size={ size } />)
    const host = findSizeHost(container, el => el.classList.contains(height))

    expect(host).toBeDefined()
    expect(host!.classList.contains(text)).toBe(true)
  })

  it.each(STRING_SIZES)('NumberInput $size 保持高度、字号与步进图标 $stepper', ({ size, height, text, stepper }) => {
    const { container } = render(<NumberInput size={ size } />)
    const host = findSizeHost(container, el => el.classList.contains(height))

    expect(host).toBeDefined()
    expect(host!.classList.contains(text)).toBe(true)
    expect(container.querySelector('svg.lucide-chevron-up')?.getAttribute('width')).toBe(stepper)
    expect(container.querySelector('svg.lucide-chevron-down')?.getAttribute('width')).toBe(stepper)
  })

  it('Input 数字 size：高度 = size，字号 = size * 0.4', () => {
    const { container } = render(<Input size={ 50 } />)
    const host = findSizeHost(container, el => el.style.height === '50px')

    expect(host?.style.fontSize).toBe('20px')
  })

  it('NumberInput 数字 size：高度 = size，字号与步进图标 = round(size * 0.4)', () => {
    const { container } = render(<NumberInput size={ 48 } />)
    const host = findSizeHost(container, el => el.style.height === '48px')

    expect(host?.style.fontSize).toBe('19.200000000000003px')
    expect(container.querySelector('svg.lucide-chevron-up')?.getAttribute('width')).toBe('19')
  })

  it('Input 带 label 时 label 字号跟随档位 / 数字', () => {
    const { getByText, rerender } = render(<Input size="lg" label="名称" />)
    expect(getByText('名称').classList.contains('text-lg')).toBe(true)

    rerender(<Input size={ 30 } label="名称" />)
    expect(getByText('名称').style.fontSize).toBe('12px')
  })
})
