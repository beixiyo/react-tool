import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import type { UseDragPositionOptions } from '../types'
import { useDragPosition } from '../useDragPosition'

/**
 * jsdom 未实现 PointerEvent 构造器，fireEvent.pointer* 会丢失 clientX/button，
 * 这里用 MouseEvent 派发 pointer* 类型事件：类型字符串命中监听器，坐标真实可读；
 * 包一层 act 保证 React 状态与 effect 在断言前 flush
 */
function firePointer(target: Element | Window, type: string, init: { clientX?: number; clientY?: number } = {}) {
  act(() => {
    target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, ...init }),
    )
  })
}

describe('useDragPosition', () => {
  it('按下并移动超过阈值后，位置按指针位移更新', () => {
    render(<DragProbe />)

    firePointer(screen.getByTestId('handle'), 'pointerdown', { clientX: 100, clientY: 100 })
    /** 2px 位移小于默认阈值 4，不应进入拖动 */
    firePointer(window, 'pointermove', { clientX: 102, clientY: 101 })
    expect(screen.getByTestId('target').getAttribute('data-position')).toBe('null')
    expect(screen.getByTestId('target').getAttribute('data-dragging')).toBe('false')

    firePointer(window, 'pointermove', { clientX: 140, clientY: 130 })
    /** jsdom 中 getBoundingClientRect 恒为 0，基准位置为 { x: 0, y: 0 } */
    expect(screen.getByTestId('target').getAttribute('data-position')).toBe('40,30')
    expect(screen.getByTestId('target').getAttribute('data-dragging')).toBe('true')

    /** 松开后结束拖动，位置保留 */
    firePointer(window, 'pointerup', { clientX: 140, clientY: 130 })
    expect(screen.getByTestId('target').getAttribute('data-position')).toBe('40,30')
    expect(screen.getByTestId('target').getAttribute('data-dragging')).toBe('false')
  })

  it('位置 clamp 在视口内，不允许拖出', () => {
    render(<DragProbe />)

    firePointer(screen.getByTestId('handle'), 'pointerdown', { clientX: 100, clientY: 100 })
    firePointer(window, 'pointermove', { clientX: 5000, clientY: 5000 })

    expect(screen.getByTestId('target').getAttribute('data-position')).toBe(
      `${window.innerWidth},${window.innerHeight}`,
    )
  })

  it('disabled 时不进入拖动', () => {
    render(<DragProbe disabled />)

    firePointer(screen.getByTestId('handle'), 'pointerdown', { clientX: 100, clientY: 100 })
    firePointer(window, 'pointermove', { clientX: 200, clientY: 200 })

    expect(screen.getByTestId('target').getAttribute('data-position')).toBe('null')
    expect(screen.getByTestId('target').getAttribute('data-dragging')).toBe('false')
  })

  it('卸载后清理 window 监听，不再更新状态', () => {
    const { unmount } = render(<DragProbe />)

    firePointer(screen.getByTestId('handle'), 'pointerdown', { clientX: 100, clientY: 100 })
    firePointer(window, 'pointermove', { clientX: 140, clientY: 130 })
    unmount()

    /** 卸载后同一指针会话的后续事件不应抛错（监听已解绑） */
    expect(() => {
      firePointer(window, 'pointermove', { clientX: 200, clientY: 200 })
      firePointer(window, 'pointerup', { clientX: 200, clientY: 200 })
    }).not.toThrow()
  })
})

function DragProbe(props: Partial<UseDragPositionOptions>) {
  const targetRef = useRef<HTMLDivElement>(null)
  const { position, isDragging, handleProps } = useDragPosition({
    ...props,
    targetRef,
  })

  return (
    <div
      ref={ targetRef }
      data-testid="target"
      data-position={ position
        ? `${position.x},${position.y}`
        : 'null' }
      data-dragging={ String(isDragging) }
    >
      <div
        data-testid="handle"
        { ...handleProps }
      />
    </div>
  )
}
