import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Switch } from '../index'
import { switchSizeConfig } from '../styles'

/**
 * 尺寸回归：cva 类名与 switchSizeConfig 的数值是同一份设计的两种表达，必须保持一致
 */
const TRACK = { sm: ['w-9', 'h-5'], md: ['w-11', 'h-6'], lg: ['w-14', 'h-7'] } as const
const THUMB = { sm: ['w-4', 'h-4'], md: ['w-5', 'h-5'], lg: ['w-6', 'h-6'] } as const

function getParts() {
  const input = screen.getByRole('switch')
  const track = input.nextElementSibling as HTMLElement
  const thumb = track.firstElementChild as HTMLElement
  return { track, thumb }
}

describe('Switch size', () => {
  it.each(['sm', 'md', 'lg'] as const)('%s 档：类名、选中位移与 switchSizeConfig 一致', (size) => {
    render(<Switch size={ size } defaultChecked />)
    const { track, thumb } = getParts()
    const cfg = switchSizeConfig[size]

    TRACK[size].forEach(c => expect(track.classList.contains(c)).toBe(true))
    THUMB[size].forEach(c => expect(thumb.classList.contains(c)).toBe(true))
    expect(thumb.style.transform).toBe(`translateX(${cfg.trackWidth - cfg.thumbWidth - cfg.thumbInset * 2}px)`)
  })

  it('size=null 按 md 渲染（不应丢失轨道与滑块尺寸类名）', () => {
    render(<Switch size={ null } />)
    const { track, thumb } = getParts()

    TRACK.md.forEach(c => expect(track.classList.contains(c)).toBe(true))
    THUMB.md.forEach(c => expect(thumb.classList.contains(c)).toBe(true))
  })
})
