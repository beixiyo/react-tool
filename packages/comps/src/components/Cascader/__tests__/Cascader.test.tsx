import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Cascader } from '../Cascader'
import type { CascaderOption, CascaderRef } from '../types'

const options: CascaderOption[] = Array.from({ length: 10 }, (_, index) => ({
  value: `option-${index}`,
  label: `Option ${index}`,
}))

describe('cascader', () => {
  it('菜单键盘导航跳过 disabled 并支持方向键、Home、End 与层级切换', async () => {
    const onChange = vi.fn()
    const keyboardOptions: CascaderOption[] = [
      { value: 'disabled-root', label: 'Disabled root', disabled: true },
      { value: 'first', label: 'First' },
      { value: 'disabled-between', label: 'Disabled between', disabled: true },
      {
        value: 'group',
        label: 'Group',
        children: [
          { value: 'disabled-child', label: 'Disabled child', disabled: true },
          { value: 'child', label: 'Child' },
          { value: 'last-child', label: 'Last child' },
        ],
      },
      { value: 'last', label: 'Last' },
    ]

    render(<Cascader options={ keyboardOptions } onChange={ onChange } />)
    const trigger = screen.getByRole('combobox')
    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('false')
    expect(trigger.getAttribute(DATA_ATTR.selected)).toBe('false')
    expect(trigger.getAttribute(DATA_ATTR.disabled)).toBe('false')
    expect(trigger.getAttribute(DATA_ATTR.invalid)).toBe('false')
    trigger.focus()

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const first = await screen.findByRole('option', { name: 'First' })
    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('true')
    expect(trigger.getAttribute('aria-activedescendant')).toBe(first.id)
    expect(first.getAttribute(DATA_ATTR.highlighted)).toBe('true')
    const disabledRoot = screen.getByRole('option', { name: 'Disabled root' })
    expect(disabledRoot.getAttribute('aria-disabled')).toBe('true')
    expect(disabledRoot.getAttribute('aria-selected')).toBe('false')
    expect(disabledRoot.getAttribute(DATA_ATTR.disabled)).toBe('true')
    expect(disabledRoot.getAttribute(DATA_ATTR.selected)).toBe('false')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const group = screen.getByRole('option', { name: 'Group' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(group.id)

    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    const child = await screen.findByRole('option', { name: 'Child' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(child.id)

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Last child' }).id)
    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(child.id)
    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(child.id)
    fireEvent.keyDown(trigger, { key: 'End' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Last child' }).id)

    fireEvent.keyDown(trigger, { key: 'ArrowLeft' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(group.id)
    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(first.id)
    fireEvent.keyDown(trigger, { key: 'End' })
    const last = screen.getByRole('option', { name: 'Last' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(last.id)

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('last', expect.anything())
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('false')
    expect(trigger.getAttribute(DATA_ATTR.selected)).toBe('true')
  })

  it('搜索输入与菜单之间切换焦点并维护 listbox/option 关系', async () => {
    render(
      <Cascader
        searchable
        options={ [
          {
            value: 'group',
            label: 'Group',
            children: [
              { value: 'disabled-child', label: 'Disabled child', disabled: true },
              { value: 'child', label: 'Child' },
            ],
          },
          { value: 'root', label: 'Root' },
        ] }
      />,
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    const input = await screen.findByPlaceholderText('Search...')
    const searchListbox = screen.getByRole('listbox', { name: 'Search results' })
    expect(input.getAttribute('aria-controls')).toBe(searchListbox.id)

    await waitFor(() => expect(document.activeElement).toBe(input))
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBe(
      screen.getByRole('option', { name: 'Group / Child' }).id,
    )
    fireEvent.keyDown(input, { key: 'Home' })
    expect(input.getAttribute('aria-activedescendant')).toBe(
      screen.getByRole('option', { name: 'Group / Child' }).id,
    )
    fireEvent.keyDown(input, { key: 'End' })
    expect(input.getAttribute('aria-activedescendant')).toBe(
      searchListbox.querySelector('[role="option"]:last-child')?.id,
    )

    fireEvent.keyDown(input, { key: 'ArrowRight' })
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    const rootListbox = screen.getByRole('listbox', { name: 'Options' })
    expect(trigger.getAttribute('aria-controls')).toBe(rootListbox.id)

    fireEvent.keyDown(trigger, { key: 'ArrowLeft' })
    await waitFor(() => expect(document.activeElement).toBe(input))
    expect(input.getAttribute('aria-controls')).toBe(searchListbox.id)
  })

  it('关闭或 disabled 后注销全局键盘层，不消费 document Escape', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <Cascader
        options={ options }
        onChange={ onChange }
      />,
    )

    const closedEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(closedEvent)
    expect(closedEvent.defaultPrevented).toBe(false)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'))

    const openEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(openEvent)
    expect(openEvent.defaultPrevented).toBe(true)
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))

    const afterCloseEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(afterCloseEvent)
    expect(afterCloseEvent.defaultPrevented).toBe(false)
    expect(onChange).not.toHaveBeenCalled()

    rerender(
      <Cascader
        disabled
        open
        options={ options }
        onChange={ onChange }
      />,
    )
    const disabledEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(disabledEvent)
    expect(disabledEvent.defaultPrevented).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('editable 输入支持 Home/End 与跳过 disabled 的上下键', async () => {
    const onChange = vi.fn()
    render(
      <Cascader
        editable
        options={ [
          { value: 'disabled', label: 'Disabled', disabled: true },
          { value: 'first', label: 'First' },
          { value: 'last', label: 'Last' },
        ] }
        onChange={ onChange }
        placeholder="Editable"
      />,
    )

    const input = screen.getByPlaceholderText('Editable')
    const trigger = screen.getByRole('combobox')
    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('false')
    expect(trigger.getAttribute(DATA_ATTR.selected)).toBe('false')
    fireEvent.focus(input)
    await screen.findByRole('option', { name: 'First' })
    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('true')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Last' }).id)
    fireEvent.keyDown(input, { key: 'Home' })
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'First' }).id)
    fireEvent.keyDown(input, { key: 'End' })
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Last' }).id)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('last', expect.anything())
  })

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

  it('可在选项前显示分隔线且不影响选择', () => {
    const onChange = vi.fn()
    render(
      <Cascader
        options={ [
          { value: 'preset', label: 'Preset' },
          { value: 'custom', label: 'Custom', separatorBefore: <div data-testid="custom-separator" /> },
        ] }
        onChange={ onChange }
      />,
    )

    fireEvent.click(screen.getByRole('combobox'))

    expect(screen.getByTestId('custom-separator')).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'Custom' }))
    expect(onChange.mock.calls[0]?.[0]).toBe('custom')
  })

  it('受控值未被外部接受时不保留临时选中态', () => {
    const onChange = vi.fn()
    render(
      <Cascader
        options={ [
          { value: 'preset', label: 'Preset' },
          { value: 'custom', label: 'Custom' },
        ] }
        value=""
        onChange={ onChange }
      />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Custom' }))
    expect(onChange).toHaveBeenCalledWith('custom', expect.anything())

    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('option', { name: 'Custom' }).getAttribute('aria-selected')).toBe('false')
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
    expect(selectedOption.getAttribute(DATA_ATTR.selected)).toBe('true')
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    })
    expect(scrollIntoView.mock.contexts).toContain(selectedOption)
  })

  it('关闭滚动动画后仍立即定位当前选项', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    render(
      <Cascader
        options={ options }
        value="option-9"
        dropdownHeight={ 100 }
        enableScrollAnimation={ false }
      />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    const selectedOption = await screen.findByRole('option', { name: 'Option 9' })

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'instant',
        block: 'nearest',
        inline: 'nearest',
      })
    })
    expect(scrollIntoView.mock.contexts).toContain(selectedOption)
  })
})
