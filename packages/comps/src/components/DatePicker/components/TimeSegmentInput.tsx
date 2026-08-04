'use client'

import type { DatePrecision } from '../types'
import { getHours, getMinutes, getSeconds, setHours, setMinutes, setSeconds } from 'date-fns'
import { useLatestCallback, useWheelDirection } from 'hooks'
import { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { useT } from '../../../i18n'

/** 可键盘编辑的时、分、秒分段输入，不负责时间之外的业务校验。 */
export const TimeSegmentInput = memo<TimeSegmentInputProps>(({
  value,
  onChange,
  precision,
  use12Hours,
  disabled,
  enableTimeInputWheel = true,
  error = false,
}) => {
  const t = useT()
  const hour = getHours(value)
  const minute = getMinutes(value)
  const second = getSeconds(value)

  const displayHour = use12Hours
    ? hour % 12 || 12
    : hour

  const showMinute = precision === 'minute' || precision === 'second'
  const showSecond = precision === 'second'

  const segmentValues = useMemo(() => ({
    hour: pad(displayHour),
    minute: pad(minute),
    second: pad(second),
  }), [displayHour, minute, second])

  const [drafts, setDrafts] = useState(segmentValues)
  const [invalidSegment, setInvalidSegment] = useState<TimeSegment | null>(null)

  const inputRefs = useRef<Partial<Record<TimeSegment, HTMLInputElement | null>>>({})
  const autoCommittedBlurRef = useRef<TimeSegment | null>(null)
  const currentValueRef = useRef(value)
  const focusedSegmentRef = useRef<TimeSegment | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const segments = useMemo<TimeSegment[]>(() => [
    'hour',
    ...(showMinute
      ? ['minute' as const]
      : []),
    ...(showSecond
      ? ['second' as const]
      : []),
  ], [showMinute, showSecond])

  const segmentLabels = {
    hour: t('datePicker.hour'),
    minute: t('datePicker.minute'),
    second: t('datePicker.second'),
  }

  useEffect(() => {
    currentValueRef.current = value
    setDrafts(segmentValues)
  }, [segmentValues, value])

  const focusSegment = useLatestCallback((segment: TimeSegment | undefined) => {
    inputRefs.current[segment ?? 'hour']?.focus()
  })

  const updateValue = useLatestCallback((segment: TimeSegment, nextValue: number) => {
    let nextDate: Date
    if (segment === 'hour') {
      const actualHour = use12Hours
        ? hour >= 12
          ? nextValue === 12
            ? 12
            : nextValue + 12
          : nextValue === 12
            ? 0
            : nextValue
        : nextValue
      nextDate = setHours(value, actualHour)
    }
    else if (segment === 'minute') {
      nextDate = setMinutes(value, nextValue)
    }

    else {
      nextDate = setSeconds(value, nextValue)
    }

    currentValueRef.current = nextDate
    onChange(nextDate)
  })

  const changeFocusedSegmentByWheel = useLatestCallback((direction: 1 | -1) => {
    const focusedSegment = focusedSegmentRef.current
    if (!focusedSegment)
      return

    const nextDate = changeTimeSegment(currentValueRef.current, focusedSegment, direction)
    currentValueRef.current = nextDate
    setDrafts(getSegmentValues(nextDate, use12Hours))
    setInvalidSegment(null)
    onChange(nextDate)
  })

  useWheelDirection<WheelEvent>({
    onScrollUp: () => changeFocusedSegmentByWheel(1),
    onScrollDown: () => changeFocusedSegmentByWheel(-1),
  }, {
    enable: enableTimeInputWheel && !disabled,
    threshold: 0,
    target: rootRef,
    when: (event) => {
      const input = event.target instanceof HTMLInputElement
        ? event.target
        : null
      const segment = input?.dataset.timeSegment as TimeSegment | undefined
      return !!segment && focusedSegmentRef.current === segment && document.activeElement === input
    },
  })

  const commit = useLatestCallback((segment: TimeSegment, rawValue: string, shouldFocusNext: boolean) => {
    if (!rawValue) {
      setDrafts(current => ({
        ...current,
        [segment]: segmentValues[segment],
      }))
      if (shouldFocusNext)
        focusSegment(segments[segments.indexOf(segment) + 1])
      return true
    }

    const nextValue = Number(rawValue)
    const [min, max] = getRange(segment, use12Hours)
    if (!Number.isInteger(nextValue) || nextValue < min || nextValue > max) {
      setDrafts(current => ({
        ...current,
        [segment]: segmentValues[segment],
      }))
      setInvalidSegment(segment)
      return false
    }

    setDrafts(current => ({
      ...current,
      [segment]: pad(nextValue),
    }))
    setInvalidSegment(null)
    updateValue(segment, nextValue)

    const nextSegment = shouldFocusNext
      ? segments[segments.indexOf(segment) + 1]
      : undefined
    if (nextSegment) {
      /**
       * 焦点切换会同步触发当前 input 的 blur，而该 blur 仍捕获上一帧的 drafts。
       * 这里已经提交了两位完整值，所以要跳过这一次过期草稿的二次提交。
       */
      autoCommittedBlurRef.current = segment
      focusSegment(nextSegment)
    }
    return true
  })

  const handleChange = useLatestCallback((segment: TimeSegment, rawValue: string) => {
    const nextDraft = rawValue.replace(/\D/g, '').slice(0, 2)
    if (nextDraft !== rawValue) {
      setDrafts(current => ({
        ...current,
        [segment]: segmentValues[segment],
      }))
      setInvalidSegment(segment)
      return
    }

    setDrafts(current => ({ ...current, [segment]: nextDraft }))
    setInvalidSegment(null)

    if (nextDraft.length === 2)
      commit(segment, nextDraft, true)
  })

  const handleKeyDown = useLatestCallback((event: React.KeyboardEvent<HTMLInputElement>, segment: TimeSegment) => {
    const index = segments.indexOf(segment)
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusSegment(segments[index - 1])
      return
    }

    if (event.key === 'ArrowRight' || event.key === ':') {
      event.preventDefault()
      commit(segment, drafts[segment], true)
    }
  })

  return (
    <div
      ref={ rootRef }
      className={ cn(
        'flex items-center gap-1 text-sm',
        error
          ? 'text-systemRed'
          : 'text-text',
      ) }>
      { segments.map((segment, index) => (
        <Fragment key={ segment }>
          { index > 0 && <span className={ error
            ? 'text-systemRed'
            : 'text-text' }>
            :
          </span> }
          <input
            ref={ (node) => { inputRefs.current[segment] = node } }
            aria-label={ segmentLabels[segment] }
            aria-invalid={ invalidSegment === segment }
            data-time-segment={ segment }
            disabled={ disabled }
            inputMode="numeric"
            maxLength={ 2 }
            value={ drafts[segment] }
            onFocus={ (event) => {
              focusedSegmentRef.current = segment
              setInvalidSegment(null)
              event.currentTarget.select()
            } }
            onChange={ event => handleChange(segment, event.target.value) }
            onKeyDown={ event => handleKeyDown(event, segment) }
            onBlur={ () => {
              focusedSegmentRef.current = null
              if (autoCommittedBlurRef.current === segment) {
                autoCommittedBlurRef.current = null
                return
              }
              if (drafts[segment].length < 2)
                commit(segment, drafts[segment], false)
            } }
            className={ cn(
              'h-6 w-5 rounded-sm bg-transparent p-0 text-center tabular-nums outline-none transition-colors',
              'focus:text-brand focus:outline focus:outline-brand/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              invalidSegment === segment && 'text-systemRed outline outline-systemRed focus:text-systemRed focus:outline-systemRed',
            ) }
          />
        </Fragment>
      )) }
    </div>
  )
})

TimeSegmentInput.displayName = 'TimeSegmentInput'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function getSegmentValues(value: Date, use12Hours: boolean) {
  const hour = getHours(value)
  return {
    hour: pad(use12Hours
      ? hour % 12 || 12
      : hour),
    minute: pad(getMinutes(value)),
    second: pad(getSeconds(value)),
  }
}

function changeTimeSegment(value: Date, segment: TimeSegment, direction: 1 | -1) {
  if (segment === 'hour')
    return setHours(value, modulo(getHours(value) + direction, 24))
  if (segment === 'minute')
    return setMinutes(value, modulo(getMinutes(value) + direction, 60))
  return setSeconds(value, modulo(getSeconds(value) + direction, 60))
}

function modulo(value: number, divisor: number) {
  return (value % divisor + divisor) % divisor
}

function getRange(segment: TimeSegment, use12Hours: boolean): [number, number] {
  if (segment === 'hour') {
    return use12Hours
      ? [1, 12]
      : [0, 23]
  }
  return [0, 59]
}

type TimeSegment = 'hour' | 'minute' | 'second'

type TimeSegmentInputProps = {
  value: Date
  onChange: (value: Date) => void
  precision: DatePrecision
  use12Hours: boolean
  disabled: boolean
  /** 聚焦时允许滚轮调整当前时、分、秒字段，默认开启 */
  enableTimeInputWheel?: boolean
  error?: boolean
}
