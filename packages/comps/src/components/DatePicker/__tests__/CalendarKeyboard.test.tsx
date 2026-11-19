import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from '../subcomponents/Calendar'
import { MonthGrid } from '../subcomponents/MonthGrid'
import { DATE_2026_07_04 } from './fixtures'
import { ControlledDatePicker, renderWithI18n } from './test-utils'

/** 2026-07-15 为周三，周一为周起始日时该周为 07-13 ~ 07-19 */
const JULY_15 = new Date(2026, 6, 15)

function KeyboardCalendar({
  disabledDate,
  onSelect,
}: {
  disabledDate?: (date: Date) => boolean
  onSelect?: (date: Date) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(JULY_15)
  return (
    <Calendar
      currentMonth={ currentMonth }
      onCurrentMonthChange={ setCurrentMonth }
      selectedDate={ selectedDate }
      onSelect={ (date) => {
        setSelectedDate(date)
        onSelect?.(date)
      } }
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

describe('日历网格键盘导航', () => {
  it('使用 grid / row / gridcell 语义，只有选中日期可被 Tab 聚焦', () => {
    renderWithI18n(<KeyboardCalendar />)

    const grid = screen.getByRole('grid')
    expect(within(grid).getAllByRole('row').length).toBe(7)

    const selected = getDay('2026-07-15')
    expect(selected.closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe('true')
    expect(selected.getAttribute('tabindex')).toBe('0')
    expect(within(grid).getAllByRole('button').filter((button) => button.tabIndex === 0)).toHaveLength(1)
  })

  it('方向键按天 / 周移动，Home / End 到周首周末，并同步 roving tabindex', () => {
    renderWithI18n(<KeyboardCalendar />)
    getDay('2026-07-15').focus()

    press('ArrowRight')
    expect(document.activeElement).toBe(getDay('2026-07-16'))
    expect(getDay('2026-07-16').tabIndex).toBe(0)
    expect(getDay('2026-07-15').tabIndex).toBe(-1)

    press('ArrowDown')
    expect(document.activeElement).toBe(getDay('2026-07-23'))

    press('ArrowUp')
    press('ArrowLeft')
    expect(document.activeElement).toBe(getDay('2026-07-15'))

    press('Home')
    expect(document.activeElement).toBe(getDay('2026-07-13'))

    press('End')
    expect(document.activeElement).toBe(getDay('2026-07-19'))
  })

  it('沿移动方向跳过禁用日期', () => {
    /** 禁用 07-16 与 07-22 */
    const disabledDate = (date: Date) => date.getMonth() === 6 && [16, 22].includes(date.getDate())
    renderWithI18n(<KeyboardCalendar disabledDate={ disabledDate } />)
    getDay('2026-07-15').focus()

    press('ArrowRight')
    expect(document.activeElement).toBe(getDay('2026-07-17'))

    press('ArrowLeft')
    expect(document.activeElement).toBe(getDay('2026-07-15'))

    /** 07-22 禁用，继续按周向下到 07-29 */
    press('ArrowDown')
    expect(document.activeElement).toBe(getDay('2026-07-29'))
  })

  it('pageUp / PageDown 切换月份，Shift 切换年份，跨月方向键同样切月', () => {
    renderWithI18n(<KeyboardCalendar />)
    getDay('2026-07-15').focus()

    press('PageDown')
    expect(document.activeElement).toBe(getDay('2026-08-15'))
    expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('2026-08')

    press('PageUp', { shiftKey: true })
    expect(document.activeElement).toBe(getDay('2025-08-15'))
    expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('2025-08')

    press('PageDown', { shiftKey: true })
    press('PageUp')
    press('Home')
    /** 回到 07-13（周一），连续上移两周跨入六月 */
    press('ArrowUp')
    press('ArrowUp')
    expect(document.activeElement).toBe(getDay('2026-06-29'))
    expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('2026-06')
  })

  it('点击聚焦的日期仍走选择回调', () => {
    const onSelect = vi.fn()
    renderWithI18n(<KeyboardCalendar onSelect={ onSelect } />)
    getDay('2026-07-15').focus()
    press('ArrowRight')
    fireEvent.click(document.activeElement as HTMLElement)
    expect(onSelect.mock.calls[0][0].getDate()).toBe(16)
  })
})

describe('月份网格键盘导航', () => {
  it('左右 / 上下移动并跳过禁用月份', () => {
    renderWithI18n(
      <MonthGrid
        currentYear={ new Date(2026, 0, 1) }
        selectedMonth={ new Date(2026, 0, 1) }
        disabledMonth={ (date) => date.getMonth() === 1 }
      />,
    )

    const grid = screen.getByRole('grid')
    expect(within(grid).getAllByRole('row')).toHaveLength(4)

    const january = within(grid).getAllByRole('button')[0]
    expect(january.tabIndex).toBe(0)
    january.focus()

    /** 二月禁用，直接到三月 */
    press('ArrowRight')
    expect(document.activeElement).toBe(within(grid).getAllByRole('button')[2])

    press('ArrowDown')
    expect(document.activeElement).toBe(within(grid).getAllByRole('button')[5])

    press('Home')
    expect(document.activeElement).toBe(within(grid).getAllByRole('button')[3])

    press('End')
    expect(document.activeElement).toBe(within(grid).getAllByRole('button')[5])
  })
})

describe('picker 焦点交接', () => {
  it('键盘打开后焦点进入选中日期，Escape 关闭后归还 trigger', async () => {
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ vi.fn() }
      />,
    )

    const trigger = screen.getByRole('button', { name: '2026 年 07 月 04 日' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: '2026-07-04' }))
    })

    press('ArrowRight')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '2026-07-05' }))

    press('Escape')
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger)
    })
  })
})
