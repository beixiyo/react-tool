import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkeletonCard } from '../subcomponents/SkeletonCard'

function getLines(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('[aria-busy]'))
}

describe('SkeletonCard 尺寸兼容', () => {
  it('自适应默认值不改变标题、内容行及标签的原有宽高', () => {
    const { container } = render(<SkeletonCard />)
    const lines = getLines(container)
    const expectedClasses = [
      ['h-5', 'w-3/4'],
      ['h-3', 'w-full'],
      ['h-3', 'w-5/6'],
      ['h-3', 'w-4/6'],
      ['h-5', 'w-16', 'rounded-full'],
      ['h-5', 'w-20', 'rounded-full'],
    ]

    expect(lines).toHaveLength(expectedClasses.length)
    lines.forEach((line, index) => {
      expectedClasses[index].forEach((className) => expect(line.classList.contains(className)).toBe(true))
      expect(line.style.height).toBe('')
      expect(line.style.width).toBe('')
    })
  })

  it('titleWidth 类名 API 及长段落的回退宽度仍可用', () => {
    const { container } = render(<SkeletonCard titleWidth="w-2/3" contentLines={ 6 } tagCount={ 0 } />)
    const lines = getLines(container)

    expect(lines).toHaveLength(7)
    expect(lines[0].classList.contains('w-2/3')).toBe(true)
    expect(lines[0].classList.contains('w-32')).toBe(false)
    expect(lines[4].classList.contains('w-3/5')).toBe(true)
    expect(lines[5].classList.contains('w-2/3')).toBe(true)
    expect(lines[6].classList.contains('w-1/2')).toBe(true)
  })
})
