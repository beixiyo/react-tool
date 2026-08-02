import type { DateRangePickerProps } from '../types'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { I18nProvider } from 'i18n/react'
import { useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { allResources } from '../../../i18n'
import { DatePicker } from '../DatePicker'
import { DateRangePicker } from '../DateRangePicker'
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
        initialValue={ dateOf(2026, 6, 4) }
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
        initialValue={ dateOf(2026, 6, 4) }
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
        initialValue={ dateOf(2026, 6, 4) }
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
          start: dateOf(2026, 6, 4),
          end: dateOf(2026, 6, 10),
        } }
        closeOnSelect={ false }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 10 日'))

    expect(await screen.findByText('开始')).toBeTruthy()
    expect(screen.getByText('结束')).toBeTruthy()
    expect(screen.getByRole('button', { name: '2026-07-04' }).dataset.rangePosition).toBe('start')
    expect(screen.getByRole('button', { name: '2026-07-07' }).dataset.rangePosition).toBe('middle')
    expect(screen.getByRole('button', { name: '2026-07-10' }).dataset.rangePosition).toBe('end')
  })

  it('点击图标时打开并优先编辑第一个未填写的端点', async () => {
    renderWithI18n(
      <DateRangePicker
        value={ { start: dateOf(2026, 6, 4), end: null } }
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
          start: dateOf(2026, 6, 4),
          end: dateOf(2026, 6, 10),
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
          start: dateOf(2026, 6, 4),
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
          start: dateOf(2026, 6, 4),
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
          start: dateOf(2026, 6, 4),
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
          start: dateOf(2026, 6, 4),
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
          start: dateOf(2026, 6, 4),
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
          start: dateOf(2026, 6, 4),
          end: null,
        } }
        onChange={ () => calls.push('change') }
        onConfirm={ () => calls.push('confirm') }
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
          start: dateOf(2026, 6, 4),
          end: dateOf(2026, 6, 10),
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
          start: dateOf(2026, 6, 4),
          end: dateOf(2026, 6, 10),
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
          start: dateTimeOf(2026, 6, 4, 9, 15),
          end: dateTimeOf(2026, 6, 4, 10, 15),
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
          start: dateTimeOf(2026, 6, 4, 9, 15),
          end: dateTimeOf(2026, 6, 4, 10, 15),
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
          start: dateOf(2026, 6, 4),
          end: dateOf(2026, 6, 10),
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
          start: dateOf(2026, 6, 4),
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
          start: dateOf(2026, 6, 4),
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

describe('timePicker', () => {
  it('normalizes quick-time intervals for direct public usage', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <TimePicker
        value={ dateTimeOf(2026, 6, 4, 10, 15) }
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
        defaultValue={ dateOf(2026, 5, 1) }
        minDate={ dateOf(2026, 4, 15) }
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
        defaultValue={ dateOf(2026, 0, 1) }
        minDate={ dateOf(2025, 5, 15) }
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
        defaultValue={ dateOf(2026, 0, 1) }
        minDate={ dateOf(2000, 5, 15) }
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
        defaultValue={ dateOf(2026, 6, 1) }
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
        defaultValue={ dateOf(2026, 0, 1) }
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
  const [value, setValue] = useState<Date | null>(() => dateOf(2026, 6, 1))
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={ () => {
          setValue(dateOf(2026, 7, 1))
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

function ReplaceAndOpenDateRangePicker({ onCancel }: ReplaceAndOpenDateRangePickerProps) {
  const [value, setValue] = useState({
    start: dateOf(2026, 7, 1),
    end: null,
  })
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={ () => {
          setValue({ start: dateOf(2026, 7, 2), end: null })
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

function dateOf(year: number, month: number, day: number) {
  return new Date(year, month, day)
}

function dateTimeOf(year: number, month: number, day: number, hours: number, minutes: number) {
  return new Date(year, month, day, hours, minutes)
}

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
