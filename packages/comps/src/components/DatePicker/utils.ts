import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from 'date-fns'

/**
 * 获取日历网格的日期数组
 * @param month 目标月份
 * @param weekStartsOn 周起始日（0 = 周日, 1 = 周一）
 * @returns 日期数组（包含上个月和下个月的日期）
 */
export function getCalendarDays(month: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): Date[] {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn })

  return eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })
}

/**
 * 判断日期是否在当前月份
 */
export function isDateInCurrentMonth(date: Date, currentMonth: Date): boolean {
  return isSameMonth(date, currentMonth)
}

/**
 * 判断两个日期是否为同一天
 */
export function isSameDate(date1: Date | null | undefined, date2: Date | null | undefined): boolean {
  if (!date1 || !date2)
    return false
  return isSameDay(date1, date2)
}

/**
 * 判断日期是否在今天之前
 */
export function isBeforeToday(date: Date): boolean {
  return isBefore(date, new Date())
}

/**
 * 判断日期是否在今天之后
 */
export function isAfterToday(date: Date): boolean {
  return isAfter(date, new Date())
}

/**
 * 判断日期是否为今天
 */
export function isDateToday(date: Date): boolean {
  return isToday(date)
}

/**
 * 获取月份的第一天
 */
export function getMonthStart(month: Date): Date {
  return startOfMonth(month)
}

/**
 * 获取月份的最后一天
 */
export function getMonthEnd(month: Date): Date {
  return endOfMonth(month)
}

/**
 * 获取月份的天数
 */
export function getMonthDaysCount(month: Date): number {
  return getDaysInMonth(month)
}

/**
 * 增加月份
 */
export function addMonth(date: Date, amount: number = 1): Date {
  return addMonths(date, amount)
}

/**
 * 减少月份
 */
export function subtractMonth(date: Date, amount: number = 1): Date {
  return subMonths(date, amount)
}

/**
 * 检查日期是否在范围内
 */
export function isDateInRange(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  if (minDate && isBefore(date, minDate))
    return false
  if (maxDate && isAfter(date, maxDate))
    return false
  return true
}

/**
 * 检查日期是否被禁用
 */
export function isDateDisabled(
  date: Date,
  disabledDate?: (date: Date) => boolean,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  /** 检查是否在范围内 */
  if (!isDateInRange(date, minDate, maxDate))
    return true

  /** 检查自定义禁用函数 */
  if (disabledDate && disabledDate(date))
    return true

  return false
}

/**
 * 获取周几的标签
 */
export function getWeekdayLabels(
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
  labels: string[] = ['日', '一', '二', '三', '四', '五', '六'],
): string[] {
  if (weekStartsOn === 0)
    return labels
  return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)]
}

/**
 * 获取月份标签（中文）
 */
export function getMonthLabel(month: Date): string {
  return format(month, 'yyyy年MM月')
}

/**
 * 判断两个日期是否为同一月份
 */
export function isSameMonthDate(date1: Date | null | undefined, date2: Date | null | undefined): boolean {
  if (!date1 || !date2)
    return false
  return isSameMonth(date1, date2)
}

/**
 * 判断两个日期是否为同一年
 */
export function isSameYearDate(date1: Date | null | undefined, date2: Date | null | undefined): boolean {
  if (!date1 || !date2)
    return false
  return isSameYear(date1, date2)
}

/**
 * 获取月份列表（1-12月）
 */
export function getMonthList(year: number): Date[] {
  return Array.from({ length: 12 }, (_, i) => {
    return new Date(year, i, 1)
  })
}

/**
 * 获取月份标签（中文，短格式）
 */
export function getShortMonthLabel(month: Date): string {
  return format(month, 'M')
}

/**
 * 获取年份列表
 */
export function getYearList(currentYear: number, range: number = 10): Date[] {
  const startYear = currentYear - range
  const endYear = currentYear + range
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    return new Date(startYear + i, 0, 1)
  })
}

/**
 * 获取年份标签
 */
export function getYearLabel(year: Date): string {
  return format(year, 'yyyy')
}

/**
 * 获取周的开始日期
 */
export function getWeekStart(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): Date {
  return startOfWeek(date, { weekStartsOn })
}

/**
 * 获取周的结束日期
 */
export function getWeekEnd(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): Date {
  return endOfWeek(date, { weekStartsOn })
}

/**
 * 判断两个日期是否在同一周
 */
export function isSameWeek(date1: Date, date2: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): boolean {
  const week1Start = getWeekStart(date1, weekStartsOn)
  const week2Start = getWeekStart(date2, weekStartsOn)
  return isSameDay(week1Start, week2Start)
}

/**
 * 获取周的日期数组
 */
export function getWeekDays(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): Date[] {
  const weekStart = getWeekStart(date, weekStartsOn)
  const weekEnd = getWeekEnd(date, weekStartsOn)
  return eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  })
}

/**
 * 格式化周范围
 */
export function formatWeekRange(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): string {
  const weekStart = getWeekStart(date, weekStartsOn)
  const weekEnd = getWeekEnd(date, weekStartsOn)
  const startStr = format(weekStart, 'MM/dd')
  const endStr = format(weekEnd, 'MM/dd')
  return `${startStr} - ${endStr}`
}

/**
 * 增加年份
 */
export function addYear(date: Date, amount: number = 1): Date {
  return addYears(date, amount)
}

/**
 * 减少年份
 */
export function subtractYear(date: Date, amount: number = 1): Date {
  return subYears(date, amount)
}

/**
 * 设置日期为指定月份的第一天
 */
export function setMonthStart(date: Date, month: number): Date {
  return setMonth(date, month)
}

/**
 * 设置日期为指定年份的第一天
 */
export function setYearStart(date: Date, year: number): Date {
  return setYear(date, year)
}

/**
 * 判断日期是否在范围内（用于范围选择）
 */
export function isDateInRangeSelection(
  date: Date,
  range: { start: Date | null, end: Date | null },
): boolean {
  if (!range.start || !range.end)
    return false
  return (isAfter(date, range.start) || isSameDay(date, range.start))
    && (isBefore(date, range.end) || isSameDay(date, range.end))
}

/**
 * 判断日期是否为范围的开始日期
 */
export function isRangeStart(
  date: Date,
  range: { start: Date | null, end: Date | null },
): boolean {
  if (!range.start)
    return false
  return isSameDay(date, range.start)
}

/**
 * 判断日期是否为范围的结束日期
 */
export function isRangeEnd(
  date: Date,
  range: { start: Date | null, end: Date | null },
): boolean {
  if (!range.end)
    return false
  return isSameDay(date, range.end)
}

/**
 * 获取有效的日期范围（确保 start <= end）
 */
export function getValidDateRange(
  start: Date | null,
  end: Date | null,
): { start: Date | null, end: Date | null } {
  if (!start || !end)
    return { start, end }
  if (isAfter(start, end))
    return { start: end, end: start }
  return { start, end }
}

export * from './utils/period'
export * from './utils/value'

/**
 * 重新导出 date-fns 的常用函数，方便其他模块使用
 */
export { endOfWeek, getYear, isAfter, isBefore, startOfWeek } from 'date-fns'
