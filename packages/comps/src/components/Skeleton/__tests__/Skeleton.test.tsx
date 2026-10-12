import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '../Skeleton'

const PRESET_SIZES = [
  { size: 'xs', height: 'h-3', width: 'w-16' },
  { size: 'sm', height: 'h-4', width: 'w-24' },
  { size: 'md', height: 'h-5', width: 'w-32' },
  { size: 'lg', height: 'h-6', width: 'w-48' },
  { size: 'xl', height: 'h-8', width: 'w-64' },
  { size: 'full', height: 'h-full', width: 'w-full' },
] as const

function getRoot(container: HTMLElement) {
  return container.firstElementChild as HTMLElement
}

describe('Skeleton 公共契约', () => {
  it('默认单行走 CSS 自适应默认（无行内尺寸与圆角干预），字号留给上下文继承', () => {
    const { container } = render(<Skeleton />)
    const root = getRoot(container)

    expect(root.tagName).toBe('DIV')
    expect(root.style.height).toBe('')
    expect(root.style.width).toBe('')
    expect(root.style.borderRadius).toBe('')
    expect(root.style.fontSize).toBe('')
    expect(root.children).toHaveLength(0)
    expect(root.getAttribute('aria-live')).toBe('polite')
    expect(root.getAttribute('aria-busy')).toBe('true')
  })

  it('className 工具类不被默认值覆盖：无行内样式干预，类名原样保留', () => {
    const { container } = render(<Skeleton className="h-4 w-12 rounded-lg" />)
    const root = getRoot(container)

    expect(root.style.height).toBe('')
    expect(root.style.width).toBe('')
    expect(root.style.borderRadius).toBe('')
    ;['h-4', 'w-12', 'rounded-lg'].forEach((name) => {
      expect(root.classList.contains(name)).toBe(true)
    })
  })

  it('圆角默认 auto 走 CSS（0.25em）；档位走类名、像素值走行内样式', () => {
    const { container, rerender } = render(<Skeleton />)
    const root = getRoot(container)
    expect(root.style.borderRadius).toBe('')
    expect(root.classList.contains('rounded-full')).toBe(false)

    rerender(<Skeleton rounded="full" />)
    const full = getRoot(container)
    expect(full.classList.contains('rounded-full')).toBe(true)
    expect(full.style.borderRadius).toBe('')

    rerender(<Skeleton rounded="none" />)
    expect(getRoot(container).classList.contains('rounded-none')).toBe(true)

    rerender(<Skeleton rounded={ 6 } />)
    expect(getRoot(container).style.borderRadius).toBe('6px')
    expect(getRoot(container).classList.contains('rounded-full')).toBe(false)
  })

  it.each(PRESET_SIZES)('size=$size 保留 $height $width，且无自适应行内尺寸覆盖', ({ size, height, width }) => {
    const { container } = render(<Skeleton size={ size } />)
    const root = getRoot(container)

    expect(root.classList.contains(height)).toBe(true)
    expect(root.classList.contains(width)).toBe(true)
    expect(root.style.height).toBe('')
    expect(root.style.width).toBe('')
  })

  it('数字 size 保留高度和四倍宽度，不混入默认档位', () => {
    const { container } = render(<Skeleton size={ 24 } />)
    const root = getRoot(container)

    expect(root.style.height).toBe('24px')
    expect(root.style.width).toBe('96px')
    expect(root.classList.contains('h-5')).toBe(false)
    expect(root.style.borderRadius).toBe('')
  })

  it('style 可显式覆盖自适应尺寸', () => {
    const { container } = render(<Skeleton style={ { height: 12, width: '75%' } } />)
    const root = getRoot(container)

    expect(root.style.height).toBe('12px')
    expect(root.style.width).toBe('75%')
  })

  it('count=3.5 产生四条行，末行是默认宽度的一半', () => {
    const { container } = render(<Skeleton count={ 3.5 } id="paragraph" />)
    const root = getRoot(container)
    const lines = Array.from(root.children) as HTMLElement[]

    expect(root.id).toBe('paragraph')
    expect(root.getAttribute('aria-busy')).toBe('true')
    expect(root.getAttribute('aria-live')).toBe('polite')
    expect(lines).toHaveLength(4)
    expect(lines.slice(0, 3).every((line) => line.style.width === '')).toBe(true)
    expect(lines[3].style.width).toBe('calc(50%)')
    expect(lines.every((line) => line.style.height === '')).toBe(true)
  })

  it.each([
    { props: { size: 24 }, expected: 'calc(48px)' },
    { props: { size: 'md' as const }, expected: 'calc(4rem)' },
    { props: { style: { width: '80%' } }, expected: 'calc(40%)' },
    { props: { style: { width: 120 } }, expected: 'calc(60px)' },
  ])('小数行相对于显式 size/style 宽度缩放：$expected', ({ props, expected }) => {
    const { container } = render(<Skeleton count={ 0.5 } { ...props } />)
    const lines = getRoot(container).children

    expect(lines).toHaveLength(1)
    expect((lines[0] as HTMLElement).style.width).toBe(expected)
  })

  it('多行 className/style 应用到每条行，children 按行重复', () => {
    const { container, getAllByText } = render(
      <Skeleton count={ 2 } className="opacity-50" style={ { height: 18 } }>内容</Skeleton>,
    )
    const lines = Array.from(getRoot(container).children) as HTMLElement[]

    expect(getAllByText('内容')).toHaveLength(2)
    expect(lines.every((line) => line.classList.contains('opacity-50') && line.style.height === '18px')).toBe(true)
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('count=%s 不渲染行或 children', (count) => {
    const { container, queryByText } = render(<Skeleton count={ count }>内容</Skeleton>)

    expect(getRoot(container).children).toHaveLength(0)
    expect(queryByText('内容')).toBeNull()
  })

  it('active=false 同时关闭扫光层及 busy 状态，重新启用可恢复', () => {
    const { container, rerender } = render(<Skeleton active={ false } />)
    const root = getRoot(container)

    // CSS 通过此 DOM 样式控制扫光层显示；单测不声称验证浏览器动画绘制
    expect(root.style.getPropertyValue('--skeleton-animation-display')).toBe('none')
    expect(root.getAttribute('aria-busy')).toBe('false')
    rerender(<Skeleton active />)
    expect(root.style.getPropertyValue('--skeleton-animation-display')).toBe('block')
    expect(root.getAttribute('aria-busy')).toBe('true')
  })

  it('颜色及动画时长传入扫光层使用的 CSS 变量，停用动画仍保留基础色', () => {
    const { container } = render(
      <Skeleton
        active={ false }
        baseColor="rgb(var(--systemBlue) / 0.15)"
        highlightColor="rgb(var(--systemBlue) / 0.4)"
        animationDuration={ 2 }
      />,
    )
    const root = getRoot(container)

    expect(root.style.getPropertyValue('--skeleton-base-color')).toBe('rgb(var(--systemBlue) / 0.15)')
    expect(root.style.getPropertyValue('--skeleton-highlight-color')).toBe('rgb(var(--systemBlue) / 0.4)')
    expect(root.style.getPropertyValue('--skeleton-animation-duration')).toBe('2s')
  })
})
