'use client'

import type { TimePickerProps } from './types'
import { getHours, getMinutes, getSeconds, setHours, setMinutes, setSeconds } from 'date-fns'
import { Clock } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { Cascader } from '../Cascader'
import { Popover } from '../Popover'
import { DATA_DATE_PICKER_IGNORE } from './constants'

export const TimePicker = memo<TimePickerProps>(({
  value,
  onChange,
  precision = 'day',
  disabled = false,
  className,
  use12Hours = false,
   onConfirm,
  timeIcon,
}) => {
  const t = useT()
  const hours = getHours(value)
  const minutes = getMinutes(value)
  const seconds = getSeconds(value)

  const showHour = precision === 'hour' || precision === 'minute' || precision === 'second'
  const showMinute = precision === 'minute' || precision === 'second'
  const showSecond = precision === 'second'

  const isPM = hours >= 12

  const displayHour = useMemo(() => {
    if (!use12Hours)
      return hours
    const h = hours % 12
    return h === 0 ? 12 : h
  }, [hours, use12Hours])

  const handleHourChange = useCallback((newHour: number) => {
    let finalHour = newHour
    if (use12Hours) {
      if (isPM) {
        finalHour = newHour === 12 ? 12 : newHour + 12
      }
      else {
        finalHour = newHour === 12 ? 0 : newHour
      }
    }
    onChange(setHours(value, finalHour))
  }, [value, onChange, use12Hours, isPM])

  const handleMinuteChange = useCallback((newMinute: number) => {
    onChange(setMinutes(value, newMinute))
  }, [value, onChange])

  const handleSecondChange = useCallback((newSecond: number) => {
    onChange(setSeconds(value, newSecond))
  }, [value, onChange])

  const toggleAMPM = useCallback(() => {
    const newHour = isPM ? hours - 12 : hours + 12
    onChange(setHours(value, newHour))
  }, [hours, isPM, onChange, value])

  const hourOptions = useMemo(() => {
    if (use12Hours) {
      return Array.from({ length: 12 }, (_, i) => i + 1)
    }
    return Array.from({ length: 24 }, (_, i) => i)
  }, [use12Hours])

  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
  const secondOptions = Array.from({ length: 60 }, (_, i) => i)

  const ampmOptions = useMemo(() => [
    { label: t('datePicker.am') || '上午', value: 'AM' },
    { label: t('datePicker.pm') || '下午', value: 'PM' },
  ], [t])

  const periodPosition = t('datePicker.periodPosition') || 'left'

  const ampmSelector = useMemo(() => {
    if (!use12Hours)
      return null
    return (
      <Cascader
        options={ ampmOptions }
        value={ isPM ? 'PM' : 'AM' }
        disabled={ disabled }
        onChange={ (val) => {
          const shouldBePM = val === 'PM'
          if (shouldBePM !== isPM) {
            toggleAMPM()
          }
        } }
        trigger={
          <div className="flex items-center bg-backgroundSecondary rounded-xl px-3 h-[40px] cursor-pointer select-none text-xs font-medium text-textPrimary hover:bg-backgroundTertiary transition-colors">
            { isPM ? (t('datePicker.pm') || '下午') : (t('datePicker.am') || '上午') }
          </div>
        }
        dropdownClassName="!min-w-[80px]"
        dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
      />
    )
  }, [use12Hours, ampmOptions, isPM, disabled, toggleAMPM, t])

  const renderOptionList = (
    options: number[],
    selected: number,
    onSelect: (val: number) => void,
  ) => (
    <div
      className="max-h-60 overflow-y-auto p-2 scrollbar-none"
      { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
    >
      <div className="grid grid-cols-6 gap-1">
        { options.map(option => (
          <div
            key={ option }
            className={ cn(
              'size-8 flex items-center justify-center text-xs rounded-full cursor-pointer transition-all',
              option === selected
                ? 'bg-buttonPrimary text-buttonTertiary'
                : 'hover:bg-backgroundTertiary text-textPrimary',
            ) }
            onClick={ () => onSelect(option) }
          >
            { String(option).padStart(2, '0') }
          </div>
        )) }
      </div>
    </div>
  )

  if (!showHour)
    return null

  return (
    <div className={ cn('flex items-center justify-between', className) }>
      <div className="flex items-center gap-2">
        { periodPosition === 'left' && ampmSelector }

         <div className="flex items-center justify-center bg-backgroundSecondary rounded-xl w-[94px] h-[40px] gap-2">
          { timeIcon || <Clock className="size-3.5 text-textSecondary" /> }

          <div className="flex items-center gap-1 text-sm text-textPrimary">
            <Popover
              trigger="click"
              position="top"
              disabled={ disabled }
              content={ renderOptionList(hourOptions, displayHour, handleHourChange) }
            >
              <div
                className="cursor-pointer hover:text-brand transition-colors"
              >
                { String(displayHour).padStart(2, '0') }
              </div>
            </Popover>

            { showMinute && (
              <>
                <span className="text-textPrimary">:</span>
                <Popover
                  trigger="click"
                  position="top"
                  disabled={ disabled }
                  content={ renderOptionList(minuteOptions, minutes, handleMinuteChange) }
                >
                  <div
                    className="cursor-pointer transition-colors hover:text-brand"
                  >
                    { String(minutes).padStart(2, '0') }
                  </div>
                </Popover>
              </>
            ) }

            { showSecond && (
              <>
                <span className="text-textQuaternary">:</span>
                <Popover
                  trigger="click"
                  position="top"
                  disabled={ disabled }
                  content={ renderOptionList(secondOptions, seconds, handleSecondChange) }
                >
                  <span
                    className="cursor-pointer hover:text-textPrimary transition-colors"
                  >
                    { String(seconds).padStart(2, '0') }
                  </span>
                </Popover>
              </>
            ) }
          </div>
        </div>

        { periodPosition === 'right' && ampmSelector }
      </div>

      <Button
        onClick={ onConfirm }
        disabled={ disabled }
        variant="primary"
        className="h-[40px]"
      >
        { t('datePicker.confirm') || '确认' }
      </Button>
    </div>
  )
})

TimePicker.displayName = 'TimePicker'
