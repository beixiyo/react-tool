import type { ReactNode } from 'react'

/** 日期精度类型（DatePicker 只支持日期+时间精度，选择年月请使用 MonthPicker/YearPicker） */
export type DatePrecision = 'day' | 'hour' | 'minute' | 'second'

export interface DatePickerRef {
  open: () => void
  close: () => void
}

export interface DatePickerProps {
  /** 当前选中的日期 */
  value?: Date | null
  /** 默认值 */
  defaultValue?: Date | null
  /** 值变更回调 */
  onChange?: (date: Date | null) => void
  /** 确认回调（仅在数据改变且关闭时触发） */
  onConfirm?: (date: Date | null) => void
  /** 点击外部关闭回调 */
  onClickOutside?: () => void
  /** 打开状态（受控模式） */
  open?: boolean
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void
  /** 自定义触发器元素，如果不提供则使用默认输入框 */
  trigger?: ReactNode
  /** 触发器点击回调 */
  onTriggerClick?: () => void
  /** 下拉面板的定位方式 */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
  /** 下拉面板的偏移量 */
  offset?: number
  /** 日期格式 */
  format?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 自定义类名 */
  className?: string
  /** 输入框类名 */
  inputClassName?: string
  /** 下拉面板类名 */
  dropdownClassName?: string
  /** 日历类名 */
  calendarClassName?: string
  /** 表单相关属性 */
  name?: string
  error?: boolean
  errorMessage?: string
  /** 是否显示清除按钮 */
  showClear?: boolean
  /** 周起始日（0 = 周日, 1 = 周一） */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 日期精度，默认为 'day' */
  precision?: DatePrecision
  /** 自定义图标（替换默认日历图标） */
  icon?: ReactNode
}

export interface CalendarProps {
  /** 当前显示的月份 */
  currentMonth: Date
  /** 月份变更回调 */
  onCurrentMonthChange?: (date: Date) => void
  /** 选中的日期 */
  selectedDate?: Date | null
  /** 日期选择回调 */
  onSelect?: (date: Date) => void
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 自定义类名 */
  className?: string
  /** 周起始日 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 日期范围选择模式 */
  rangeMode?: boolean
  /** 选中的日期范围 */
  selectedRange?: { start: Date | null, end: Date | null }
  /** 当前正在编辑的范围类型 */
  selectingType?: 'start' | 'end'
  /** 正在编辑的类型变更回调 */
  onSelectingTypeChange?: (type: 'start' | 'end') => void
  /** 临时选择的日期（用于范围选择时） */
  tempDate?: Date | null
  /** 日期悬停回调（用于范围选择预览） */
  onDateHover?: (date: Date | null) => void
  /** 日期精度 */
  precision?: DatePrecision
  /** 时间变更回调（当 precision 包含时间时使用） */
  onTimeChange?: (date: Date) => void
}

export interface CalendarHeaderProps {
  /** 当前显示的月份 */
  currentMonth: Date
  /** 月份变更回调 */
  onMonthChange: (date: Date) => void
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 自定义类名 */
  className?: string
}

export interface CalendarGridProps {
  /** 当前显示的月份 */
  currentMonth: Date
  /** 选中的日期 */
  selectedDate?: Date | null
  /** 日期选择回调 */
  onSelect?: (date: Date) => void
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 周起始日 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 日期范围选择模式 */
  rangeMode?: boolean
  /** 选中的日期范围 */
  selectedRange?: { start: Date | null, end: Date | null }
  /** 当前正在编辑的范围类型 */
  selectingType?: 'start' | 'end'
  /** 正在编辑的类型变更回调 */
  onSelectingTypeChange?: (type: 'start' | 'end') => void
  /** 临时选择的日期（用于范围选择时） */
  tempDate?: Date | null
  /** 日期悬停回调（用于范围选择预览） */
  onDateHover?: (date: Date | null) => void
}

export interface CalendarCellProps {
  /** 日期 */
  date: Date
  /** 是否为当前月份 */
  isCurrentMonth: boolean
  /** 是否为今天 */
  isToday: boolean
  /** 是否选中 */
  isSelected: boolean
  /** 是否禁用 */
  isDisabled: boolean
  /** 是否为范围选择的开始日期（已确认） */
  isRangeStart?: boolean
  /** 是否为范围选择的结束日期（已确认） */
  isRangeEnd?: boolean
  /** 是否为临时选择的开始日期 */
  isTempStart?: boolean
  /** 是否为临时选择的结束日期 */
  isTempEnd?: boolean
  /** 是否在范围内 */
  isInRange?: boolean
  /** 点击回调 */
  onClick?: () => void
  /** 鼠标悬停回调 */
  onMouseEnter?: () => void
  /** 自定义类名 */
  className?: string
}

export interface MonthPickerRef {
  open: () => void
  close: () => void
}

export interface MonthPickerProps {
  /** 当前选中的月份（Date 对象，设置为该月第一天） */
  value?: Date | null
  /** 默认值 */
  defaultValue?: Date | null
  /** 值变更回调 */
  onChange?: (date: Date | null) => void
  /** 确认回调（仅在数据改变且关闭时触发） */
  onConfirm?: (date: Date | null) => void
  /** 点击外部关闭回调 */
  onClickOutside?: () => void
  /** 打开状态（受控模式） */
  open?: boolean
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void
  /** 自定义触发器元素 */
  trigger?: ReactNode
  /** 触发器点击回调 */
  onTriggerClick?: () => void
  /** 下拉面板的定位方式 */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
  /** 下拉面板的偏移量 */
  offset?: number
  /** 日期格式 */
  format?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 禁用月份函数 */
  disabledMonth?: (date: Date) => boolean
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 自定义类名 */
  className?: string
  /** 输入框类名 */
  inputClassName?: string
  /** 下拉面板类名 */
  dropdownClassName?: string
  /** 表单相关属性 */
  name?: string
  error?: boolean
  errorMessage?: string
  /** 是否显示清除按钮 */
  showClear?: boolean
  /** 自定义图标（替换默认日历图标） */
  icon?: ReactNode
}

export interface YearPickerRef {
  open: () => void
  close: () => void
}

export interface YearPickerProps {
  /** 当前选中的年份（Date 对象，设置为该年第一天） */
  value?: Date | null
  /** 默认值 */
  defaultValue?: Date | null
  /** 值变更回调 */
  onChange?: (date: Date | null) => void
  /** 确认回调（仅在数据改变且关闭时触发） */
  onConfirm?: (date: Date | null) => void
  /** 点击外部关闭回调 */
  onClickOutside?: () => void
  /** 打开状态（受控模式） */
  open?: boolean
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void
  /** 自定义触发器元素 */
  trigger?: ReactNode
  /** 触发器点击回调 */
  onTriggerClick?: () => void
  /** 下拉面板的定位方式 */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
  /** 下拉面板的偏移量 */
  offset?: number
  /** 日期格式 */
  format?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 禁用年份函数 */
  disabledYear?: (date: Date) => boolean
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 年份范围（当前年份前后各多少年） */
  yearRange?: number
  /** 自定义类名 */
  className?: string
  /** 输入框类名 */
  inputClassName?: string
  /** 下拉面板类名 */
  dropdownClassName?: string
  /** 表单相关属性 */
  name?: string
  error?: boolean
  errorMessage?: string
  /** 是否显示清除按钮 */
  showClear?: boolean
  /** 自定义图标（替换默认日历图标） */
  icon?: ReactNode
}

export interface MonthGridProps {
  /** 当前年份 */
  currentYear: Date
  /** 选中的月份 */
  selectedMonth?: Date | null
  /** 月份选择回调 */
  onSelect?: (date: Date) => void
  /** 禁用月份函数 */
  disabledMonth?: (date: Date) => boolean
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
}

export interface YearGridProps {
  /** 当前显示的年份 */
  currentYear: Date
  /** 选中的年份 */
  selectedYear?: Date | null
  /** 年份选择回调 */
  onSelect?: (date: Date) => void
  /** 禁用年份函数 */
  disabledYear?: (date: Date) => boolean
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 年份范围 */
  yearRange?: number
}

export interface DateRangePickerRef {
  open: () => void
  close: () => void
}

export interface DateRangePickerProps {
  /** 当前选中的日期范围 */
  value?: { start: Date | null, end: Date | null }
  /** 默认值 */
  defaultValue?: { start: Date | null, end: Date | null }
  /** 值变更回调 */
  onChange?: (range: { start: Date | null, end: Date | null }) => void
  /** 确认回调（仅在数据改变且关闭时触发） */
  onConfirm?: (range: { start: Date | null, end: Date | null }) => void
  /** 点击外部关闭回调 */
  onClickOutside?: () => void
  /** 打开状态（受控模式） */
  open?: boolean
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void
  /** 自定义触发器元素，如果不提供则使用默认输入框 */
  trigger?: ReactNode
  /** 触发器点击回调 */
  onTriggerClick?: () => void
  /** 下拉面板的定位方式 */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
  /** 下拉面板的偏移量 */
  offset?: number
  /** 日期格式 */
  format?: string
  /** 占位符 */
  placeholder?: string
  /** 开始日期占位符 */
  startPlaceholder?: string
  /** 结束日期占位符 */
  endPlaceholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 自定义类名 */
  className?: string
  /** 输入框类名 */
  inputClassName?: string
  /** 下拉面板类名 */
  dropdownClassName?: string
  /** 日历类名 */
  calendarClassName?: string
  /** 表单相关属性 */
  name?: string
  error?: boolean
  errorMessage?: string
  /** 是否显示清除按钮 */
  showClear?: boolean
  /** 周起始日（0 = 周日, 1 = 周一） */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 范围分隔符 */
  separator?: string
  /** 日期精度，默认为 'day' */
  precision?: DatePrecision
  /** 自定义图标（替换默认日历图标） */
  icon?: ReactNode
}

/** 时间选择器属性 */
export interface TimePickerProps {
  /** 当前时间（Date 对象） */
  value: Date
  /** 时间变更回调 */
  onChange: (date: Date) => void
  /** 精度（决定显示哪些时间单位） */
  precision: DatePrecision
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
}
