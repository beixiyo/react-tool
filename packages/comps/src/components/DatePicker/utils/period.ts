import { endOfMonth, endOfYear, isAfter, isBefore, startOfMonth, startOfYear } from 'date-fns'

/** 判断目标月份是否与允许日期范围存在交集 */
export function isMonthAvailable(date: Date, minDate?: Date, maxDate?: Date): boolean {
  return isPeriodAvailable(startOfMonth(date), endOfMonth(date), minDate, maxDate)
}

/** 判断目标年份是否与允许日期范围存在交集 */
export function isYearAvailable(date: Date, minDate?: Date, maxDate?: Date): boolean {
  return isPeriodAvailable(startOfYear(date), endOfYear(date), minDate, maxDate)
}

/** 判断一组连续年份是否与允许日期范围存在交集 */
export function isYearRangeAvailable(
  firstYear: Date,
  lastYear: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  return isPeriodAvailable(startOfYear(firstYear), endOfYear(lastYear), minDate, maxDate)
}

function isPeriodAvailable(
  periodStart: Date,
  periodEnd: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  if (minDate && isBefore(periodEnd, minDate))
    return false
  if (maxDate && isAfter(periodStart, maxDate))
    return false
  return true
}
