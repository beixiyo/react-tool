import type { CascaderOption, CascaderRef } from '../types'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Cascader } from '../Cascader'

const options: CascaderOption[] = Array.from({ length: 10 }, (_, index) => ({
  value: `option-${index}`,
  label: `Option ${index}`,
}))

describe('cascader', () => {
  it('默认触发器 hover 时以清除按钮替换箭头并清空非受控值', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()

    render(
      <Cascader
        options={ options }
        defaultValue="option-1"
        placeholder="Select an option"
        clearable
        onChange={ onChange }
        onClear={ onClear }
      />,
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger.textContent).toContain('Option 1')
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()

    fireEvent.mouseEnter(trigger)
    expect(screen.getByRole('button', { name: 'Clear selection' })).toBeTruthy()

    fireEvent.mouseLeave(trigger)
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()

    fireEvent.mouseEnter(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0]?.[0]).toBe('')
    expect(onClear).toHaveBeenCalledOnce()
    expect(trigger.textContent).toContain('Select an option')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('自定义触发器不应用 clearable', () => {
    render(
      <Cascader
        options={ options }
        value="option-1"
        clearable
        trigger={ <span>Custom trigger</span> }
      />,
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.mouseEnter(trigger)

    expect(trigger.textContent).toBe('Custom trigger')
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()
  })

  it('可编辑模式可提交自定义值', () => {
    const onChange = vi.fn()

    render(
      <Cascader
        options={ [
          ...options,
          { value: 'custom-value', label: 'Custom value' },
        ] }
        editable
        placeholder="输入或选择"
        onChange={ onChange }
      />,
    )

    const input = screen.getByPlaceholderText('输入或选择')
    fireEvent.change(input, { target: { value: 'custom-value' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange.mock.calls[0]?.[0]).toBe('custom-value')
  })

  it('打开菜单时滚动到当前已渲染的选项', async () => {
    const ref = createRef<CascaderRef>()
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    render(
      <Cascader
        ref={ ref }
        options={ options }
        value="option-9"
        dropdownHeight={ 100 }
      />,
    )

    act(() => {
      ref.current?.open()
    })

    const selectedOption = await screen.findByRole('option', { name: 'Option 9' })
    expect(selectedOption.getAttribute('aria-selected')).toBe('true')
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    })
    expect(scrollIntoView.mock.contexts).toContain(selectedOption)
  })
})
