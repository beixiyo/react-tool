const DEFAULT_RANGE_SEPARATOR = ' ~ '

/**
 * DatePicker 风格日期时间格式化选项
 */
export interface DatePickerFormatOptions {
  /**
   * 语言标识，用于推断默认日期格式、上午 / 下午文案和时段位置
   *
   * @default 'en'
   */
  locale?: string
  /**
   * 日期格式，仅支持 DatePicker 当前用到的 yyyy、MM、dd、HH、hh、mm、ss token
   */
  dateFormat?: string
  /**
   * 上午文案
   */
  amLabel?: string
  /**
   * 下午文案
   */
  pmLabel?: string
  /**
   * 时段文案相对时间的位置
   *
   * @default 根据 locale 推断，中文 / 日文在左，英文在右
   */
  periodPosition?: 'left' | 'right'
  /**
   * 区间分隔符
   *
   * @default ' ~ '
   */
  rangeSeparator?: string
  /**
   * 自定义日期范围展示文本；返回值会直接作为完整范围文本
   *
   * @default 未传入时使用 DatePicker 默认格式
   */
  rangeFormatter?: DatePickerRangeFormatter
  /**
   * 时间精度
   *
   * @default 'minute'
   */
  precision?: DatePickerTimePrecision
  /**
   * 是否使用 12 小时制
   *
   * @default true
   */
  use12Hours?: boolean
}

/**
 * 日期范围格式化回调上下文
 */
export interface DatePickerRangeFormatContext {
  /** 开始日期 */
  start: Date
  /** 结束日期 */
  end: Date
  /** 默认格式化后的开始端点文本 */
  startText: string
  /** 默认格式化后的结束端点文本 */
  endText: string
  /** 当前范围分隔符 */
  separator: string
  /** 是否为同一天 */
  isSameDay: boolean
  /** 是否为同一年 */
  isSameYear: boolean
  /** 当前格式化模式 */
  mode: 'date' | 'dateTime'
  /** 不含 rangeFormatter 的格式化选项 */
  options: Omit<DatePickerFormatOptions, 'rangeFormatter'>
}

/**
 * 自定义日期范围展示文本的格式化函数
 */
export type DatePickerRangeFormatter = (context: DatePickerRangeFormatContext) => string

/**
 * DatePicker 时间精度
 */
export type DatePickerTimePrecision = 'day' | 'hour' | 'minute' | 'second'

/**
 * DatePicker 时间展示拆分结果
 */
export interface DatePickerTimeParts {
  /**
   * 时间文本
   */
  timeValue: string
  /**
   * 上午 / 下午文本，24 小时制时为空
   */
  period: string
}

/**
 * 使用 DatePicker 的默认展示语义格式化日期
 */
export function formatDatePickerDate(
  date: Date | number | string,
  options: DatePickerFormatOptions = {},
): string {
  const d = toDate(date)
  const dateFormat = options.dateFormat ?? getDefaultDateFormat(options.locale)

  return formatDateByPattern(d, dateFormat)
}

/**
 * 使用 DatePicker 的默认展示语义格式化 12 小时时间
 */
export function formatDatePickerTime(
  date: Date | number | string,
  options: DatePickerFormatOptions = {},
): string {
  const { timeValue, period } = formatDatePickerTimeParts(date, options)

  if (!timeValue) return ''

  if (!period) return timeValue

  return getDatePickerPeriodPosition(options) === 'left'
    ? `${period} ${timeValue}`
    : `${timeValue} ${period}`
}

/**
 * 按 DatePicker 输入框需要的结构格式化时间部分
 */
export function formatDatePickerTimeParts(
  date: Date | number | string,
  options: DatePickerFormatOptions = {},
): DatePickerTimeParts {
  const d = toDate(date)
  const precision = options.precision ?? 'minute'

  if (precision === 'day') {
    return {
      timeValue: '',
      period: '',
    }
  }

  const use12Hours = options.use12Hours ?? true
  const timeValue = formatTimeByPrecision(d, precision, use12Hours)

  return {
    timeValue,
    period: use12Hours
      ? getDatePickerPeriod(d, options)
      : '',
  }
}

/**
 * 使用 DatePicker 的默认展示语义格式化日期时间
 */
export function formatDatePickerDateTime(
  date: Date | number | string,
  options: DatePickerFormatOptions = {},
): string {
  return `${formatDatePickerDate(date, options)} ${formatDatePickerTime(date, options)}`
}

/**
 * 使用 DatePicker 的默认展示语义格式化日期区间
 *
 * 同一年时，结束日期省略年份；跨年时保留完整日期
 */
export function formatDatePickerDateRange(
  start: Date | number | string,
  end: Date | number | string,
  options: DatePickerFormatOptions = {},
): string {
  const s = toDate(start)
  const e = toDate(end)
  const formatOptions = omitRangeFormatter(options)
  const rangeSeparator = options.rangeSeparator ?? DEFAULT_RANGE_SEPARATOR
  const startText = formatDatePickerDate(s, formatOptions)
  const endText = formatDatePickerDate(e, formatOptions)
  const customText = options.rangeFormatter?.({
    start: s,
    end: e,
    startText,
    endText,
    separator: rangeSeparator,
    isSameDay: isSameDate(s, e),
    isSameYear: isSameYear(s, e),
    mode: 'date',
    options: formatOptions,
  })

  if (customText !== undefined) return customText

  if (isSameDate(s, e)) return startText

  const endOptions = isSameYear(s, e)
    ? { ...formatOptions, dateFormat: removeYearFromDateFormat(formatOptions) }
    : formatOptions

  return startText + rangeSeparator + formatDatePickerDate(e, endOptions)
}

/**
 * 使用 DatePicker 的默认展示语义格式化日期时间区间
 */
export function formatDatePickerDateTimeRange(
  start: Date | number | string,
  end: Date | number | string,
  options: DatePickerFormatOptions = {},
): string {
  const s = toDate(start)
  const e = toDate(end)
  const formatOptions = omitRangeFormatter(options)
  const rangeSeparator = options.rangeSeparator ?? DEFAULT_RANGE_SEPARATOR
  const startText = formatDatePickerDateTime(s, formatOptions)
  const endText = formatDatePickerDateTime(e, formatOptions)
  const customText = options.rangeFormatter?.({
    start: s,
    end: e,
    startText,
    endText,
    separator: rangeSeparator,
    isSameDay: isSameDate(s, e),
    isSameYear: isSameYear(s, e),
    mode: 'dateTime',
    options: formatOptions,
  })

  if (customText !== undefined) return customText

  if (isSameDate(s, e)) {
    return [
      formatDatePickerDate(s, formatOptions),
      formatDatePickerTime(s, formatOptions) + rangeSeparator + formatDatePickerTime(e, formatOptions),
    ].join(' ')
  }

  const endOptions = isSameYear(s, e)
    ? { ...formatOptions, dateFormat: removeYearFromDateFormat(formatOptions) }
    : formatOptions

  return startText + rangeSeparator + formatDatePickerDateTime(e, endOptions)
}

function toDate(date: Date | number | string): Date {
  return date instanceof Date
    ? date
    : new Date(date)
}

function omitRangeFormatter(options: DatePickerFormatOptions): Omit<DatePickerFormatOptions, 'rangeFormatter'> {
  const { rangeFormatter: _rangeFormatter, ...formatOptions } = options
  return formatOptions
}

function formatDateByPattern(date: Date, pattern: string): string {
  return pattern
    .replaceAll('yyyy', String(date.getFullYear()))
    .replaceAll('MM', pad2(date.getMonth() + 1))
    .replaceAll('dd', pad2(date.getDate()))
    .replaceAll('HH', pad2(date.getHours()))
    .replaceAll('hh', pad2(get12Hour(date)))
    .replaceAll('mm', pad2(date.getMinutes()))
    .replaceAll('ss', pad2(date.getSeconds()))
}

function formatTimeByPrecision(date: Date, precision: DatePickerTimePrecision, use12Hours: boolean): string {
  const hour = use12Hours
    ? get12Hour(date)
    : date.getHours()
  const hourText = pad2(hour)

  if (precision === 'hour') return `${hourText}:00`

  if (precision === 'second') return `${hourText}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`

  return `${hourText}:${pad2(date.getMinutes())}`
}

function getDatePickerPeriod(date: Date, options: DatePickerFormatOptions): string {
  const isPm = date.getHours() >= 12

  if (isPm) return options.pmLabel ?? getDefaultPmLabel(options.locale)

  return options.amLabel ?? getDefaultAmLabel(options.locale)
}

function getDefaultDateFormat(locale?: string): string {
  return isCjkLocale(locale)
    ? 'yyyy 年 MM 月 dd 日'
    : 'yyyy-MM-dd'
}

function removeYearFromDateFormat(options: DatePickerFormatOptions): string {
  const dateFormat = options.dateFormat ?? getDefaultDateFormat(options.locale)
  const yearIndex = dateFormat.indexOf('yyyy')

  if (yearIndex < 0) return dateFormat

  const beforeYear = dateFormat.slice(0, yearIndex)
  const afterYear = dateFormat.slice(yearIndex + 'yyyy'.length)

  if (!beforeYear) {
    return afterYear.replace(/^\s*(?:年)?\s*[-/.]?\s*/, '')
  }

  return `${beforeYear.replace(/[\s\-/.年]+$/, '')}${afterYear.replace(/^\s*/, '')}`
}

function getDefaultAmLabel(locale?: string): string {
  const localeType = getLocaleType(locale)
  if (localeType === 'ja') return '午前'

  if (localeType === 'zh') return '上午'

  return 'AM'
}

function getDefaultPmLabel(locale?: string): string {
  const localeType = getLocaleType(locale)
  if (localeType === 'ja') return '午後'

  if (localeType === 'zh') return '下午'

  return 'PM'
}

function getDatePickerPeriodPosition(options: DatePickerFormatOptions): 'left' | 'right' {
  if (options.periodPosition) return options.periodPosition

  return getLocaleType(options.locale) === 'en'
    ? 'right'
    : 'left'
}

function isCjkLocale(locale?: string): boolean {
  return getLocaleType(locale) !== 'en'
}

function getLocaleType(locale?: string): 'zh' | 'ja' | 'en' {
  if (locale?.startsWith('zh')) return 'zh'

  if (locale?.startsWith('ja')) return 'ja'

  return 'en'
}

function get12Hour(date: Date): number {
  return date.getHours() % 12 || 12
}

function isSameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function isSameYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}
