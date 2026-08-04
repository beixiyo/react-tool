import type { DateRangePickerProps, DateRangePickerValue, DateSpanPickerValue, DateTimeSpanPickerValue } from '../types'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { addDays, addMinutes, format, parseISO, startOfMonth } from 'date-fns'
import { I18nProvider } from 'i18n/react'
import { useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { allResources } from '../../../i18n'
import { DatePicker } from '../DatePicker'
import { DateRangePicker } from '../DateRangePicker'
import { DateSpanPicker } from '../DateSpanPicker'
import { DateTimeSpanPicker } from '../DateTimeSpanPicker'
import { MonthPicker } from '../MonthPicker'
import { TimePicker } from '../TimePicker'
import { YearPicker } from '../YearPicker'

beforeAll(() => {
  if (!Element.prototype.animate) {
    Element.prototype.animate = vi.fn(() => ({
      cancel: vi.fn(),
    } as unknown as Animation))
  }
})

describe('datePicker', () => {
  it('selects a date from the calendar and updates the trigger text', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ onChange }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-12' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expectDate(onChange.mock.calls[0][0], 2026, 6, 12)
    expect(screen.getByText('2026 年 07 月 12 日')).toBeTruthy()
    expect(screen.getByRole('button', { name: '确认' })).toBeTruthy()
  })

  it('clears selected value through the clear button', () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ onChange }
        showClear
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '清除' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.getByText('选择日期')).toBeTruthy()
  })

  it('does not call onChange for disabled dates', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ onChange }
        disabledDate={ date => date.getDate() === 12 }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日'))
    const disabledDate = await screen.findByRole('button', { name: '2026-07-12' })

    expect(disabledDate).toHaveProperty('disabled', true)
    fireEvent.click(disabledDate)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('2026 年 07 月 04 日')).toBeTruthy()
  })
})

describe('dateRangePicker', () => {
  it('连续范围标记起点、中间日期和终点，并显示本地化标签', async () => {
    renderWithI18n(
      <DateRangePicker
        value={ {
          start: DATE_2026_07_04,
          end: DATE_2026_07_10,
        } }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '开始日期' }))

    expect(await screen.findByRole('button', { name: '2026-07-04' })).toBeTruthy()
    expect(screen.getByText('开始')).toBeTruthy()
    expect(screen.getByText('结束')).toBeTruthy()
    expect(screen.getByRole('button', { name: '2026-07-04' }).dataset.rangePosition).toBe('start')
    expect(screen.getByRole('button', { name: '2026-07-07' }).dataset.rangePosition).toBe('middle')
    expect(screen.getByRole('button', { name: '2026-07-10' }).dataset.rangePosition).toBe('end')
  })

  it('选择结束日期时按归一化范围决定反向预览的视觉端点', async () => {
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_2026_07_19,
          end: null,
        } }
        onChange={ vi.fn() }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByText('结束日期'))
    fireEvent.mouseEnter(await screen.findByRole('button', { name: '2026-07-17' }))

    expect(screen.getByRole('button', { name: '2026-07-17' }).dataset.rangePosition).toBe('start')
    expect(screen.getByRole('button', { name: '2026-07-19' }).dataset.rangePosition).toBe('end')
  })

  it('点击图标时打开并优先编辑第一个未填写的端点', async () => {
    renderWithI18n(
      <DateRangePicker
        value={ { start: DATE_2026_07_04, end: null } }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '结束日期' }))
    expect(await screen.findByRole('button', { name: '确认' })).toBeTruthy()
  })

  it('uses defaultValue in uncontrolled mode and snapshots it on open', () => {
    const onCancel = vi.fn()
    renderWithI18n(
      <DateRangePicker
        defaultValue={ {
          start: DATE_2026_07_04,
          end: DATE_2026_07_10,
        } }
        onCancel={ onCancel }
        closeOnSelect={ false }
      />,
    )

    expect(screen.getByText('2026 年 07 月 04 日')).toBeTruthy()
    expect(screen.getByText('2026 年 07 月 10 日')).toBeTruthy()

    fireEvent.click(screen.getByText('2026 年 07 月 10 日'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expectDate(onCancel.mock.calls[0][1].initialValue.start, 2026, 6, 4)
    expectDate(onCancel.mock.calls[0][1].initialValue.end, 2026, 6, 10)
  })

  it('selects an end date from the active range input', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_2026_07_04,
          end: null,
        } }
        onChange={ onChange }
      />,
    )

    fireEvent.click(screen.getByText('结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [nextValue] = onChange.mock.calls[0]
    expectDate(nextValue.start, 2026, 6, 4)
    expectDate(nextValue.end, 2026, 6, 10)
    expect(screen.getByText('2026 年 07 月 04 日')).toBeTruthy()
    expect(screen.getByText('2026 年 07 月 10 日')).toBeTruthy()
  })

  it('passes confirmed value and context after explicit confirmation', async () => {
    const onConfirm = vi.fn()
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_2026_07_04,
          end: null,
        } }
        onChange={ vi.fn() }
        onConfirm={ onConfirm }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByText('结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))

    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '确认' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0].end, 2026, 6, 10)
    expect(onConfirm.mock.calls[0][1].reason).toBe('confirm')
    expectDate(onConfirm.mock.calls[0][1].initialValue.start, 2026, 6, 4)
    expectDate(onConfirm.mock.calls[0][1].draftValue.end, 2026, 6, 10)
  })

  it('passes the draft to onCancel and restores the initial value on Escape', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_2026_07_04,
          end: null,
        } }
        onChange={ vi.fn() }
        onConfirm={ onConfirm }
        onCancel={ onCancel }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByText('结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledTimes(1)
    expectDate(onCancel.mock.calls[0][0].end, 2026, 6, 10)
    expect(onCancel.mock.calls[0][1].reason).toBe('escape')
    expectDate(onCancel.mock.calls[0][1].initialValue.start, 2026, 6, 4)
    expectDate(onCancel.mock.calls[0][1].draftValue.end, 2026, 6, 10)
    expect(screen.getByText('结束日期')).toBeTruthy()
  })

  it('cancels and restores the draft when clicking the active trigger again', async () => {
    const onChange = vi.fn()
    const onCancel = vi.fn()
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_2026_07_04,
          end: null,
        } }
        onChange={ onChange }
        onCancel={ onCancel }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByText('结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))
    fireEvent.click(screen.getByText('2026 年 07 月 10 日'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onCancel.mock.calls[0][1].reason).toBe('trigger')
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[1][0].end).toBeNull()
    expect(screen.getByText('结束日期')).toBeTruthy()
  })

  it('lets a custom trigger switch and cancel without stopping propagation', () => {
    const onCancel = vi.fn()
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_2026_07_04,
          end: null,
        } }
        onChange={ vi.fn() }
        onCancel={ onCancel }
        closeOnSelect={ false }
        renderTrigger={ context => (
          <div>
            <button type="button" onClick={ () => context.onInputClick('start') }>
              自定义开始日期
            </button>
            <button type="button" onClick={ () => context.onInputClick('end') }>
              自定义结束日期
            </button>
          </div>
        ) }
      />,
    )

    fireEvent.click(screen.getByText('自定义开始日期'))
    fireEvent.click(screen.getByText('自定义结束日期'))

    expect(onCancel).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('自定义结束日期'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onCancel.mock.calls[0][1].reason).toBe('trigger')
  })

  it('snapshots the next controlled value when value and open update together', () => {
    const onCancel = vi.fn()
    renderWithI18n(<ReplaceAndOpenDateRangePicker onCancel={ onCancel } />)

    fireEvent.click(screen.getByText('替换并打开'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expectDate(onCancel.mock.calls[0][1].initialValue.start, 2026, 7, 2)
    expectDate(onCancel.mock.calls[0][0].start, 2026, 7, 2)
  })

  it('notifies an automatic draft change before confirming it', async () => {
    const calls: string[] = []
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_2026_07_04,
          end: null,
        } }
        onChange={ () => calls.push('change') }
        onConfirm={ () => {
          calls.push('confirm')
        } }
        closeOnSelect
      />,
    )

    fireEvent.click(screen.getByText('结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))

    expect(calls).toEqual(['change', 'confirm'])
  })

  it('keeps the picker open when confirmation is rejected', async () => {
    const onConfirm = vi.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(undefined)
    renderWithI18n(
      <DateRangePicker
        defaultValue={ {
          start: DATE_2026_07_04,
          end: DATE_2026_07_10,
        } }
        onConfirm={ onConfirm }
        closeOnSelect={ false }
        renderTrigger={ context => (
          <button type="button" onClick={ () => context.onInputClick('end') }>
            { context.confirmRejected
              ? '确认被拒绝'
              : '打开日期范围' }
          </button>
        ) }
      />,
    )

    fireEvent.click(screen.getByText('打开日期范围'))
    fireEvent.click(await screen.findByRole('button', { name: '确认' }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    expect(screen.getByText('确认被拒绝')).toBeTruthy()
    expect(screen.getByRole('button', { name: '确认' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(2))
  })

  it('disables duplicate confirmation while an async result is pending', async () => {
    let resolveConfirm: ((value: boolean) => void) | undefined
    const onConfirm = vi.fn(() => new Promise<boolean>((resolve) => {
      resolveConfirm = resolve
    }))
    renderWithI18n(
      <DateRangePicker
        defaultValue={ {
          start: DATE_2026_07_04,
          end: DATE_2026_07_10,
        } }
        onConfirm={ onConfirm }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 10 日'))
    const confirmButton = await screen.findByRole('button', { name: '确认' })
    fireEvent.click(confirmButton)

    await waitFor(() => expect(confirmButton).toHaveProperty('disabled', true))
    fireEvent.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)

    resolveConfirm?.(false)
    await waitFor(() => expect(confirmButton).toHaveProperty('disabled', false))
  })

  it('selects an exact time from the configured quick-time interval', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_TIME_2026_07_04_09_15,
          end: DATE_TIME_2026_07_04_10_15,
        } }
        onChange={ onChange }
        closeOnSelect={ false }
        precision="minute"
        quickTimeStep={ 30 }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日 10:15'))
    fireEvent.click(await screen.findByRole('button', { name: '快捷时间' }))
    const quickTime = await screen.findByRole('button', { name: '23:30' })
    fireEvent.mouseDown(quickTime)
    fireEvent.click(quickTime)

    const nextValue = onChange.mock.calls.at(-1)?.[0]
    expect(nextValue.end.getHours()).toBe(23)
    expect(nextValue.end.getMinutes()).toBe(30)
  })

  it('normalizes quick-time intervals at the public range-picker boundary', async () => {
    renderWithI18n(
      <DateRangePicker
        defaultValue={ {
          start: DATE_TIME_2026_07_04_09_15,
          end: DATE_TIME_2026_07_04_10_15,
        } }
        closeOnSelect={ false }
        precision="minute"
        quickTimeStep={ 7.5 }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日 10:15'))
    fireEvent.click(await screen.findByRole('button', { name: '快捷时间' }))

    expect(await screen.findByRole('button', { name: '00:08' })).toBeTruthy()
    expect(screen.queryByText('00:7.5')).toBeNull()
  })

  it('allows cancelling a pending confirmation without affecting the next session', async () => {
    let resolveConfirm: ((value: boolean) => void) | undefined
    const onCancel = vi.fn()
    renderWithI18n(
      <DateRangePicker
        defaultValue={ {
          start: DATE_2026_07_04,
          end: DATE_2026_07_10,
        } }
        onConfirm={ () => new Promise<boolean>((resolve) => {
          resolveConfirm = resolve
        }) }
        onCancel={ onCancel }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 10 日'))
    fireEvent.click(await screen.findByRole('button', { name: '确认' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('2026 年 07 月 10 日'))
    const nextSessionConfirm = await screen.findByRole('button', { name: '确认' })
    await act(async () => {
      resolveConfirm?.(true)
      await Promise.resolve()
    })

    expect(nextSessionConfirm).toBeTruthy()
    expect(screen.getByRole('button', { name: '确认' })).toBeTruthy()
  })

  it('handles only one cancel while a controlled owner has not closed yet', () => {
    const onCancel = vi.fn()
    renderWithI18n(
      <DateRangePicker
        open
        value={ {
          start: DATE_2026_07_04,
          end: null,
        } }
        onChange={ vi.fn() }
        onCancel={ onCancel }
        closeOnSelect={ false }
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not emit a change when cancelling an untouched draft', () => {
    const onChange = vi.fn()
    const onCancel = vi.fn()
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: DATE_2026_07_04,
          end: null,
        } }
        onChange={ onChange }
        onCancel={ onCancel }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByText('结束日期'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('dateSpanPicker', () => {
  it('按空、单日、区间、新单日和清空的顺序转换选择', async () => {
    const onChange = vi.fn()
    const currentMonth = startOfMonth(new Date())
    const firstDate = addDays(currentMonth, 9)
    const earlierDate = addDays(currentMonth, 3)
    const replacementDate = addDays(currentMonth, 6)
    renderWithI18n(<ControlledDateSpanPicker onChange={ onChange } />)

    fireEvent.click(screen.getByText('选择日期'))

    fireEvent.click(await screen.findByRole('button', { name: format(firstDate, 'yyyy-MM-dd') }))
    expectDate(onChange.mock.calls[0][0].start, firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate())
    expect(onChange.mock.calls[0][0].end).toBeNull()
    expect(screen.getByRole('button', { name: format(firstDate, 'yyyy-MM-dd') }).getAttribute('aria-selected')).toBe('true')
    expect(screen.queryByText('开始')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: format(earlierDate, 'yyyy-MM-dd') }))
    expectDate(onChange.mock.calls[1][0].start, earlierDate.getFullYear(), earlierDate.getMonth(), earlierDate.getDate())
    expectDate(onChange.mock.calls[1][0].end, firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate())
    expect(screen.getByRole('button', { name: format(earlierDate, 'yyyy-MM-dd') }).dataset.rangePosition).toBe('start')
    expect(screen.getByRole('button', { name: format(firstDate, 'yyyy-MM-dd') }).dataset.rangePosition).toBe('end')

    fireEvent.click(screen.getByRole('button', { name: format(replacementDate, 'yyyy-MM-dd') }))
    expectDate(onChange.mock.calls[2][0].start, replacementDate.getFullYear(), replacementDate.getMonth(), replacementDate.getDate())
    expect(onChange.mock.calls[2][0].end).toBeNull()
    expect(screen.getByRole('button', { name: format(replacementDate, 'yyyy-MM-dd') }).getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: format(replacementDate, 'yyyy-MM-dd') }))
    expect(onChange.mock.calls[3][0]).toEqual({ start: null, end: null })
  })

  it('只在 Confirm 时通知确认值', async () => {
    const onConfirm = vi.fn()
    const selectedDate = addDays(startOfMonth(new Date()), 9)
    renderWithI18n(<ControlledDateSpanPicker onChange={ vi.fn() } onConfirm={ onConfirm } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(selectedDate, 'yyyy-MM-dd') }))

    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '确认' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0].start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(onConfirm.mock.calls[0][0].end).toBeNull()
    expect(onConfirm.mock.calls[0][1].reason).toBe('confirm')
  })

  it('按 Enter 时走 Confirm 事务', async () => {
    const onConfirm = vi.fn()
    const selectedDate = addDays(startOfMonth(new Date()), 9)
    renderWithI18n(<ControlledDateSpanPicker onChange={ vi.fn() } onConfirm={ onConfirm } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(selectedDate, 'yyyy-MM-dd') }))
    fireEvent.keyDown(document, { key: 'Enter' })

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0].start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(onConfirm.mock.calls[0][1].reason).toBe('confirm')
  })

  it('按 Escape 丢弃本次日期草稿并恢复打开前值', async () => {
    const onChange = vi.fn()
    const onCancel = vi.fn()
    const selectedDate = addDays(startOfMonth(new Date()), 9)
    renderWithI18n(<ControlledDateSpanPicker onChange={ onChange } onCancel={ onCancel } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(selectedDate, 'yyyy-MM-dd') }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expectDate(onCancel.mock.calls[0][0].start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(onCancel.mock.calls[0][1].reason).toBe('escape')
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual({ start: null, end: null })
  })
})

describe('dateTimeSpanPicker', () => {
  it('日期先保持全天，点击 Add time 后才进入时刻编辑', async () => {
    const onChange = vi.fn()
    const selectedDate = addDays(startOfMonth(new Date()), 9)
    renderWithI18n(<ControlledDateTimeSpanPicker onChange={ onChange } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(selectedDate, 'yyyy-MM-dd') }))

    const initialValue = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expectDate(initialValue.start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(initialValue.end).toBeNull()
    expect(initialValue.hasTime).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: '添加时间' }))

    const timeValue = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expect(timeValue.hasTime).toBe(true)
    expect(timeValue.end).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '添加结束时刻' }))

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

    fireEvent.click(screen.getByRole('button', { name: '清除时间' }))

    const clearedTimeValue = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expect(clearedTimeValue.hasTime).toBe(false)
    expectDate(clearedTimeValue.start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(clearedTimeValue.end).toBeNull()
  })

  it('日期段点击 Add time 后保留日期，并为起止日创建独立且相同的当前时刻', async () => {
    const onChange = vi.fn()
    const startDate = addDays(startOfMonth(new Date()), 9)
    const endDate = addDays(startDate, 2)
    renderWithI18n(<ControlledDateTimeSpanPicker onChange={ onChange } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(startDate, 'yyyy-MM-dd') }))
    fireEvent.click(screen.getByRole('button', { name: format(endDate, 'yyyy-MM-dd') }))
    fireEvent.click(screen.getByRole('button', { name: '添加时间' }))

    const value = onChange.mock.calls.at(-1)?.[0] as DateTimeSpanPickerValue
    expect(value.hasTime).toBe(true)
    expectDate(value.start, startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    expectDate(value.end, endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    expect(value.start?.getHours()).toBe(value.end?.getHours())
    expect(value.start?.getMinutes()).toBe(value.end?.getMinutes())
  })

  it('optionally keeps the same-day duration when the start time changes', async () => {
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

  it('keeps the complete duration for a linked cross-day interval', async () => {
    renderWithI18n(
      <LinkedDateTimeSpanPicker
        initialValue={ {
          start: parseISO('2026-07-04T10:00:00'),
          end: parseISO('2026-07-06T11:30:00'),
          hasTime: true,
        } }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日 10:00 ~ 2026 年 07 月 06 日 11:30'))
    const startHour = (await screen.findAllByRole('textbox', { name: '时' }))[0]
    fireEvent.change(startHour, { target: { value: '12' } })

    await waitFor(() => {
      const endHour = screen.getAllByRole('textbox', { name: '时' })[1] as HTMLInputElement
      const endMinute = screen.getAllByRole('textbox', { name: '分' })[1] as HTMLInputElement
      expect(endHour.value).toBe('13')
      expect(endMinute.value).toBe('30')
    })
  })

  it('marks an end time earlier than the start time and explains the error', async () => {
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
})

describe('timePicker', () => {
  it('commits complete keyboard segments, moves focus, and rejects invalid values', () => {
    const onChange = vi.fn()
    renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ onChange }
        precision="minute"
        timeInputMode="segments"
      />,
    )

    const hourInput = screen.getByRole('textbox', { name: '时' })
    const minuteInput = screen.getByRole('textbox', { name: '分' })
    fireEvent.focus(hourInput)
    fireEvent.change(hourInput, { target: { value: '13' } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].getHours()).toBe(13)
    expect(document.activeElement).toBe(minuteInput)

    fireEvent.change(minuteInput, { target: { value: '99' } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect((minuteInput as HTMLInputElement).value).toBe('15')
    expect(minuteInput.getAttribute('aria-invalid')).toBe('true')
  })

  it('keeps a completed 24-hour segment when moving focus to the next input', async () => {
    renderWithI18n(<ControlledSegmentTimePicker />)

    const hourInput = screen.getByRole('textbox', { name: '时' }) as HTMLInputElement
    const minuteInput = screen.getByRole('textbox', { name: '分' })
    hourInput.focus()
    fireEvent.input(hourInput, { target: { value: '1' } })
    fireEvent.input(hourInput, { target: { value: '11' } })

    await waitFor(() => {
      expect(hourInput.value).toBe('11')
    })
    expect(document.activeElement).toBe(minuteInput)
  })

  it('adjusts only the focused segment with the opt-out mouse wheel interaction', () => {
    const onChange = vi.fn()
    const { rerender } = renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ onChange }
        precision="minute"
        timeInputMode="segments"
        enableTimeInputWheel={ false }
      />,
    )

    const hourInput = screen.getByRole('textbox', { name: '时' }) as HTMLInputElement

    hourInput.focus()
    fireEvent.wheel(hourInput, { deltaY: -20, cancelable: true })
    expect(onChange).not.toHaveBeenCalled()

    rerender(
      <I18nProvider
        resources={ allResources }
        defaultLanguage="zh-CN"
        language="zh-CN"
      >
        <TimePicker
          value={ DATE_TIME_2026_07_04_10_15 }
          onChange={ onChange }
          precision="minute"
          timeInputMode="segments"
        />
      </I18nProvider>,
    )

    const enabledHourInput = screen.getByRole('textbox', { name: '时' }) as HTMLInputElement
    const enabledMinuteInput = screen.getByRole('textbox', { name: '分' })
    enabledHourInput.focus()
    fireEvent.wheel(enabledHourInput, { deltaY: -20, cancelable: true })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].getHours()).toBe(11)

    fireEvent.wheel(enabledMinuteInput, { deltaY: -20 })
    expect(onChange).toHaveBeenCalledTimes(1)

    enabledHourInput.blur()
    fireEvent.wheel(enabledHourInput, { deltaY: -20 })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('normalizes quick-time intervals for direct public usage', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ onChange }
        precision="minute"
        quickTimeStep={ 7.5 }
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '快捷时间' }))
    fireEvent.click(await screen.findByRole('button', { name: '00:08' }))

    const nextValue = onChange.mock.calls.at(-1)?.[0]
    expect(nextValue.getHours()).toBe(0)
    expect(nextValue.getMinutes()).toBe(8)
    expect(screen.queryByText('00:7.5')).toBeNull()
  })
})

describe('period pickers', () => {
  it('allows DatePicker to navigate into a boundary month with selectable days', async () => {
    renderWithI18n(
      <DatePicker
        defaultValue={ DATE_2026_06_01 }
        minDate={ DATE_2026_05_15 }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 06 月 01 日'))
    const previousMonth = await screen.findByRole('button', { name: '上一月' })
    expect((previousMonth as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(previousMonth)
    expect((await screen.findByRole('button', { name: '2026-05-15' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('allows MonthPicker to navigate into a boundary year with selectable months', async () => {
    renderWithI18n(
      <MonthPicker
        defaultValue={ DATE_2026_01_01 }
        minDate={ DATE_2025_06_15 }
      />,
    )

    fireEvent.click(screen.getByText('2026-01'))
    const previousYear = await screen.findByRole('button', { name: '上一年' })
    expect((previousYear as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(previousYear)
    expect((await screen.findByRole('button', { name: '7' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('allows YearPicker to navigate into a boundary page containing valid years', async () => {
    renderWithI18n(
      <YearPicker
        defaultValue={ DATE_2026_01_01 }
        minDate={ DATE_2000_06_15 }
      />,
    )

    fireEvent.click(screen.getAllByText('2026')[0])
    const previousRange = await screen.findByRole('button', { name: '上一组年份' })
    expect((previousRange as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(previousRange)
    expect((await screen.findByRole('button', { name: '2000' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('confirms MonthPicker only after a real open session changes', async () => {
    const onConfirm = vi.fn()
    renderWithI18n(
      <MonthPicker
        defaultValue={ DATE_2026_07_01 }
        onConfirm={ onConfirm }
      />,
    )

    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('2026-07'))
    fireEvent.click(await screen.findByRole('button', { name: '8' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0], 2026, 7, 1)
  })

  it('confirms YearPicker only after a real open session changes', async () => {
    const onConfirm = vi.fn()
    renderWithI18n(
      <YearPicker
        defaultValue={ DATE_2026_01_01 }
        onConfirm={ onConfirm }
      />,
    )

    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('2026')[0])
    fireEvent.click(await screen.findByRole('button', { name: '2027' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0], 2027, 0, 1)
  })

  it('does not confirm a controlled value supplied in the same render that opens MonthPicker', async () => {
    const onConfirm = vi.fn()
    renderWithI18n(<ControlledMonthPickerSession onConfirm={ onConfirm } />)

    fireEvent.click(screen.getByRole('button', { name: 'open with August' }))
    expect(await screen.findByRole('button', { name: '8' })).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider
      resources={ allResources }
      defaultLanguage="zh-CN"
      language="zh-CN"
    >
      { ui }
    </I18nProvider>,
  )
}

function ControlledMonthPickerSession({ onConfirm }: { onConfirm: (value: Date | null) => void }) {
  const [value, setValue] = useState<Date | null>(DATE_2026_07_01)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={ () => {
          setValue(DATE_2026_08_01)
          setOpen(true)
        } }
      >
        open with August
      </button>
      <MonthPicker
        value={ value }
        open={ open }
        onChange={ setValue }
        onOpenChange={ setOpen }
        onConfirm={ onConfirm }
      />
    </>
  )
}

function ControlledDatePicker({
  disabledDate,
  initialValue,
  onChange,
  showClear,
}: ControlledDatePickerProps) {
  const [value, setValue] = useState<Date | null>(initialValue)

  return (
    <DatePicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
      disabledDate={ disabledDate }
      showClear={ showClear }
    />
  )
}

function ControlledDateRangePicker({
  initialValue,
  onChange,
  onConfirm,
  onCancel,
  closeOnSelect,
  renderTrigger,
  precision,
  quickTimeStep,
}: ControlledDateRangePickerProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <DateRangePicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
      onConfirm={ onConfirm }
      onCancel={ onCancel }
      closeOnSelect={ closeOnSelect }
      renderTrigger={ renderTrigger }
      precision={ precision }
      quickTimeStep={ quickTimeStep }
    />
  )
}

function ControlledDateSpanPicker({
  onChange,
  onConfirm,
  onCancel,
}: {
  onChange: (value: DateSpanPickerValue) => void
  onConfirm?: (value: DateSpanPickerValue) => void
  onCancel?: (value: DateSpanPickerValue) => void
}) {
  const [value, setValue] = useState<DateSpanPickerValue>({ start: null, end: null })

  return (
    <DateSpanPicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
      onConfirm={ onConfirm }
      onCancel={ onCancel }
    />
  )
}

function ControlledDateTimeSpanPicker({ onChange }: { onChange: (value: DateTimeSpanPickerValue) => void }) {
  const [value, setValue] = useState<DateTimeSpanPickerValue>({ start: null, end: null, hasTime: false })

  return (
    <DateTimeSpanPicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
      precision="minute"
    />
  )
}

function ControlledSegmentTimePicker() {
  const [value, setValue] = useState(DATE_TIME_2026_07_04_10_15)

  return (
    <TimePicker
      value={ value }
      onChange={ setValue }
      precision="minute"
      timeInputMode="segments"
    />
  )
}

function LinkedDateTimeSpanPicker({
  initialValue = {
    start: parseISO('2026-07-04T10:00:00'),
    end: parseISO('2026-07-04T11:30:00'),
    hasTime: true,
  },
}: {
  initialValue?: DateTimeSpanPickerValue
}) {
  const [value, setValue] = useState<DateTimeSpanPickerValue>(initialValue)
  const [open, setOpen] = useState(false)

  return (
    <DateTimeSpanPicker
      value={ value }
      onChange={ setValue }
      open={ open }
      onOpenChange={ setOpen }
      precision="minute"
      timeInputMode="segments"
      syncEndTimeWithStart
    />
  )
}

function ReplaceAndOpenDateRangePicker({ onCancel }: ReplaceAndOpenDateRangePickerProps) {
  const [value, setValue] = useState<DateRangePickerValue>({
    start: DATE_2026_08_01,
    end: null,
  })
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={ () => {
          setValue({ start: DATE_2026_08_02, end: null })
          setOpen(true)
        } }
      >
        替换并打开
      </button>
      <DateRangePicker
        value={ value }
        open={ open }
        onOpenChange={ setOpen }
        onChange={ setValue }
        onCancel={ onCancel }
        closeOnSelect={ false }
      />
    </>
  )
}

const DATE_2026_07_04 = parseISO('2026-07-04')
const DATE_2026_07_10 = parseISO('2026-07-10')
const DATE_2026_07_19 = parseISO('2026-07-19')
const DATE_2026_06_01 = parseISO('2026-06-01')
const DATE_2026_05_15 = parseISO('2026-05-15')
const DATE_2026_01_01 = parseISO('2026-01-01')
const DATE_2025_06_15 = parseISO('2025-06-15')
const DATE_2000_06_15 = parseISO('2000-06-15')
const DATE_2026_07_01 = parseISO('2026-07-01')
const DATE_2026_08_01 = parseISO('2026-08-01')
const DATE_2026_08_02 = parseISO('2026-08-02')
const DATE_TIME_2026_07_04_09_15 = parseISO('2026-07-04T09:15:00')
const DATE_TIME_2026_07_04_10_15 = parseISO('2026-07-04T10:15:00')

function expectDate(date: Date | null, year: number, month: number, day: number) {
  expect(date).toBeInstanceOf(Date)
  expect(date?.getFullYear()).toBe(year)
  expect(date?.getMonth()).toBe(month)
  expect(date?.getDate()).toBe(day)
}

type ControlledDatePickerProps = {
  initialValue: Date | null
  onChange: (value: Date | null) => void
  disabledDate?: (date: Date) => boolean
  showClear?: boolean
}

type ControlledDateRangePickerProps = {
  initialValue: {
    start: Date | null
    end: Date | null
  }
  onChange: (value: { start: Date | null, end: Date | null }) => void
  onConfirm?: DateRangePickerProps['onConfirm']
  onCancel?: DateRangePickerProps['onCancel']
  closeOnSelect?: boolean
  renderTrigger?: DateRangePickerProps['renderTrigger']
  precision?: DateRangePickerProps['precision']
  quickTimeStep?: DateRangePickerProps['quickTimeStep']
}

type ReplaceAndOpenDateRangePickerProps = {
  onCancel: NonNullable<DateRangePickerProps['onCancel']>
}
