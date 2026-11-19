import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LiquidGlassButton } from '../subcomponents/LiquidGlassButton'

function getRootClass(size?: 'sm' | 'md' | 'lg') {
  const { container, unmount } = render(<LiquidGlassButton size={ size }>btn</LiquidGlassButton>)
  const className = (container.firstElementChild as HTMLElement).className
  unmount()
  return className
}

describe('LiquidGlassButton size', () => {
  it('md 为默认档', () => {
    const md = getRootClass('md')
    expect(getRootClass()).toBe(md)
    expect(md).toContain('px-10 py-6')
  })

  it('style 透传到根元素', () => {
    const { container } = render(<LiquidGlassButton style={ { width: 120 } }>btn</LiquidGlassButton>)
    expect((container.firstElementChild as HTMLElement).style.width).toBe('120px')
  })
})
