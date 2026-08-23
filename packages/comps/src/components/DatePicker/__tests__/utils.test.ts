import { format, parseISO } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { getCalendarDays } from '../utils'

describe('datePicker utils', () => {
  it('不同月份都生成固定六周，避免切换月份时改变日历高度', () => {
    const fourWeekMonth = getCalendarDays(parseISO('2026-02-01'), 0)
    const sixWeekMonth = getCalendarDays(parseISO('2026-08-01'), 1)

    expect(fourWeekMonth).toHaveLength(42)
    expect(sixWeekMonth).toHaveLength(42)
    expect(format(fourWeekMonth[0], 'yyyy-MM-dd')).toBe('2026-02-01')
    expect(format(fourWeekMonth.at(-1)!, 'yyyy-MM-dd')).toBe('2026-03-14')
  })
})
