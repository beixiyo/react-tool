import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { expectPattern } from '../../../__tests__/utils/ariaPatterns'
import { Calendar } from '../subcomponents/Calendar'
import { DATE_2026_07_04 } from './fixtures'
import { ControlledDatePicker, renderWithI18n } from './test-utils'

/** 2026-07-15 为周三，周一为周起始日时该周为 07-13 ~ 07-19 */
const JULY_15 = new Date(2026, 6, 15)

function KeyboardCalendar({ disabledDate }: { disabledDate?: (date: Date) => boolean }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(JULY_15)
  return (
    <Calendar
      currentMonth={ currentMonth }
      onCurrentMonthChange={ setCurrentMonth }
      selectedDate={ selectedDate }
      onSelect={ setSelectedDate }
      disabledDate={ disabledDate }
    />
  )
}

function getDay(name: string) {
  return screen.getByRole('button', { name })
}

function press(key: string, init: Partial<KeyboardEventInit> = {}) {
  fireEvent.keyDown(document.activeElement as HTMLElement, { key, ...init })
}

function dispatchEscape() {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  act(() => {
    document.dispatchEvent(event)
  })
  return event
}

async function openPicker() {
  renderWithI18n(<ControlledDatePicker initialValue={ DATE_2026_07_04 } onChange={ vi.fn() } />)
  const trigger = screen.getByRole('button', { name: '2026 年 07 月 04 日' })
  trigger.focus()
  fireEvent.keyDown(trigger, { key: 'Enter' })
  await waitFor(() => expect(document.activeElement).toBe(getDay('2026-07-04')))
  return trigger
}

describe('DatePicker 日历网格 ARIA 契约', () => {
  it('grid > row > columnheader / gridcell 结构、可访问名与单一 Tab 停靠点在翻月前后都成立', () => {
    renderWithI18n(<KeyboardCalendar />)
    const grid = screen.getByRole('grid')
    expectPattern(grid, 'grid')
    expect(within(grid).getAllByRole('columnheader')).toHaveLength(7)

    getDay('2026-07-15').focus()
    press('PageDown')
    expectPattern(screen.getByRole('grid'), 'grid')
  })

  it('禁用日期带 aria-disabled，Home / End 在周边界跳过禁用日期', () => {
    /** 禁用本周的周一 07-13 与周日 07-19 */
    const disabledDate = (date: Date) => date.getMonth() === 6 && [13, 19].includes(date.getDate())
    renderWithI18n(<KeyboardCalendar disabledDate={ disabledDate } />)

    const disabledCell = getDay('2026-07-13').closest('[role="gridcell"]')
    expect(disabledCell?.getAttribute('aria-disabled')).toBe('true')

    getDay('2026-07-15').focus()
    press('Home')
    expect(document.activeElement).toBe(getDay('2026-07-14'))
    press('End')
    expect(document.activeElement).toBe(getDay('2026-07-18'))
    expectPattern(screen.getByRole('grid'), 'grid')
  })

  it('弹层内网格结构成立，Escape 关闭后焦点回到触发器且不再响应按键', async () => {
    const trigger = await openPicker()
    expectPattern(screen.getByRole('grid'), 'grid')

    press('ArrowRight')
    expect(dispatchEscape().defaultPrevented).toBe(true)
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    await waitFor(() => expect(screen.queryByRole('grid')).toBeNull())

    /** 关闭后：Escape 不被消费，方向键不会重新打开或移动到日期 */
    expect(dispatchEscape().defaultPrevented).toBe(false)
    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(trigger)
    expect(screen.queryByRole('grid')).toBeNull()
  })

  it('触发器通过 aria-haspopup / aria-expanded 暴露弹层状态', async () => {
    renderWithI18n(<ControlledDatePicker initialValue={ DATE_2026_07_04 } onChange={ vi.fn() } />)
    const trigger = screen.getByRole('button', { name: '2026 年 07 月 04 日' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    await waitFor(() => expect(document.activeElement).toBe(getDay('2026-07-04')))
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    dispatchEscape()
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
  })

  it('日历弹层是带 locale 可访问名的 dialog，网格位于其中', async () => {
    await openPicker()
    expectPattern(document.body, 'dialog', { modal: false })
    const dialog = screen.getByRole('dialog', { name: '日期选择' })
    expect(dialog.contains(screen.getByRole('grid'))).toBe(true)
  })
})
