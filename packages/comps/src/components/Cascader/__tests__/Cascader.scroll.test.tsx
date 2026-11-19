import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setScrollGeometry } from '../../../__tests__/utils/scrollGeometry'
import { Cascader } from '../Cascader'
import type { CascaderProps } from '../types'

const options = Array.from({ length: 12 }, (_, index) => ({ value: `item-${index}`, label: `Item ${index}` }))

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function flushFrame() {
  act(() => vi.advanceTimersByTime(20))
}

function openMenu(props: Partial<CascaderProps> = {}) {
  render(<Cascader aria-label="Choices" options={ options } { ...props } />)
  const trigger = screen.getByRole('combobox', { name: 'Choices' })
  trigger.focus()
  fireEvent.keyDown(trigger, { key: 'Enter' })
  const listbox = screen.getByRole('listbox', { hidden: true })
  const scroller = listbox.parentElement!
  setScrollGeometry(listbox, scroller)
  flushFrame()
  flushFrame()
  return { trigger, listbox, scroller }
}

describe('Cascader 键盘高亮滚动', () => {
  it('长列表关闭动画时，在原有打开定位完成后，方向键和 Home/End 仍持续跟随高亮', () => {
    const { trigger, scroller } = openMenu({ value: 'item-8', enableScrollAnimation: false })
    /** 模拟原有打开定位已完成，本例验证的是之后的键盘导航 */
    scroller.scrollTop = 280
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    flushFrame()
    expect(scroller.scrollTop).toBe(320)
    expect(scroller.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'instant' }))

    fireEvent.keyDown(trigger, { key: 'End' })
    flushFrame()
    expect(scroller.scrollTop).toBe(400)
    fireEvent.keyDown(trigger, { key: 'Home' })
    flushFrame()
    expect(scroller.scrollTop).toBe(0)
    expect(document.activeElement).toBe(trigger)
  })

  it.each(['bottom-start', 'top-start', 'left-start', 'right-start'] as const)('%s 定位下的普通菜单都能键盘滚动，并保留动画配置', (placement) => {
    const { trigger, scroller } = openMenu({ placement })
    fireEvent.keyDown(trigger, { key: 'End' })
    flushFrame()
    expect(scroller.scrollTop).toBe(400)
    expect(scroller.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'smooth' }))
  })

  it('可编辑模式保持输入焦点，并把方向键导航到的屏外选项滚入列表', () => {
    render(<Cascader aria-label="Choices" options={ options } editable enableScrollAnimation={ false } />)
    const input = screen.getByRole('textbox', { name: 'Choices' })
    act(() => input.focus())
    const listbox = screen.getByRole('listbox', { hidden: true })
    const scroller = listbox.parentElement!
    setScrollGeometry(listbox, scroller)
    flushFrame()
    flushFrame()
    fireEvent.keyDown(input, { key: 'End' })
    flushFrame()
    expect(scroller.scrollTop).toBe(400)
    expect(document.activeElement).toBe(input)
  })

  it.each([true, false])('搜索模式保留已有原生滚动与输入焦点，enableScrollAnimation=%s', (enableScrollAnimation) => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    render(<Cascader aria-label="Choices" options={ options } searchable enableScrollAnimation={ enableScrollAnimation } />)
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Choices' }), { key: 'Enter' })
    act(() => vi.advanceTimersByTime(120))
    const input = screen.getByPlaceholderText('Search...')
    act(() => input.focus())
    scrollIntoView.mockClear()
    fireEvent.keyDown(input, { key: 'End' })
    flushFrame()
    expect(scrollIntoView.mock.contexts).toContain(screen.getByRole('option', { name: 'Item 11' }))
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({
      block: 'nearest',
      behavior: enableScrollAnimation
        ? 'smooth'
        : 'instant',
    }))
    expect(document.activeElement).toBe(input)
  })
})
