import { describe, expect, it } from 'vitest'
import {
  formatDatePickerDate,
  formatDatePickerDateTime,
  formatDatePickerDateTimeRange,
  formatDatePickerTime,
  formatDatePickerTimeParts,
} from '../datePickerFormat'

describe('date picker format helpers', () => {
  const date = new Date('2026-07-04T13:05:09')

  it('formats date by locale defaults and custom patterns', () => {
    expect(formatDatePickerDate(date, { locale: 'en-US' })).toBe('2026-07-04')
    expect(formatDatePickerDate(date, { locale: 'zh-CN' })).toBe('2026 年 07 月 04 日')
    expect(formatDatePickerDate(date, { dateFormat: 'dd/MM/yyyy' })).toBe('04/07/2026')
  })

  it('formats time by precision, period and hour mode', () => {
    expect(formatDatePickerTime(date, { locale: 'en-US' })).toBe('01:05 PM')
    expect(formatDatePickerTime(date, { locale: 'zh-CN' })).toBe('下午 01:05')
    expect(formatDatePickerTime(date, { precision: 'second', use12Hours: false })).toBe('13:05:09')
    expect(formatDatePickerTimeParts(date, { precision: 'day' })).toEqual({
      timeValue: '',
      period: '',
    })
  })

  it('formats date-time and compact same-day ranges', () => {
    const end = new Date('2026-07-04T15:30:00')
    const nextDay = new Date('2026-07-05T09:00:00')

    expect(formatDatePickerDateTime(date, { locale: 'en-US' })).toBe('2026-07-04 01:05 PM')
    expect(formatDatePickerDateTimeRange(date, end, { locale: 'en-US' })).toBe('2026-07-04 01:05 PM ~ 03:30 PM')
    expect(formatDatePickerDateTimeRange(date, nextDay, {
      locale: 'en-US',
      rangeSeparator: ' -> ',
    })).toBe('2026-07-04 01:05 PM -> 2026-07-05 09:00 AM')
  })
})
