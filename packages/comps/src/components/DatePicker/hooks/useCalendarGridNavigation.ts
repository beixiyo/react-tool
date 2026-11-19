import { addDays, addMonths, addYears, isSameMonth, startOfMonth } from 'date-fns'
import { useLatestCallback } from 'hooks'
import type { KeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getWeekStart, isDateToday, isSameDate } from '../utils'
import { formatDate } from '../utils/value'

/** 跳过禁用日期时的最大探测步数，避免禁用规则覆盖全部日期时无限循环 */
const MAX_DISABLED_SKIP = 366

/**
 * 日历日期网格的键盘导航（WAI-ARIA Date Picker Grid 模式）
 *
 * - roving tabindex：网格内只有一个日期可被 Tab 聚焦
 * - 方向键 ±1 / ±7 天，Home / End 到周首 / 周末，PageUp / PageDown 切月，Shift 切年
 * - 目标日期禁用时沿移动方向寻找下一个可用日期；跨月时通过 `onMonthChange` 通知上层切换月份
 * - 键盘只绑定在网格自身元素上，Enter / Space 由日期 button 原生触发点击
 */
export function useCalendarGridNavigation({
  currentMonth,
  calendarDays,
  selectedDate,
  isDisabled,
  weekStartsOn,
  onMonthChange,
  onActiveDateChange,
}: UseCalendarGridNavigationOptions) {
  const [focusedDate, setFocusedDate] = useState<Date | null>(null)
  const cellRefs = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocusRef = useRef(false)

  /** 当前可 Tab 聚焦的日期：键盘焦点 > 选中日期 > 今天 > 当月首个可用日期 */
  const activeDate = useMemo(() => {
    const isUsable = (date: Date | null | undefined): date is Date => !!date && isSameMonth(date, currentMonth) && !isDisabled(date)

    if (isUsable(focusedDate)) return focusedDate
    if (isUsable(selectedDate)) return selectedDate

    const today = calendarDays.find((date) => isDateToday(date))
    if (isUsable(today)) return today

    return calendarDays.find((date) => isUsable(date)) ?? null
  }, [calendarDays, currentMonth, focusedDate, isDisabled, selectedDate])

  const activeKey = activeDate
    ? formatDate(activeDate)
    : null

  useEffect(() => {
    if (!pendingFocusRef.current || !activeKey) return
    const cell = cellRefs.current.get(activeKey)
    if (!cell) return

    pendingFocusRef.current = false
    cell.focus()
  }, [activeKey, calendarDays])

  /** 从 start 开始按 step 寻找第一个可用日期，可选 bound 限定搜索边界（含） */
  const findEnabled = (start: Date, step: 1 | -1 | 7 | -7, bound?: Date) => {
    let date = start
    for (let i = 0; i < MAX_DISABLED_SKIP; i++) {
      if (
        bound && (step > 0
          ? date > bound
          : date < bound)
      ) {
        return null
      }
      if (!isDisabled(date)) return date
      date = addDays(date, step)
    }
    return null
  }

  const getTargetDate = (origin: Date, event: KeyboardEvent<HTMLElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        return findEnabled(addDays(origin, -1), -1)
      case 'ArrowRight':
        return findEnabled(addDays(origin, 1), 1)
      case 'ArrowUp':
        return findEnabled(addDays(origin, -7), -7)
      case 'ArrowDown':
        return findEnabled(addDays(origin, 7), 7)
      case 'Home': {
        const weekStart = getWeekStart(origin, weekStartsOn)
        return findEnabled(weekStart, 1, addDays(weekStart, 6))
      }
      case 'End': {
        const weekStart = getWeekStart(origin, weekStartsOn)
        return findEnabled(addDays(weekStart, 6), -1, weekStart)
      }
      case 'PageUp':
        return findEnabled(
          event.shiftKey
            ? addYears(origin, -1)
            : addMonths(origin, -1),
          -1,
        )
      case 'PageDown':
        return findEnabled(
          event.shiftKey
            ? addYears(origin, 1)
            : addMonths(origin, 1),
          1,
        )
      default:
        return undefined
    }
  }

  const onKeyDown = useLatestCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || !activeDate) return

    const target = getTargetDate(activeDate, event)
    /** undefined 表示不处理该按键，交给默认行为 */
    if (target === undefined) return

    event.preventDefault()
    if (!target || isSameDate(target, activeDate)) return

    pendingFocusRef.current = true
    setFocusedDate(target)
    if (!isSameMonth(target, currentMonth)) onMonthChange?.(startOfMonth(target))
    onActiveDateChange?.(target)
  })

  /** 返回单元格 button 需要的 roving 属性 */
  const getCellNavProps = (date: Date) => {
    const key = formatDate(date)
    return {
      tabIndex: key === activeKey
        ? 0
        : -1,
      buttonRef: (node: HTMLButtonElement | null) => {
        if (node) cellRefs.current.set(key, node)
        else cellRefs.current.delete(key)
      },
      onFocus: () => {
        if (!focusedDate || !isSameDate(focusedDate, date)) setFocusedDate(date)
      },
    }
  }

  return {
    activeDate,
    onKeyDown,
    getCellNavProps,
  }
}

export interface UseCalendarGridNavigationOptions {
  /** 当前显示月份 */
  currentMonth: Date
  /** 网格中渲染的全部日期（含前后月补位） */
  calendarDays: Date[]
  /** 已选中日期，作为初始可聚焦日期 */
  selectedDate?: Date | null
  /** 日期是否禁用（需包含 min / max 约束） */
  isDisabled: (date: Date) => boolean
  /** 周起始日，决定 Home / End 的目标 */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 键盘移动跨月时请求切换显示月份 */
  onMonthChange?: (month: Date) => void
  /** 键盘移动到新日期后回调，可用于范围预览 */
  onActiveDateChange?: (date: Date) => void
}
