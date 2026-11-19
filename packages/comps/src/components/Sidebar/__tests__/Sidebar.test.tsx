import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Sidebar } from '../Sidebar'

const noop = async () => {}

function getRoot(container: HTMLElement) {
  return container.firstElementChild as HTMLElement
}

describe('Sidebar 受控 / 非受控展开态', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('非受控：悬停展开、离开延迟收起，状态未变化时不重复通知', () => {
    const onExpandedChange = vi.fn()
    const { container } = render(<Sidebar data={ [] } loadMore={ noop } leaveDelay={ 100 } onExpandedChange={ onExpandedChange } />)
    const root = getRoot(container)

    fireEvent.mouseEnter(root)
    fireEvent.mouseEnter(root)
    expect(onExpandedChange.mock.calls).toEqual([[true]])

    fireEvent.mouseLeave(root)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(onExpandedChange.mock.calls).toEqual([[true], [false]])
  })

  it('受控：只通知上层，展开态以 expanded 为准', () => {
    const onExpandedChange = vi.fn()
    const { container, rerender } = render(<Sidebar data={ [] } loadMore={ noop } expanded={ false } leaveDelay={ 100 } onExpandedChange={ onExpandedChange } />)
    const root = getRoot(container)

    fireEvent.mouseEnter(root)
    expect(onExpandedChange.mock.calls).toEqual([[true]])

    /** 上层拒绝变更（未更新 expanded）时，重复悬停仍应再次请求展开 */
    fireEvent.mouseEnter(root)
    expect(onExpandedChange.mock.calls).toEqual([[true], [true]])

    /** 上层接受后变为展开，离开时再请求收起 */
    rerender(<Sidebar data={ [] } loadMore={ noop } expanded leaveDelay={ 100 } onExpandedChange={ onExpandedChange } />)
    fireEvent.mouseLeave(root)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(onExpandedChange.mock.calls).toEqual([[true], [true], [false]])
  })
})
