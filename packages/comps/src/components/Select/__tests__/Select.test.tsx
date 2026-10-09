import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { KeyboardLayerHostContext } from '../../../hooks/useKeyboardLayerHost'
import { Select } from '../Select'
import type { Option } from '../types'

const options: Option[] = [
  { value: 'email', label: 'Email' },
]

describe('select', () => {
  it('label 作为触发器的无障碍名称，点击标签聚焦触发器', () => {
    render(<Select options={ options } label="Speech language" />)

    const trigger = screen.getByRole('combobox', { name: 'Speech language' })
    fireEvent.click(screen.getByText('Speech language'))
    expect(document.activeElement).toBe(trigger)
  })

  it('aria-labelledby 可指向调用方自行布局的标签', () => {
    render(
      <>
        <span id="external-label">Speech language</span>
        <Select options={ options } aria-labelledby="external-label" />
      </>,
    )

    expect(screen.getByRole('combobox', { name: 'Speech language' })).toBeTruthy()
  })

  it('默认 trigger hover 时显示清除按钮并清空单选值', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()

    render(
      <Select
        options={ options }
        defaultValue="email"
        clearable
        onChange={ onChange }
        onClear={ onClear }
      />,
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.mouseEnter(trigger.firstElementChild!)
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))

    expect(onChange.mock.calls[0]?.[0]).toBe('')
    expect(onClear).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()
  })

  it('受控模式下父级不接受改动时，显示值与选中态保持原值', () => {
    const selectOptions: Option[] = [
      { value: 'email', label: 'Email' },
      { value: 'sms', label: 'SMS' },
    ]
    const onChange = vi.fn()

    /** 父级收到 onChange 但不改 value（如二次确认被取消） */
    render(<Select options={ selectOptions } value="email" onChange={ onChange } />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger.firstElementChild!)
    fireEvent.click(screen.getByRole('option', { name: 'SMS' }))

    expect(onChange.mock.calls[0]?.[0]).toBe('sms')
    expect(trigger.firstElementChild?.textContent).toBe('Email')

    fireEvent.click(trigger.firstElementChild!)
    expect(screen.getByRole('option', { name: 'Email' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('option', { name: 'SMS' }).getAttribute('aria-selected')).toBe('false')
  })

  it('键盘导航只经过 enabled option，并同步 listbox ARIA 状态', () => {
    const onChange = vi.fn()
    const selectOptions: Option[] = [
      { value: 'disabled-start', label: 'Disabled start', disabled: true },
      { value: 'first', label: 'First' },
      { value: 'disabled-middle', label: 'Disabled middle', disabled: true },
      { value: 'last', label: 'Last' },
      { value: 'disabled-end', label: 'Disabled end', disabled: true },
    ]

    render(<Select options={ selectOptions } onChange={ onChange } />)

    const trigger = screen.getByRole('combobox')
    expect(screen.queryByRole('listbox')).toBeNull()
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })

    const listbox = screen.getByRole('listbox')
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id)
    expect(document.activeElement).toBe(trigger)
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'First' }).id)
    expect(screen.getByRole('option', { name: 'First' }).getAttribute('aria-selected')).toBe('false')
    expect(screen.getByRole('option', { name: 'Disabled start' }).getAttribute('aria-disabled')).toBe('true')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Last' }).id)

    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'First' }).id)

    fireEvent.keyDown(trigger, { key: 'End' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Last' }).id)

    fireEvent.keyDown(trigger, { key: 'Home' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'First' }).id)

    fireEvent.click(screen.getByRole('option', { name: 'Disabled start' }))
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.keyDown(trigger, { key: 'End' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange.mock.calls[0]?.[0]).toBe('last')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('级联菜单进入子层时跳过 disabled option', () => {
    const onChange = vi.fn()
    const selectOptions: Option[] = [
      { value: 'disabled-root', label: 'Disabled root', disabled: true },
      {
        value: 'group',
        label: 'Group',
        children: [
          { value: 'disabled-child', label: 'Disabled child', disabled: true },
          { value: 'leaf', label: 'Leaf' },
        ],
      },
      { value: 'last', label: 'Last' },
    ]

    render(<Select options={ selectOptions } onChange={ onChange } />)

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Group' }).id)

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(screen.getAllByRole('listbox')).toHaveLength(2)
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Leaf' }).id)
    expect(screen.getByRole('option', { name: 'Disabled child' }).getAttribute('aria-disabled')).toBe('true')

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange.mock.calls[0]?.[0]).toBe('leaf')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('Escape 只在打开且可用时由全局键盘层消费', () => {
    const selectOptions: Option[] = [{ value: 'first', label: 'First' }]
    const { rerender } = render(<Select options={ selectOptions } />)

    const closedEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(closedEvent)
    expect(closedEvent.defaultPrevented).toBe(false)

    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })

    const openEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    act(() => document.dispatchEvent(openEvent))
    expect(openEvent.defaultPrevented).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    rerender(<Select options={ selectOptions } disabled />)
    const disabledEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(disabledEvent)
    expect(disabledEvent.defaultPrevented).toBe(false)
  })

  it('editable input 的 Escape 仍回退已提交值', () => {
    render(
      <Select
        options={ options }
        defaultValue="email"
        editable
      />,
    )

    const trigger = screen.getByRole('combobox')
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'custom' } })
    expect(input.value).toBe('custom')

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('email')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('Select renderDropdownFooter / renderValue', () => {
  const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ]

  it('footer 输入框内按键不触发选项选择，点击不关闭面板，Esc 关闭', () => {
    const onChange = vi.fn()
    render(
      <Select
        options={ options }
        multiple
        onChange={ onChange }
        renderDropdownFooter={ () => <input aria-label="other" /> }
      />,
    )
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
    const input = screen.getByLabelText('other')

    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: ' ' })
    fireEvent.click(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox').getAttribute(DATA_ATTR.state)).toBe('open')

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.getByRole('combobox').getAttribute(DATA_ATTR.state)).toBe('closed')
  })

  it('renderValue 在 value 为空时也可接管 trigger，返回 null 回退默认显示', () => {
    const { rerender } = render(
      <Select options={ options } multiple placeholder="pick" renderValue={ () => 'custom summary' } />,
    )
    expect(screen.getByText('custom summary')).toBeTruthy()

    rerender(<Select options={ options } multiple placeholder="pick" renderValue={ () => null } />)
    expect(screen.getByText('pick')).toBeTruthy()
  })

  it('footer 上下文暴露 maxReached', () => {
    render(
      <Select
        options={ options }
        multiple
        maxSelect={ 1 }
        defaultValue={ ['a'] }
        renderDropdownFooter={ ({ maxReached }) => (
          <span>
            { maxReached
              ? 'full'
              : 'free' }
          </span>
        ) }
      />,
    )
    expect(screen.getByText('full')).toBeTruthy()
  })
})

describe('Select 下拉面板定位', () => {
  const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ]
  const cascadeOptions = [
    { value: 'p', label: 'P', children: [{ value: 'c', label: 'C' }] },
  ]

  /** 面板 padding + border 等外框高度 */
  const CHROME = 16
  const VIEWPORT = 700

  /**
   * jsdom 没有布局，这里用一个自洽的模型代替：
   * - 触发器高 40，顶部位置可在测试中途改变
   * - 列表高度 = min(内容高, 自身 maxHeight, 面板 maxHeight − 外框)，面板高度 = 外框 + 最高的列表
   * 关键是「限高会让面板变矮」，旧的常量 mock 表达不了这点，因此抓不到限高与翻面互锁的 bug
   */
  function mockLayout(layout: { triggerTop: number, listContent: number }) {
    const px = (value: string) => value
      ? Number.parseFloat(value)
      : Infinity
    const listboxHeight = (el: HTMLElement) => Math.min(
      layout.listContent,
      px(el.style.maxHeight),
      px(el.parentElement!.style.maxHeight) - CHROME,
    )
    const isPanel = (el: HTMLElement) => el.querySelector(':scope > [role="listbox"]') != null

    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => {
      const top = layout.triggerTop
      return { top, bottom: top + 40, left: 0, right: 200, width: 200, height: 40, x: 0, y: top, toJSON: () => ({}) } as DOMRect
    })
    const offsetSpy = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute('role') === 'listbox') return listboxHeight(this)
      if (isPanel(this)) {
        const lists = Array.from(this.querySelectorAll<HTMLElement>(':scope > [role="listbox"]'))
        return CHROME + Math.max(...lists.map(listboxHeight))
      }
      return 40
    })
    const scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.getAttribute('role') === 'listbox'
        ? layout.listContent
        : 0
    })
    vi.stubGlobal('innerHeight', VIEWPORT)

    return () => {
      rectSpy.mockRestore()
      offsetSpy.mockRestore()
      scrollSpy.mockRestore()
      vi.unstubAllGlobals()
    }
  }

  function openPanel(props: Partial<React.ComponentProps<typeof Select>> = {}) {
    render(<Select options={ options } { ...props } />)
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
    return screen.getAllByRole('listbox')[0].parentElement as HTMLElement
  }

  it('回归：下方只剩少量空间时翻到上方并保持完整高度，不能先按下方空间限高导致永不翻面', () => {
    /** 触发器底 640，下方可用 700 − 640 − 4 − 8 = 48；面板自然高 16 + 156 = 172 */
    const restore = mockLayout({ triggerTop: 600, listContent: 156 })
    const panel = openPanel()

    /** 修复前：先按下方 48px 限高 → 面板只剩一项、恰好放得下 → 不翻面，top 为 644 */
    expect(panel.style.top).toBe('424px')
    expect(panel.style.maxHeight).toBe('200px')
    restore()
  })

  it('内容自然高度放得下时留在下方，不按配置上限提前翻面', () => {
    /** 下方可用 48，自然高 16 + 24 = 40；若按 maxHeight 200 判断会被误翻到上方 */
    const restore = mockLayout({ triggerTop: 600, listContent: 24 })
    const panel = openPanel()

    expect(panel.style.top).toBe('644px')
    restore()
  })

  it('两侧都放不下时选空间更大的一侧并限高到可用空间', () => {
    const restore = mockLayout({ triggerTop: 150, listContent: 884 })
    const panel = openPanel({ dropdownMaxHeight: 900 })

    expect(panel.style.top).toBe('194px')
    /** 视口 700 − 触发器底 190 − 间距 4 − 边距 8 */
    expect(panel.style.maxHeight).toBe('498px')
    restore()
  })

  it('打开时重新量取触发器位置：挂载后页面布局变化、期间没有滚动事件，也不能用旧位置', () => {
    const layout = { triggerTop: 100, listContent: 884 }
    const restore = mockLayout(layout)
    render(<Select options={ options } dropdownMaxHeight={ 900 } />)

    /** 模拟挂载后触发器被布局推到视口底部，且没有 scroll / resize 事件 */
    layout.triggerTop = 560
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })

    const panel = screen.getByRole('listbox').parentElement as HTMLElement
    /** 上方可用：触发器顶 560 − 间距 4 − 边距 8 */
    expect(panel.style.maxHeight).toBe('548px')
    expect(panel.style.top).toBe('8px')
    restore()
  })

  it('级联面板同样按可用空间限制每列高度', () => {
    const restore = mockLayout({ triggerTop: 150, listContent: 884 })
    render(<Select options={ cascadeOptions } dropdownMaxHeight={ 900 } />)
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })

    const column = screen.getAllByRole('listbox')[0]
    /** 下方可用 498 − 面板外框 16 */
    expect(column.style.maxHeight).toBe('482px')
    expect((column.parentElement as HTMLElement).style.top).toBe('194px')
    restore()
  })

  it('点击面板内部不关闭，点击面板外部关闭（面板在 Portal 里）', () => {
    render(<Select options={ options } renderDropdownFooter={ () => <input aria-label="footer" /> } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })

    fireEvent.mouseDown(screen.getByLabelText('footer'))
    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('open')

    fireEvent.mouseDown(document.body)
    expect(trigger.getAttribute(DATA_ATTR.state)).toBe('closed')
  })

  it('嵌在弹窗等宿主里时，Portal 面板的层级压过宿主', () => {
    render(
      <KeyboardLayerHostContext.Provider value={ 1400 }>
        <Select options={ options } />
      </KeyboardLayerHostContext.Provider>,
    )
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })

    const panel = screen.getByRole('listbox').parentElement as HTMLElement
    expect(Number(panel.style.zIndex)).toBeGreaterThan(1400)
  })
})
