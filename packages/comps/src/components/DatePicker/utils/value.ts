import { format, getHours, getMinutes, getSeconds, setHours, setMinutes, setSeconds } from 'date-fns'

export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'
export const DEFAULT_MONTH_FORMAT = 'yyyy-MM'
export const DEFAULT_YEAR_FORMAT = 'yyyy'

/** 根据精度获取默认格式字符串 */
export function getFormatByPrecision(
  precision: 'day' | 'hour' | 'minute' | 'second' = 'day',
  use12Hours: boolean = false,
  baseDateFormat: string = DEFAULT_DATE_FORMAT,
): string {
  if (use12Hours && precision !== 'day')
    return baseDateFormat

  switch (precision) {
    case 'day': return baseDateFormat
    case 'hour': return `${baseDateFormat} HH:00`
    case 'minute': return `${baseDateFormat} HH:mm`
    case 'second': return `${baseDateFormat} HH:mm:ss`
    default: return baseDateFormat
  }
}

export function formatDate(date: Date | null | undefined, formatStr: string = DEFAULT_DATE_FORMAT): string {
  return date
    ? format(date, formatStr)
    : ''
}

/** 把旧值的时间部分应用到新日期 */
export function preserveTimeFromDate(
  newDate: Date,
  oldDate: Date | null | undefined,
  precision: 'day' | 'hour' | 'minute' | 'second' = 'day',
): Date {
  if (precision === 'day' || !oldDate)
    return newDate

  let result = setHours(newDate, getHours(oldDate))
  if (precision === 'minute' || precision === 'second')
    result = setMinutes(result, getMinutes(oldDate))
  if (precision === 'second')
    result = setSeconds(result, getSeconds(oldDate))
  return result
}

export function getInitialDate(
  actualValue: Date | null | undefined,
  defaultValue: Date | null | undefined,
  fallback?: Date,
): Date {
  return actualValue || defaultValue || fallback || new Date()
}

export function isDateEqual(
  left: Date | null | undefined,
  right: Date | null | undefined,
): boolean {
  if (left == null)
    return right == null
  return right != null && left.getTime() === right.getTime()
}

export function isDateRangeEqual(
  left: { start: Date | null, end: Date | null } | null | undefined,
  right: { start: Date | null, end: Date | null } | null | undefined,
): boolean {
  const leftEmpty = !left || (!left.start && !left.end)
  const rightEmpty = !right || (!right.start && !right.end)
  if (leftEmpty || rightEmpty)
    return leftEmpty === rightEmpty
  return isDateEqual(left.start, right.start) && isDateEqual(left.end, right.end)
}
