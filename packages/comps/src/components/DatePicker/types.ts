import type { ReactNode } from 'react'

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
}

export interface CalendarProps {
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
  /** 自定义类名 */
  className?: string
  /** 周起始日 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
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
  /** 点击回调 */
  onClick?: () => void
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
