import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StackButton } from '../StackButton'

const items = [
  { id: 'a', icon: <span>A</span> },
  { id: 'b', icon: <span>B</span> },
  { id: 'c', icon: <span>C</span> },
]

/** 激活项使用默认 activeClassName（bg-button），其余为 bg-button2 */
function isActive(label: string) {
  return screen.getByText(label).closest('button')!.classList.contains('bg-button')
}

describe('StackButton 受控 / 非受控', () => {
  it('非受控：默认激活首项，点击切换并只在变化时通知', () => {
    const onActiveChange = vi.fn()
    render(<StackButton items={ items } onActiveChange={ onActiveChange } />)

    expect(isActive('A')).toBe(true)

    fireEvent.click(screen.getByText('B'))
    expect(isActive('B')).toBe(true)
    expect(isActive('A')).toBe(false)

    fireEvent.click(screen.getByText('B'))
    expect(onActiveChange.mock.calls).toEqual([['b']])
  })

  it('非受控：defaultActiveId 指定初始激活项', () => {
    render(<StackButton items={ items } defaultActiveId="c" />)
    expect(isActive('C')).toBe(true)
  })

  it('受控：只通知上层，激活项以 activeId 为准', () => {
    const onActiveChange = vi.fn()
    const { rerender } = render(<StackButton items={ items } activeId="a" onActiveChange={ onActiveChange } />)

    fireEvent.click(screen.getByText('C'))
    expect(onActiveChange.mock.calls).toEqual([['c']])
    expect(isActive('A')).toBe(true)

    rerender(<StackButton items={ items } activeId="c" onActiveChange={ onActiveChange } />)
    expect(isActive('C')).toBe(true)
  })
})
