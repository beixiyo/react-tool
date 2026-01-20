'use client'

import type { TimePickerProps } from './types'
import { getHours, getMinutes, getSeconds, setHours, setMinutes, setSeconds } from 'date-fns'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'

export const TimePicker = memo<TimePickerProps>(({
  value,
  onChange,
  precision = 'day',
  disabled = false,
  className,
}) => {
  const [hours, setHoursState] = useState(() => getHours(value))
  const [minutes, setMinutesState] = useState(() => getMinutes(value))
  const [seconds, setSecondsState] = useState(() => getSeconds(value))

  const hoursRef = useRef<HTMLDivElement>(null)
  const minutesRef = useRef<HTMLDivElement>(null)
  const secondsRef = useRef<HTMLDivElement>(null)

  /** 同步外部值变化 */
  useEffect(() => {
    setHoursState(getHours(value))
    setMinutesState(getMinutes(value))
    setSecondsState(getSeconds(value))
  }, [value])

  /** 判断是否需要显示时间选择器 */
  const showHour = precision === 'hour' || precision === 'minute' || precision === 'second'
  const showMinute = precision === 'minute' || precision === 'second'
  const showSecond = precision === 'second'

  /** 生成选项数组 */
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
  const secondOptions = Array.from({ length: 60 }, (_, i) => i)

  /** 更新日期对象 */
  const updateDate = useCallback((newHours: number, newMinutes: number, newSeconds: number) => {
    let newDate = value
    if (showHour) {
      newDate = setHours(newDate, newHours)
    }
    if (showMinute) {
      newDate = setMinutes(newDate, newMinutes)
    }
    if (showSecond) {
      newDate = setSeconds(newDate, newSeconds)
    }
    onChange(newDate)
  }, [value, onChange, showHour, showMinute, showSecond])

  /** 处理小时变化 */
  const handleHourChange = useCallback((hour: number) => {
    setHoursState(hour)
    /** 根据 precision 决定更新哪些字段 */
    const newMinutes = showMinute
      ? minutes
      : 0
    const newSeconds = showSecond
      ? seconds
      : 0
    updateDate(hour, newMinutes, newSeconds)
  }, [minutes, seconds, updateDate, showMinute, showSecond])

  /** 处理分钟变化 */
  const handleMinuteChange = useCallback((minute: number) => {
    setMinutesState(minute)
    /** 根据 precision 决定更新哪些字段 */
    const newSeconds = showSecond
      ? seconds
      : 0
    updateDate(hours, minute, newSeconds)
  }, [hours, seconds, updateDate, showSecond])

  /** 处理秒变化 */
  const handleSecondChange = useCallback((second: number) => {
    setSecondsState(second)
    updateDate(hours, minutes, second)
  }, [hours, minutes, updateDate])

  /** 滚动到选中项 */
  const scrollToSelected = useCallback((ref: React.RefObject<HTMLDivElement | null>, selected: number) => {
    if (ref.current) {
      const item = ref.current.querySelector(`[data-value="${selected}"]`)
      if (item) {
        item.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [])

  useEffect(() => {
    if (showHour && hoursRef.current) {
      scrollToSelected(hoursRef, hours)
    }
  }, [showHour, hours, scrollToSelected])

  useEffect(() => {
    if (showMinute && minutesRef.current) {
      scrollToSelected(minutesRef, minutes)
    }
  }, [showMinute, minutes, scrollToSelected])

  useEffect(() => {
    if (showSecond && secondsRef.current) {
      scrollToSelected(secondsRef, seconds)
    }
  }, [showSecond, seconds, scrollToSelected])

  /** 如果不需要显示时间选择器，返回 null */
  if (!showHour) {
    return null
  }

  /** 渲染选择器列 */
  const renderPickerColumn = (
    ref: React.RefObject<HTMLDivElement | null>,
    options: number[],
    selected: number,
    onChange: (value: number) => void,
    label: string,
  ) => {
    return (
      <div className="flex flex-col items-center w-12">
        <div className="text-xs text-textSecondary mb-1">{ label }</div>
        <div
          ref={ ref }
          className={ cn(
            'h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent',
            'scroll-smooth w-full',
          ) }
          style={ {
            scrollbarWidth: 'thin',
          } }
        >
          { options.map(option => (
            <div
              key={ option }
              data-value={ option }
              className={ cn(
                'px-2 py-1 text-sm cursor-pointer text-center rounded-lg',
                'hover:bg-brand hover:text-buttonTertiary transition-all',
                {
                  'bg-buttonPrimary text-buttonTertiary font-medium': option === selected,
                  'text-textPrimary': option !== selected,
                  'opacity-50 cursor-not-allowed': disabled,
                },
              ) }
              onClick={ () => !disabled && onChange(option) }
            >
              { String(option).padStart(2, '0') }
            </div>
          )) }
        </div>
      </div>
    )
  }

  return (
    <div className={ cn('flex items-center gap-2 px-3 py-4 border-l border-border', className) }>
      { showHour && renderPickerColumn(
        hoursRef,
        hourOptions,
        hours,
        handleHourChange,
        '时',
      ) }
      { showMinute && renderPickerColumn(
        minutesRef,
        minuteOptions,
        minutes,
        handleMinuteChange,
        '分',
      ) }
      { showSecond && renderPickerColumn(
        secondsRef,
        secondOptions,
        seconds,
        handleSecondChange,
        '秒',
      ) }
    </div>
  )
})

TimePicker.displayName = 'TimePicker'
