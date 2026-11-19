import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setScrollGeometry as setGeometry } from '../../../__tests__/utils/scrollGeometry'
import { Select } from '../Select'
import type { Option } from '../types'

const manyOptions: Option[] = Array.from({ length: 12 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index}`,
}))

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

function openSelect(mode: '普通' | '搜索' | '可编辑' = '普通', footer?: '随列表滚动' | '固定') {
  render(
    <Select
      aria-label="Choices"
      placeholder="Choose"
      options={ manyOptions }
      searchable={ mode === '搜索' }
      editable={ mode === '可编辑' }
      renderDropdownFooter={ footer
        ? () => <input aria-label="Footer" />
        : undefined }
      dropdownFooterScroll={ footer === '随列表滚动' }
    />,
  )
  const trigger = screen.getByRole('combobox', { name: 'Choices' })
  let keyboardTarget: HTMLElement = trigger
  if (mode === '可编辑') {
    keyboardTarget = screen.getByPlaceholderText('Choose')
    act(() => keyboardTarget.focus())
    fireEvent.keyDown(keyboardTarget, { key: 'ArrowDown' })
  }
  else {
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    if (mode === '搜索') keyboardTarget = screen.getByPlaceholderText('Search...')
  }
  const listbox = screen.getByRole('listbox')
  const scroller = footer === '随列表滚动'
    ? listbox.parentElement!
    : listbox
  setGeometry(listbox, scroller)
  flushFrame()
  return { trigger, keyboardTarget, listbox, scroller }
}

describe('Select 键盘高亮滚动', () => {
  it.each(['普通', '搜索', '可编辑'] as const)('%s 模式连续按方向键时，高亮项滚入列表且可向上滚回', (mode) => {
    const { keyboardTarget, scroller } = openSelect(mode)
    fireEvent.keyDown(keyboardTarget, { key: 'ArrowDown' })
    flushFrame()
    expect(scroller.scrollTop).toBe(0)
    for (let index = 0; index < 2; index++) fireEvent.keyDown(keyboardTarget, { key: 'ArrowDown' })
    flushFrame()
    expect(scroller.scrollTop).toBe(80)

    for (let index = 0; index < 3; index++) fireEvent.keyDown(keyboardTarget, { key: 'ArrowUp' })
    flushFrame()
    expect(scroller.scrollTop).toBe(0)
  })

  it.each(['随列表滚动', '固定'] as const)('footer %s 时，只滚动实际承载选项的滚动区', (footer) => {
    const { keyboardTarget, scroller } = openSelect('普通', footer)
    fireEvent.keyDown(keyboardTarget, { key: 'End' })
    flushFrame()
    expect(scroller.scrollTop).toBe(400)

    fireEvent.keyDown(keyboardTarget, { key: 'Home' })
    flushFrame()
    expect(scroller.scrollTop).toBe(0)
  })

  it('打开时让屏外已选项可见，并保留 DOM 焦点在触发器', () => {
    render(<Select aria-label="Choices" options={ manyOptions } defaultValue="item-11" />)
    const trigger = screen.getByRole('combobox', { name: 'Choices' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    const listbox = screen.getByRole('listbox')
    setGeometry(listbox)
    flushFrame()
    expect(listbox.scrollTop).toBe(400)
    expect(document.activeElement).toBe(trigger)
  })

  it('可见项与鼠标悬停不会强拉列表，到达键盘边界时仍能找回屏外高亮项', () => {
    const { keyboardTarget, listbox, scroller } = openSelect()
    setGeometry(listbox, scroller, 70)
    const options = screen.getAllByRole('option')
    fireEvent.mouseEnter(options[1]!)
    flushFrame()
    expect(scroller.scrollTop).toBe(0)

    fireEvent.keyDown(keyboardTarget, { key: 'End' })
    flushFrame()
    expect(scroller.scrollTop).toBe(410)
    scroller.scrollTop = 0
    fireEvent.keyDown(keyboardTarget, { key: 'ArrowDown' })
    flushFrame()
    expect(scroller.scrollTop).toBe(410)
  })

  it('退出动画期间不执行先前排队的滚动', () => {
    const { keyboardTarget, scroller } = openSelect()
    fireEvent.keyDown(keyboardTarget, { key: 'End' })
    fireEvent.keyDown(keyboardTarget, { key: 'Escape' })
    flushFrame()
    expect(scroller.scrollTop).toBe(0)
  })

  it('面板缩放动画期间按布局坐标滚动，不留下边缘裁切', () => {
    const { keyboardTarget, listbox } = openSelect()
    setGeometry(listbox, listbox, 80, 0.5)
    fireEvent.keyDown(keyboardTarget, { key: 'End' })
    flushFrame()
    expect(listbox.scrollTop).toBe(400)
  })

  it('级联导航只滚动当前列，不改变上一列的滚动位置', () => {
    render(
      <Select
        aria-label="Choices"
        options={ [{ value: 'group', label: 'Group', children: manyOptions }, ...manyOptions.map((option) => ({ ...option, value: `root-${option.value}` }))] }
      />,
    )
    const trigger = screen.getByRole('combobox', { name: 'Choices' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    const root = screen.getByRole('listbox')
    setGeometry(root)
    flushFrame()
    root.scrollTop = 40

    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    const child = screen.getAllByRole('listbox')[1]!
    setGeometry(child)
    fireEvent.keyDown(trigger, { key: 'End' })
    flushFrame()
    expect(child.scrollTop).toBe(400)
    expect(root.scrollTop).toBe(40)
  })
})
