import { fireEvent, screen, waitFor } from '@testing-library/react'
import { I18nProvider } from 'i18n/react'
import { describe, expect, it, vi } from 'vitest'

import { allResources } from '../../../i18n'
import { TimePicker } from '../TimePicker'
import { DATE_TIME_2026_07_04_10_15 } from './fixtures'
import { ControlledSegmentTimePicker, renderWithI18n } from './test-utils'

describe('timePicker', () => {
  it('保留时间图标但不启用快捷时间选项', () => {
    renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ vi.fn() }
        precision="minute"
      />,
    )

    const quickTimeButton = screen.getByRole('button', { name: '快捷时间' })
    expect(quickTimeButton.getAttribute('aria-disabled')).toBe('true')

    fireEvent.click(quickTimeButton)
    expect(screen.queryByRole('button', { name: '00:00' })).toBeNull()
  })

  it('禁用键盘输入时保留弹出层选择', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ onChange }
        precision="minute"
        minuteStep={ 15 }
        enableTimeKeyboardInput={ false }
      />,
    )

    expect(screen.queryByRole('textbox', { name: '时' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '分' }))
    fireEvent.click(await screen.findByRole('button', { name: '30' }))
    expect(onChange.mock.calls.at(-1)?.[0].getMinutes()).toBe(30)
  })

  it('支持从可键盘编辑的片段进行弹出层选择', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ onChange }
        precision="minute"
      />,
    )

    const hourInput = screen.getByRole('textbox', { name: '时' })
    fireEvent.click(hourInput)
    fireEvent.click(await screen.findByRole('button', { name: '13' }))
    expect(onChange.mock.calls.at(-1)?.[0].getHours()).toBe(13)

    fireEvent.keyDown(document, { key: 'Enter' })
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '13' })).toBeNull()
    })
  })

  it('弹出层选择稳定后将已选选项滚动到可视区域', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    renderWithI18n(<ControlledSegmentTimePicker />)

    const hourInput = screen.getByRole('textbox', { name: '时' })
    fireEvent.click(hourInput)

    const selectedHour = await screen.findByRole('button', { name: '10' })
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    })
    expect(scrollIntoView.mock.contexts).toContain(selectedHour)

    hourInput.focus()
    fireEvent.wheel(document.body, { deltaY: -20, cancelable: true })
    const nextSelectedHour = await screen.findByRole('button', { name: '11' })
    await waitFor(() => {
      expect(scrollIntoView.mock.contexts).toContain(nextSelectedHour)
    })
  })

  it('允许键盘输入但不打开数字弹出层', () => {
    const onChange = vi.fn()
    renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ onChange }
        precision="minute"
        enableTimeUnitPopover={ false }
      />,
    )

    const hourInput = screen.getByRole('textbox', { name: '时' })
    fireEvent.click(hourInput)
    expect(screen.queryByRole('button', { name: '13' })).toBeNull()

    fireEvent.change(hourInput, { target: { value: '13' } })
    expect(onChange.mock.calls.at(-1)?.[0].getHours()).toBe(13)
  })

  it('按精度渲染时间片段', () => {
    const { rerender } = renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ vi.fn() }
        precision="hour"
      />,
    )

    expect(screen.getByRole('textbox', { name: '时' })).toBeTruthy()
    expect(screen.queryByRole('textbox', { name: '分' })).toBeNull()

    rerender(
      <I18nProvider
        resources={ allResources }
        defaultLanguage="zh-CN"
        language="zh-CN"
      >
        <TimePicker
          value={ DATE_TIME_2026_07_04_10_15 }
          onChange={ vi.fn() }
          precision="second"
        />
      </I18nProvider>,
    )

    expect(screen.getByRole('textbox', { name: '分' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: '秒' })).toBeTruthy()
  })

  it('提交完整的键盘片段、移动焦点并拒绝无效值', () => {
    const onChange = vi.fn()
    renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ onChange }
        precision="minute"
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

  it('移动焦点到下一个输入时保留已完成的 24 小时制片段', async () => {
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

  it('调整聚焦片段并防止页面消费连续滚轮事件', () => {
    const onChange = vi.fn()
    const { rerender } = renderWithI18n(
      <TimePicker
        value={ DATE_TIME_2026_07_04_10_15 }
        onChange={ onChange }
        precision="minute"
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
        />
      </I18nProvider>,
    )

    const enabledHourInput = screen.getByRole('textbox', { name: '时' }) as HTMLInputElement
    const enabledMinuteInput = screen.getByRole('textbox', { name: '分' })
    enabledHourInput.focus()
    const hourWheelResult = fireEvent.wheel(document.body, { deltaY: -20, cancelable: true })
    expect(hourWheelResult).toBe(false)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].getHours()).toBe(11)

    enabledMinuteInput.focus()
    const minuteWheelResult = fireEvent.wheel(document.body, { deltaY: -20, cancelable: true })
    expect(minuteWheelResult).toBe(false)
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[1][0].getMinutes()).toBe(16)

    enabledMinuteInput.blur()
    fireEvent.wheel(document.body, { deltaY: -20, cancelable: true })
    expect(onChange).toHaveBeenCalledTimes(2)

    const controlledOnChange = vi.fn()
    rerender(
      <I18nProvider
        resources={ allResources }
        defaultLanguage="zh-CN"
        language="zh-CN"
      >
        <ControlledSegmentTimePicker onChange={ controlledOnChange } />
      </I18nProvider>,
    )

    const controlledHourInput = screen.getByRole('textbox', { name: '时' }) as HTMLInputElement
    controlledHourInput.focus()
    expect(fireEvent.wheel(document.body, { deltaY: -20, cancelable: true })).toBe(false)
    expect(fireEvent.wheel(document.body, { deltaY: -20, cancelable: true })).toBe(false)
    expect(controlledOnChange).toHaveBeenCalledTimes(2)
    expect(controlledOnChange.mock.calls[1][0].getHours()).toBe(12)
    expect(controlledHourInput.value).toBe('12')
  })

  it('为直接公开使用规范化快捷时间间隔', async () => {
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
