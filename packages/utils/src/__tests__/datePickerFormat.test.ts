import { describe, expect, it } from 'vitest'
import {
  formatDatePickerDate,
  formatDatePickerDateTime,
  formatDatePickerDateTimeRange,
  formatDatePickerTime,
  formatDatePickerTimeParts,
} from '../datePickerFormat'

describe('日期选择器格式化辅助函数', () => {
  const date = new Date('2026-07-04T13:05:09')

  it('按语言默认值和自定义模式格式化日期', () => {
    expect(formatDatePickerDate(date, { locale: 'en-US' })).toBe('2026-07-04')
    expect(formatDatePickerDate(date, { locale: 'zh-CN' })).toBe('2026 年 07 月 04 日')
    expect(formatDatePickerDate(date, { dateFormat: 'dd/MM/yyyy' })).toBe('04/07/2026')
  })

  it('按精度、时段和小时制格式化时间', () => {
    expect(formatDatePickerTime(date, { locale: 'en-US' })).toBe('01:05 PM')
    expect(formatDatePickerTime(date, { locale: 'zh-CN' })).toBe('下午 01:05')
    expect(formatDatePickerTime(date, { precision: 'second', use12Hours: false })).toBe('13:05:09')
    expect(formatDatePickerTimeParts(date, { precision: 'day' })).toEqual({
      timeValue: '',
      period: '',
    })
  })

  it('格式化日期时间和紧凑的同日范围', () => {
    const end = new Date('2026-07-04T15:30:00')
    const nextDay = new Date('2026-07-05T09:00:00')

    expect(formatDatePickerDateTime(date, { locale: 'en-US' })).toBe('2026-07-04 01:05 PM')
    expect(formatDatePickerDateTimeRange(date, end, { locale: 'en-US' })).toBe('2026-07-04 01:05 PM ~ 03:30 PM')
    expect(formatDatePickerDateTimeRange(date, nextDay, {
      locale: 'en-US',
      rangeSeparator: ' -> ',
    })).toBe('2026-07-04 01:05 PM -> 07-05 09:00 AM')

    expect(formatDatePickerDateTimeRange(date, nextDay, {
      locale: 'en-US',
      rangeFormatter: ({ startText, endText, separator }) => startText + separator + endText,
    })).toBe('2026-07-04 01:05 PM ~ 2026-07-05 09:00 AM')
  })
})
