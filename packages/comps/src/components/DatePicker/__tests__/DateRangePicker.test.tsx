import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DateRangePicker } from '../DateRangePicker'
import {
  DATE_2026_07_04,
  DATE_2026_07_10,
  DATE_2026_07_19,
  DATE_TIME_2026_07_04_09_15,
  DATE_TIME_2026_07_04_10_15,
} from './fixtures'
import {
  ControlledDateRangePicker,
  expectDate,
  renderWithI18n,
  ReplaceAndOpenDateRangePicker,
} from './test-utils'

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
