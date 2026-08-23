/**
 * DatePicker 相关常量
 */

/**
 * 标记元素为 DatePicker 的一部分，点击时不应触发「点击外部关闭」逻辑
 * 用于：TimePicker 中的 Popover/Cascader、Calendar 底部「Add Time」按钮区域等浮层内容
 */
export const DATA_DATE_PICKER_IGNORE = 'data-date-picker-ignore'

/** 标记快捷时刻浮层的现有布局触发区域 */
export const DATA_QUICK_TIME_TRIGGER = 'data-quick-time-trigger'

/** 标记不应触发快捷时刻浮层的精确时间控件 */
export const DATA_QUICK_TIME_IGNORE = 'data-quick-time-ignore'

/** 标记单个 TimePicker 内的分段输入导航范围 */
export const DATA_TIME_SEGMENT_CONTROL = 'data-time-segment-control'

/** 标记 DateTimeSpanPicker 内可跨 Start / End 导航的时间组 */
export const DATA_TIME_SEGMENT_GROUP = 'data-time-segment-group'

export const CONTAINER_CLASSNAME = 'bg-background rounded-[20px] shadow-card p-6'
