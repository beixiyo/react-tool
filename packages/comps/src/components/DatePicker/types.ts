import type { ReactNode } from 'react'

/** 日期精度类型（DatePicker 只支持日期+时间精度，选择年月请使用 MonthPicker/YearPicker） */
export type DatePrecision = 'day' | 'hour' | 'minute' | 'second'

/** 通用选择器 Ref 接口 */
export interface PickerRef {
  open: () => void
  close: () => void
}

/** 共享的 UI 属性 */
export interface SharedUIProps {
  /** 自定义单元格渲染 */
  renderCell?: (date: Date) => ReactNode
  /** 自定义向前切换图标 */
  prevIcon?: ReactNode
  /** 自定义向后切换图标 */
  nextIcon?: ReactNode
  /** 自定义超级向前切换图标（切换年份） */
  superPrevIcon?: ReactNode
  /** 自定义超级向后切换图标（切换年份） */
  superNextIcon?: ReactNode
  /** 自定义时间图标 */
  timeIcon?: ReactNode
  /** 额外的页脚 */
  extraFooter?: ReactNode
}

export interface DatePickerRef extends PickerRef {}
export interface MonthPickerRef extends PickerRef {}
export interface YearPickerRef extends PickerRef {}
export interface DateRangePickerRef extends PickerRef {}

/** Trigger 渲染上下文的公共字段（DatePicker / DateRangePicker 共用） */
export interface BasePickerTriggerContext {
  /** 是否展开下拉 */
  isOpen: boolean
  /** 是否禁用 */
  disabled: boolean
  /** 是否有错误 */
  error: boolean
  /** 打开下拉 */
  open: () => void
  /** 关闭下拉 */
  close: () => void
  /** 清除选择 */
  clear: (e: React.MouseEvent) => void
  /** 是否显示清除按钮 */
  showClear: boolean
  /** 当前是否可显示清除按钮 */
  canShowClear: boolean
  /** 是否使用 12 小时制且显示时间 */
  use12Hours: boolean
  /** AM/PM 显示位置 */
  periodPosition: 'left' | 'right'
  /** 输入框类名 */
  inputClassName?: string
  /** 自定义图标 */
  icon?: ReactNode
  /** 自定义清除图标 */
  clearIcon?: ReactNode
}

/** DatePicker 自定义 trigger 渲染的上下文 */
export interface DatePickerTriggerContext extends BasePickerTriggerContext {
  /** 当前选中的日期 */
  value: Date | null
  /** 格式化后的显示文本 */
  displayValue: string
  /** 占位符 */
  placeholder: string
  /** AM/PM 文本 */
  ampm: string
  /** 时间部分显示文本 */
  timeValue: string
}

/** DateRangePicker 自定义 trigger 渲染的上下文 */
export interface DateRangePickerTriggerContext extends BasePickerTriggerContext {
  /** 当前选中的范围 */
  value: { start: Date | null, end: Date | null }
  /** 开始日期格式化显示 */
  startValue: string
  /** 结束日期格式化显示 */
  endValue: string
  /** 开始日期占位符 */
  startPlaceholder: string
  /** 结束日期占位符 */
  endPlaceholder: string
  /** 分隔符 */
  separator: string
  /** 当前正在编辑的类型 */
  activeType: 'start' | 'end' | null
  /** 点击输入区域（切换编辑 start/end） */
  onInputClick: (type: 'start' | 'end') => void
  /** 开始日期 AM/PM */
  startAmpm: string
  /** 结束日期 AM/PM */
  endAmpm: string
  /** 开始时间显示文本 */
  startTimeValue: string
  /** 结束时间显示文本 */
  endTimeValue: string
}

/** 基础选择器属性，包含所有选择器共有的 UI 和交互属性 */
export interface BasePickerProps extends SharedUIProps {
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
  /** 点击日期后是否自动关闭（仅 precision 为 day 时有效） */
  closeOnSelect?: boolean
  /** 分钟选择步进 */
  minuteStep?: number
  /** 自定义图标（替换默认日历图标） */
  icon?: ReactNode
  /** 自定义清除图标 */
  clearIcon?: ReactNode
  /** 是否使用 12 小时制 */
  use12Hours?: boolean
}

/** 带有值的选择器属性 */
export interface PickerProps<T, AllowNull extends boolean = true> extends BasePickerProps {
  /** 当前选中的值 */
  value?: AllowNull extends true ? T | null : T
  /** 默认值 */
  defaultValue?: AllowNull extends true ? T | null : T
  /** 值变更回调 */
  onChange?: (val: AllowNull extends true ? T | null : T) => void
  /** 确认回调（仅在数据改变且关闭时触发） */
  onConfirm?: (val: AllowNull extends true ? T | null : T) => void
}

/** 日历基础属性 */
export interface BaseCalendarProps {
  /** 当前显示的月份/年份 */
  currentMonth: Date
  /** 最小日期 */
  minDate?: Date
  /** 最大日期 */
  maxDate?: Date
  /** 自定义类名 */
  className?: string
}

/** 范围选择通用属性 */
export interface RangeSelectionProps {
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

export interface DatePickerProps extends PickerProps<Date> {
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 日历类名 */
  calendarClassName?: string
  /** 周起始日（0 = 周日, 1 = 周一） */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 日期精度，默认为 'day' */
  precision?: DatePrecision
  /**
   * 年份范围（当前年份前后各多少年）
   * @default 50
   */
  yearRange?: number
  /** 点击「添加时间」时的回调（仅 precision 为 day 时展示 Add Time 按钮） */
  onAddTime?: () => void
  /** 自定义渲染 trigger，传入完整上下文，返回自定义 JSX */
  renderTrigger?: (context: DatePickerTriggerContext) => ReactNode
}

export interface CalendarProps extends BaseCalendarProps, RangeSelectionProps, SharedUIProps {
  /** 月份变更回调 */
  onCurrentMonthChange?: (date: Date) => void
  /** 选中的日期 */
  selectedDate?: Date | null
  /** 日期选择回调 */
  onSelect?: (date: Date) => void
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 周起始日 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 日期精度 */
  precision?: DatePrecision
  /** 是否使用 12 小时制 */
  use12Hours?: boolean
  /** 分钟选择步进 */
  minuteStep?: number
  /** 时间变更回调（当 precision 包含时间时使用） */
  onTimeChange?: (date: Date) => void
  /** 确认回调 */
  onConfirm?: () => void
  /** 点击「添加时间」时的回调（仅 precision 为 day 时展示 Add Time 按钮） */
  onAddTime?: () => void
  onMouseLeave?: () => void
  /**
   * 年份范围
   * @default 20
   */
  yearRange?: number
}

export interface CalendarHeaderProps extends BaseCalendarProps, SharedUIProps {
  /** 月份变更回调 */
  onMonthChange: (date: Date) => void
  /**
   * 年份范围
   * @default 20
   */
  yearRange?: number
}

export interface CalendarGridProps extends BaseCalendarProps, RangeSelectionProps, SharedUIProps {
  /** 选中的日期 */
  selectedDate?: Date | null
  /** 日期选择回调 */
  onSelect?: (date: Date) => void
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 周起始日 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export interface CalendarCellProps extends SharedUIProps {
  /** 日期 */
  date: Date
  /** 是否为当前月份 */
  isCurrentMonth: boolean
  /** 是否为前一个月 */
  isPreviousMonth?: boolean
  /** 是否为后一个月 */
  isNextMonth?: boolean
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

export interface MonthPickerProps extends PickerProps<Date> {
  /** 禁用月份函数 */
  disabledMonth?: (date: Date) => boolean
}

export interface YearPickerProps extends PickerProps<Date> {
  /** 禁用年份函数 */
  disabledYear?: (date: Date) => boolean
  /**
   * 年份范围（当前年份前后各多少年）
   * @default 10
   */
  yearRange?: number
}

export interface MonthGridProps extends Pick<BaseCalendarProps, 'minDate' | 'maxDate'> {
  /** 当前年份 */
  currentYear: Date
  /** 选中的月份 */
  selectedMonth?: Date | null
  /** 月份选择回调 */
  onSelect?: (date: Date) => void
  /** 禁用月份函数 */
  disabledMonth?: (date: Date) => boolean
}

export interface YearGridProps extends Pick<BaseCalendarProps, 'minDate' | 'maxDate'> {
  /** 当前显示的年份 */
  currentYear: Date
  /** 选中的年份 */
  selectedYear?: Date | null
  /** 年份选择回调 */
  onSelect?: (date: Date) => void
  /** 禁用年份函数 */
  disabledYear?: (date: Date) => boolean
  /**
   * 年份范围
   * @default 10
   */
  yearRange?: number
}

export interface DateRangePickerProps extends PickerProps<{ start: Date | null, end: Date | null }, false> {
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean
  /** 日历类名 */
  calendarClassName?: string
  /** 周起始日（0 = 周日, 1 = 周一） */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 开始日期占位符 */
  startPlaceholder?: string
  /** 结束日期占位符 */
  endPlaceholder?: string
  /** 范围分隔符 */
  separator?: string
  /** 日期精度，默认为 'day' */
  precision?: DatePrecision
  /** 是否使用 12 小时制 */
  use12Hours?: boolean
  /** 点击「添加时间」时的回调（仅 precision 为 day 时展示 Add Time 按钮） */
  onAddTime?: () => void
  /** 自定义渲染 trigger，传入完整上下文，返回自定义 JSX */
  renderTrigger?: (context: DateRangePickerTriggerContext) => ReactNode
}

/** 时间选择器属性 */
export interface TimePickerProps extends Pick<BasePickerProps, 'disabled' | 'className' | 'use12Hours' | 'timeIcon'> {
  /** 当前时间（Date 对象） */
  value: Date
  /** 时间变更回调 */
  onChange: (date: Date) => void
  /** 精度（决定显示哪些时间单位） */
  precision: DatePrecision
  /** 确认回调 */
  onConfirm?: () => void
  /** 是否在组件内显示确认按钮（为 false 时由外部 footer 统一展示确认） */
  showConfirm?: boolean
  /** 分钟选择步进 */
  minuteStep?: number
}
