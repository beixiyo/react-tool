// @vitest-environment jsdom

/**
 * PageSwiper 键盘翻页契约：默认监听 window，container 作用域只响应容器内按键，
 * 可编辑目标不翻页；受控 / 非受控都通过 onIndexChange 通知
 */
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PageSwiper } from '../PageSwiper'

const PAGES = ['p0', 'p1', 'p2'].map((text) => <div key={ text }>{ text }</div>)

describe('PageSwiper 键盘', () => {
  it('默认在 window 上响应方向键，非受控内部推进', () => {
    const onIndexChange = vi.fn()
    render(<PageSwiper onIndexChange={ onIndexChange } showIndicator={ false }>{ PAGES }</PageSwiper>)
    onIndexChange.mockClear()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onIndexChange.mock.calls).toEqual([[1], [2]])
  })

  it('受控时只通知上层，不自行推进', () => {
    const onIndexChange = vi.fn()
    render(<PageSwiper index={ 0 } onIndexChange={ onIndexChange } showIndicator={ false }>{ PAGES }</PageSwiper>)
    onIndexChange.mockClear()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    /** 上层未接受变更时，重复请求仍逐次通知 */
    expect(onIndexChange.mock.calls).toEqual([[1], [1]])
  })

  it('keyboardScope=container 时只响应容器内按键，容器可聚焦', () => {
    const onIndexChange = vi.fn()
    const { container } = render(
      <PageSwiper keyboardScope="container" onIndexChange={ onIndexChange } showIndicator={ false }>
        { PAGES }
      </PageSwiper>,
    )
    const root = container.firstElementChild as HTMLElement
    onIndexChange.mockClear()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onIndexChange).not.toHaveBeenCalled()

    expect(root.tabIndex).toBe(0)
    root.focus()
    fireEvent.keyDown(root, { key: 'ArrowRight' })
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
  })

  it('焦点在输入框内时方向键不翻页', () => {
    const onIndexChange = vi.fn()
    const { getByRole } = render(
      <>
        <input aria-label="note" />
        <PageSwiper onIndexChange={ onIndexChange } showIndicator={ false }>{ PAGES }</PageSwiper>
      </>,
    )
    onIndexChange.mockClear()
    const input = getByRole('textbox', { name: 'note' })
    input.focus()

    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(onIndexChange).not.toHaveBeenCalled()
  })
})
