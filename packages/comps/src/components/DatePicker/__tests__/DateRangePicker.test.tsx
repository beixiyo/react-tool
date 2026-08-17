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

    fireEvent.click(screen.getByText('添加结束日期'))
    fireEvent.mouseEnter(await screen.findByRole('button', { name: '2026-07-17' }))

    expect(screen.getByRole('button', { name: '2026-07-17' }).dataset.rangePosition).toBe('start')
    expect(screen.getByRole('button', { name: '2026-07-19' }).dataset.rangePosition).toBe('end')
  })

  it('关闭范围 hover 预览时，悬停第二个日期不会生成临时区间', async () => {
    renderWithI18n(
      <DateRangePicker
        defaultValue={ {
          start: DATE_2026_07_19,
          end: null,
        } }
        closeOnSelect={ false }
        enableRangeHoverPreview={ false }
      />,
    )

    fireEvent.click(screen.getByText('添加结束日期'))
    fireEvent.mouseEnter(await screen.findByRole('button', { name: '2026-07-17' }))

    expect(screen.getByRole('button', { name: '2026-07-17' }).dataset.rangePosition).toBeUndefined()
    expect(screen.getByRole('button', { name: '2026-07-19' }).dataset.rangePosition).toBe('start')

    fireEvent.click(screen.getByRole('button', { name: '2026-07-17' }))

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

    fireEvent.click(screen.getByRole('button', { name: '添加结束日期' }))
    expect(await screen.findByRole('button', { name: '完成' })).toBeTruthy()
  })

  it('在非受控模式使用 defaultValue 并在打开时记录快照', () => {
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

  it('从当前范围输入选择结束日期', async () => {
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

    fireEvent.click(screen.getByText('添加结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [nextValue] = onChange.mock.calls[0]
    expectDate(nextValue.start, 2026, 6, 4)
    expectDate(nextValue.end, 2026, 6, 10)
    expect(screen.getByText('2026 年 07 月 04 日')).toBeTruthy()
    expect(screen.getByText('2026 年 07 月 10 日')).toBeTruthy()
  })

  it('显式确认后传递已确认值和上下文', async () => {
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

    fireEvent.click(screen.getByText('添加结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))

    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '完成' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0].end, 2026, 6, 10)
    expect(onConfirm.mock.calls[0][1].reason).toBe('confirm')
    expectDate(onConfirm.mock.calls[0][1].initialValue.start, 2026, 6, 4)
    expectDate(onConfirm.mock.calls[0][1].draftValue.end, 2026, 6, 10)
  })

  it('将草稿传给 onCancel 并在 Escape 时恢复初始值', async () => {
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

    fireEvent.click(screen.getByText('添加结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledTimes(1)
    expectDate(onCancel.mock.calls[0][0].end, 2026, 6, 10)
    expect(onCancel.mock.calls[0][1].reason).toBe('escape')
    expectDate(onCancel.mock.calls[0][1].initialValue.start, 2026, 6, 4)
    expectDate(onCancel.mock.calls[0][1].draftValue.end, 2026, 6, 10)
    expect(screen.getByText('添加结束日期')).toBeTruthy()
  })

  it('再次点击当前触发器时取消并恢复草稿', async () => {
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

    fireEvent.click(screen.getByText('添加结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))
    fireEvent.click(screen.getByText('2026 年 07 月 10 日'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onCancel.mock.calls[0][1].reason).toBe('trigger')
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[1][0].end).toBeNull()
    expect(screen.getByText('添加结束日期')).toBeTruthy()
  })

  it('允许自定义触发器切换和取消且不阻止事件传播', () => {
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

  it('value 和 open 同时更新时记录下一个受控值快照', () => {
    const onCancel = vi.fn()
    renderWithI18n(<ReplaceAndOpenDateRangePicker onCancel={ onCancel } />)

    fireEvent.click(screen.getByText('替换并打开'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expectDate(onCancel.mock.calls[0][1].initialValue.start, 2026, 7, 2)
    expectDate(onCancel.mock.calls[0][0].start, 2026, 7, 2)
  })

  it('确认前通知自动草稿变更', async () => {
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

    fireEvent.click(screen.getByText('添加结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))

    expect(calls).toEqual(['change', 'confirm'])
  })

  it('确认被拒绝时保持选择器打开', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: '完成' }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    expect(screen.getByText('确认被拒绝')).toBeTruthy()
    expect(screen.getByRole('button', { name: '完成' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '完成' }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(2))
  })

  it('确认校验失败时展示自定义内容并保持打开', async () => {
    const onConfirm = vi.fn(() => ({
      valid: false as const,
      message: <span data-testid="business-error">结束时间不符合业务规则</span>,
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
    fireEvent.click(await screen.findByRole('button', { name: '完成' }))

    expect((await screen.findByTestId('business-error')).textContent).toBe('结束时间不符合业务规则')
    expect(screen.getByRole('button', { name: '完成' })).toBeTruthy()
  })

  it('异步结果等待期间禁用重复确认', async () => {
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
    const confirmButton = await screen.findByRole('button', { name: '完成' })
    fireEvent.click(confirmButton)

    await waitFor(() => expect(confirmButton).toHaveProperty('disabled', true))
    fireEvent.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)

    resolveConfirm?.(false)
    await waitFor(() => expect(confirmButton).toHaveProperty('disabled', false))
  })

  it('从配置的快捷时间间隔选择精确时间', async () => {
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

  it('在范围选择器公开边界规范化快捷时间间隔', async () => {
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

  it('允许取消待处理确认且不影响下一次会话', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: '完成' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('2026 年 07 月 10 日'))
    const nextSessionConfirm = await screen.findByRole('button', { name: '完成' })
    await act(async () => {
      resolveConfirm?.(true)
      await Promise.resolve()
    })

    expect(nextSessionConfirm).toBeTruthy()
    expect(screen.getByRole('button', { name: '完成' })).toBeTruthy()
  })

  it('受控所有者尚未关闭时仅处理一次取消', () => {
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

  it('取消未修改的草稿时不触发变更', () => {
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

    fireEvent.click(screen.getByText('添加结束日期'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
  })
})
