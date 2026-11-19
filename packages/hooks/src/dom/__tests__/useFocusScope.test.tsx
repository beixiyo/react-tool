import { act, fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UseFocusScopeOptions } from '../useFocusScope'
import { useFocusScope } from '../useFocusScope'

describe('useFocusScope', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('激活时聚焦首个可 Tab 元素，失活时归还焦点', () => {
    const { rerender } = render(<Harness active={ false } />)
    const opener = screen.getByTestId('opener')
    opener.focus()

    rerender(<Harness active />)
    act(() => vi.runAllTimers())
    expect(document.activeElement).toBe(screen.getByTestId('first'))

    rerender(<Harness active={ false } />)
    expect(document.activeElement).toBe(opener)
  })

  it('首次聚焦未生效时逐帧重试（模拟进入动画期间不可聚焦）', () => {
    const { rerender } = render(<Harness active={ false } />)
    const opener = screen.getByTestId('opener')
    opener.focus()

    const first = screen.getByTestId('first')
    const originalFocus = first.focus.bind(first)
    let blocked = 2
    first.focus = (options?: FocusOptions) => {
      if (blocked > 0) {
        blocked -= 1
        return
      }
      originalFocus(options)
    }

    rerender(<Harness active />)
    act(() => vi.advanceTimersToNextFrame())
    expect(document.activeElement).toBe(opener)

    act(() => vi.runAllTimers())
    expect(document.activeElement).toBe(first)
  })

  it('重试期间焦点被移走时不再抢回', () => {
    const { rerender } = render(<Harness active={ false } />)
    screen.getByTestId('opener').focus()

    const first = screen.getByTestId('first')
    first.focus = () => {}

    rerender(<Harness active />)
    act(() => vi.advanceTimersToNextFrame())

    const last = screen.getByTestId('last')
    last.focus()
    act(() => vi.runAllTimers())
    expect(document.activeElement).toBe(last)
  })

  it('trap 时 Tab 在范围内循环', () => {
    render(<Harness active trap />)
    act(() => vi.runAllTimers())

    const first = screen.getByTestId('first')
    const last = screen.getByTestId('last')

    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('未开启 trap 时不拦截 Tab', () => {
    render(<Harness active />)
    act(() => vi.runAllTimers())

    const last = screen.getByTestId('last')
    last.focus()
    const notPrevented = fireEvent.keyDown(last, { key: 'Tab' })
    expect(notPrevented).toBe(true)
  })

  it('restoreFocus 为 false 时不归还焦点', () => {
    const { rerender } = render(<Harness active={ false } restoreFocus={ false } />)
    screen.getByTestId('opener').focus()

    rerender(<Harness active restoreFocus={ false } />)
    act(() => vi.runAllTimers())
    rerender(<Harness active={ false } restoreFocus={ false } />)

    expect(document.activeElement).not.toBe(screen.getByTestId('opener'))
  })
})

function Harness(props: Omit<UseFocusScopeOptions, 'containerRef'>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { onKeyDown } = useFocusScope({ ...props, containerRef })

  return (
    <>
      <button data-testid="opener">opener</button>
      <div ref={ containerRef } tabIndex={ -1 } onKeyDown={ onKeyDown }>
        <button data-testid="first">first</button>
        <button data-testid="last">last</button>
      </div>
    </>
  )
}
