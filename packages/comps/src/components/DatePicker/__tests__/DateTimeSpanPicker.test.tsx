import { fireEvent, screen, waitFor } from '@testing-library/react'
import { addDays, addMinutes, format, parseISO, startOfMonth } from 'date-fns'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DateTimeSpanPicker } from '../DateTimeSpanPicker'
import type { DateTimeSpanPickerTriggerContext, DateTimeSpanPickerValue } from '../types'
import { DATE_2026_07_04 } from './fixtures'
import { ControlledDateTimeSpanPicker, expectDate, LinkedDateTimeSpanPicker, renderWithI18n } from './test-utils'

describe('dateTimeSpanPicker', () => {
  it('为自定义 trigger 提供单日、同日时段和跨日时段的统一展示值', () => {
    const renderValue = (label: string) => (context: DateTimeSpanPickerTriggerContext) => <span>{ `${label}: ${context.displayValue}` }</span>

    renderWithI18n(
      <>
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-07-04T10:00:00'), end: null, hasTime: true } }
          separator=" - "
          sameDaySeparator="-"
          renderTrigger={ renderValue('single') }
        />
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-07-04T10:00:00'), end: parseISO('2026-07-04T11:30:00'), hasTime: true } }
          separator=" - "
          sameDaySeparator="-"
          renderTrigger={ renderValue('same-day') }
        />
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-07-04T10:00:00'), end: parseISO('2026-07-06T11:30:00'), hasTime: true } }
          separator=" - "
          sameDaySeparator="-"
          renderTrigger={ renderValue('cross-day') }
        />
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-07-04T10:00:00'), end: parseISO('2026-07-06T11:30:00'), hasTime: false } }
          separator=" - "
          renderTrigger={ renderValue('same-year-all-day') }
        />
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-12-31T23:00:00'), end: parseISO('2027-01-01T01:30:00'), hasTime: true } }
          separator=" - "
          renderTrigger={ renderValue('cross-year') }
        />
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-07-04T10:00:00'), end: parseISO('2026-07-06T11:30:00'), hasTime: true } }
          separator=" - "
          rangeFormatter={ ({ startText, endText, separator }) => startText + separator + endText }
          renderTrigger={ renderValue('custom-range') }
        />
      </>,
    )

    expect(screen.getByText('single: 2026 年 07 月 04 日 10:00')).toBeTruthy()
    expect(screen.getByText('same-day: 2026 年 07 月 04 日 10:00-11:30')).toBeTruthy()
    expect(screen.getByText('cross-day: 2026 年 07 月 04 日 10:00 - 07 月 06 日 11:30')).toBeTruthy()
    expect(screen.getByText('same-year-all-day: 2026 年 07 月 04 日 - 07 月 06 日')).toBeTruthy()
    expect(screen.getByText('cross-year: 2026 年 12 月 31 日 23:00 - 2027 年 01 月 01 日 01:30')).toBeTruthy()
    expect(screen.getByText('custom-range: 2026 年 07 月 04 日 10:00 - 2026 年 07 月 06 日 11:30')).toBeTruthy()
  })

  it('format 直接作用于默认 trigger 与 renderTrigger 的 displayValue', () => {
    const renderValue = (label: string) => (context: DateTimeSpanPickerTriggerContext) => <span>{ `${label}: ${context.displayValue}` }</span>

    renderWithI18n(
      <>
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-07-04T10:00:00'), end: parseISO('2026-07-04T11:30:00'), hasTime: true } }
          sameDaySeparator=" ~ "
          format="dd/MM/yyyy"
        />
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-07-04T10:00:00'), end: parseISO('2026-07-04T11:30:00'), hasTime: true } }
          sameDaySeparator=" ~ "
          format="dd/MM/yyyy"
          renderTrigger={ renderValue('custom') }
        />
        <DateTimeSpanPicker
          value={ { start: parseISO('2026-07-04T10:00:00'), end: parseISO('2026-07-06T11:30:00'), hasTime: true } }
          separator=" ~ "
          format="yyyy-MM-dd"
          renderTrigger={ renderValue('same-year-custom') }
        />
      </>,
    )

    expect(screen.getByText('04/07/2026 10:00 ~ 11:30')).toBeTruthy()
    expect(screen.getByText('custom: 04/07/2026 10:00 ~ 11:30')).toBeTruthy()
    expect(screen.getByText('same-year-custom: 2026-07-04 10:00 ~ 07-06 11:30')).toBeTruthy()
  })

  it('日期先保持全天，开启 Add time 后才进入时刻编辑', async () => {
    const onChange = vi.fn()
    const selectedDate = addDays(startOfMonth(new Date()), 9)
    renderWithI18n(<ControlledDateTimeSpanPicker onChange={ onChange } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(selectedDate, 'yyyy-MM-dd') }))

    const initialValue = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expectDate(initialValue.start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(initialValue.end).toBeNull()
    expect(initialValue.hasTime).toBe(false)

    fireEvent.click(screen.getByRole('checkbox', { name: '添加时间' }))

    const timeValue = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expect(timeValue.hasTime).toBe(true)
    expect(timeValue.end).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '添加结束时间' }))

    const rangedValue = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    const expectedEnd = addMinutes(rangedValue.start!, 15)
    if (expectedEnd.getDate() !== rangedValue.start?.getDate()) {
      expectedEnd.setFullYear(
        rangedValue.start!.getFullYear(),
        rangedValue.start!.getMonth(),
        rangedValue.start!.getDate(),
      )
      expectedEnd.setHours(23, 59, 0, 0)
    }

    expect(rangedValue.end?.getTime()).toBe(expectedEnd.getTime())

    fireEvent.click(screen.getByRole('checkbox', { name: '添加时间' }))

    const clearedTimeValue = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expect(clearedTimeValue.hasTime).toBe(false)
    expectDate(clearedTimeValue.start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(clearedTimeValue.end).toBeNull()
  })

  it('日期段开启 Add time 后保留日期，并按外部配置生成结束时刻', async () => {
    const onChange = vi.fn()
    const startDate = addDays(startOfMonth(new Date()), 9)
    const endDate = addDays(startDate, 2)
    renderWithI18n(<ControlledDateTimeSpanPicker onChange={ onChange } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(startDate, 'yyyy-MM-dd') }))
    fireEvent.click(screen.getByRole('button', { name: format(endDate, 'yyyy-MM-dd') }))
    fireEvent.click(screen.getByRole('checkbox', { name: '添加时间' }))

    const value = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expect(value.hasTime).toBe(true)
    expectDate(value.start, startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    expectDate(value.end, endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    const expectedEndTime = addMinutes(value.start!, 15)
    expect(value.end?.getHours()).toBe(expectedEndTime.getHours())
    expect(value.end?.getMinutes()).toBe(expectedEndTime.getMinutes())
  })

  it('已有单日开始时刻时，点击其他日期按外部配置生成区间结束时刻', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <DateTimeSpanPicker
        defaultValue={ {
          start: parseISO('2026-07-04T16:49:00'),
          end: null,
          hasTime: true,
        } }
        defaultEndTimeOffsetMinutes={ 15 }
        onChange={ onChange }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日 16:49'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-06' }))

    const value = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expect(value.start?.getTime()).toBe(parseISO('2026-07-04T16:49:00').getTime())
    expect(value.end?.getTime()).toBe(parseISO('2026-07-06T17:04:00').getTime())
  })

  it('跨午夜时把偏移后的时分保留在已选结束日', () => {
    vi.useFakeTimers()
    vi.setSystemTime(parseISO('2026-07-04T23:50:00'))

    try {
      const onChange = vi.fn()
      renderWithI18n(
        <DateTimeSpanPicker
          defaultValue={ {
            start: parseISO('2026-07-04T00:00:00'),
            end: parseISO('2026-07-05T00:00:00'),
            hasTime: false,
          } }
          defaultEndTimeOffsetMinutes={ 15 }
          onChange={ onChange }
          open
        />,
      )

      fireEvent.click(screen.getByRole('checkbox', { name: '添加时间', hidden: true }))

      const value = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
      expect(value.start?.getTime()).toBe(parseISO('2026-07-04T23:50:00').getTime())
      expect(value.end?.getTime()).toBe(parseISO('2026-07-05T00:05:00').getTime())
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('可选地在开始时间变化时保持同日时长', async () => {
    renderWithI18n(<LinkedDateTimeSpanPicker />)

    fireEvent.click(screen.getByText('2026 年 07 月 04 日 10:00 ~ 11:30'))
    const startHour = (await screen.findAllByRole('textbox', { name: '时' }))[0]
    fireEvent.change(startHour, { target: { value: '12' } })

    await waitFor(() => {
      const endHour = screen.getAllByRole('textbox', { name: '时' })[1] as HTMLInputElement
      const endMinute = screen.getAllByRole('textbox', { name: '分' })[1] as HTMLInputElement
      expect(endHour.value).toBe('13')
      expect(endMinute.value).toBe('30')
    })
  })

  it('对关联的跨日区间保持完整时长', async () => {
    renderWithI18n(
      <LinkedDateTimeSpanPicker
        initialValue={ {
          start: parseISO('2026-07-04T10:00:00'),
          end: parseISO('2026-07-06T11:30:00'),
          hasTime: true,
        } }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日 10:00 ~ 07 月 06 日 11:30'))
    const startHour = (await screen.findAllByRole('textbox', { name: '时' }))[0]
    fireEvent.change(startHour, { target: { value: '12' } })

    await waitFor(() => {
      const endHour = screen.getAllByRole('textbox', { name: '时' })[1] as HTMLInputElement
      const endMinute = screen.getAllByRole('textbox', { name: '分' })[1] as HTMLInputElement
      expect(endHour.value).toBe('13')
      expect(endMinute.value).toBe('30')
    })
  })

  it('标记早于开始时间的结束时间并说明错误', async () => {
    renderWithI18n(<LinkedDateTimeSpanPicker />)

    fireEvent.click(screen.getByText('2026 年 07 月 04 日 10:00 ~ 11:30'))
    const endHour = (await screen.findAllByRole('textbox', { name: '时' }))[1]
    fireEvent.change(endHour, { target: { value: '09' } })

    expect(screen.getByRole('alert').textContent).toBe('结束时间不得早于开始时间')
    expect(endHour.closest('[aria-invalid="true"]')).toBeTruthy()

    const startHour = screen.getAllByRole('textbox', { name: '时' })[0]
    fireEvent.change(startHour, { target: { value: '12' } })
    expect((screen.getAllByRole('textbox', { name: '时' })[1] as HTMLInputElement).value).toBe('09')
  })

  it('end 时间先于 start 时禁用确认且不回调 onConfirm', async () => {
    const onConfirm = vi.fn()

    const Stateful = () => {
      const [value, setValue] = useState<DateTimeSpanPickerValue>(() => ({
        start: parseISO('2026-07-04T10:00:00'),
        end: parseISO('2026-07-04T11:30:00'),
        hasTime: true,
      }))

      return (
        <DateTimeSpanPicker
          value={ value }
          onChange={ setValue }
          onConfirm={ onConfirm }
          precision="minute"
        />
      )
    }

    renderWithI18n(<Stateful />)

    fireEvent.click(screen.getByText('2026 年 07 月 04 日 10:00 ~ 11:30'))
    const endHour = (await screen.findAllByRole('textbox', { name: '时' }))[1]
    fireEvent.change(endHour, { target: { value: '09' } })

    expect(screen.getByRole('alert').textContent).toBe('结束时间不得早于开始时间')

    const confirmButton = screen.getByRole('button', { name: '完成' })
    expect(confirmButton).toHaveProperty('disabled', true)
    fireEvent.click(confirmButton)
    fireEvent.keyDown(document, { key: 'Enter' })

    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '完成' })).toBeTruthy()
  })

  it('将调用方的 Start / End 业务校验映射到对应时刻字段', async () => {
    renderWithI18n(
      <DateTimeSpanPicker
        value={ {
          start: parseISO('2026-07-04T10:00:00'),
          end: parseISO('2026-07-04T11:30:00'),
          hasTime: true,
        } }
        open
        precision="minute"
        getTimeFieldErrors={ () => ({ start: true, end: false }) }
      />,
    )

    const [startHour, endHour] = await screen.findAllByRole('textbox', { name: '时' })

    expect(startHour.closest('[aria-invalid="true"]')).toBeTruthy()
    expect(endHour.closest('[aria-invalid="true"]')).toBeNull()
  })

  it('透传 enableTimeKeyboardInput 与 enableTimeUnitPopover 到内部 TimePicker', async () => {
    renderWithI18n(
      <DateTimeSpanPicker
        defaultValue={ { start: DATE_2026_07_04, end: null, hasTime: false } }
        open
        precision="minute"
        enableTimeKeyboardInput={ false }
        enableTimeUnitPopover={ false }
        quickTimeStep={ 15 }
      />,
    )

    fireEvent.click(await screen.findByRole('checkbox', { name: '添加时间' }))

    expect(screen.queryByRole('textbox', { name: '时' })).toBeNull()
    expect(screen.queryByRole('button', { name: '时' })).toBeNull()
  })

  it('关闭年月下拉滚动动画后仍立即定位当前选项', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    renderWithI18n(
      <DateTimeSpanPicker
        defaultValue={ { start: DATE_2026_07_04, end: null, hasTime: false } }
        open
        enableHeaderScrollAnimation={ false }
      />,
    )

    fireEvent.click((await screen.findAllByRole('combobox'))[0])

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'instant',
        block: 'nearest',
        inline: 'nearest',
      })
    })
  })
})
