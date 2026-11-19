import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Form } from '../../Form'
import { Cascader } from '../Cascader'
import type { CascaderOption } from '../types'

const options: CascaderOption[] = [
  {
    value: 'fruit',
    label: 'Fruit',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'avocado', label: 'Avocado', disabled: true },
      { value: 'apricot', label: 'Apricot' },
    ],
  },
  {
    value: 'veg',
    label: <span>Vegetable</span>,
    searchLabel: 'Vegetable',
    children: [{ value: 'carrot', label: 'Carrot' }],
  },
]

function activeOptionName(trigger: HTMLElement) {
  const id = trigger.getAttribute('aria-activedescendant')
  return id
    ? document.getElementById(id)?.textContent
    : null
}

describe('Cascader 点击外部', () => {
  it('仅打开期间监听：关闭时点击外部不触发回调与校验，打开后点击外部只触发一次', () => {
    const onClickOutside = vi.fn()
    const onOpenChange = vi.fn()
    const validator = vi.fn(() => 'Required')

    render(
      <Form validators={ { kind: validator } }>
        <Cascader
          name="kind"
          options={ options }
          onClickOutside={ onClickOutside }
          onOpenChange={ onOpenChange }
        />
      </Form>,
    )

    fireEvent.mouseDown(document.body)
    expect(onClickOutside).not.toHaveBeenCalled()
    expect(validator).not.toHaveBeenCalled()

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    /** 点击浮层内部不关闭 */
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Fruit' }))
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    fireEvent.mouseDown(document.body)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(onClickOutside).toHaveBeenCalledTimes(1)
    expect(validator).toHaveBeenCalledTimes(1)

    fireEvent.mouseDown(document.body)
    expect(onClickOutside).toHaveBeenCalledTimes(1)
  })

  it('命中 clickOutsideIgnoreSelector 的元素视为内部', () => {
    render(
      <>
        <div data-keep-open>outside popover</div>
        <Cascader options={ options } clickOutsideIgnoreSelector="[data-keep-open]" />
      </>,
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    fireEvent.mouseDown(screen.getByText('outside popover'))
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('Cascader hover 触发', () => {
  it('移出触发器后延迟关闭，期间移入浮层取消关闭', () => {
    vi.useFakeTimers()
    try {
      render(<Cascader options={ options } triggerMode="hover" hoverCloseDelay={ 100 } />)
      const trigger = screen.getByRole('combobox')

      fireEvent.mouseEnter(trigger)
      expect(trigger.getAttribute('aria-expanded')).toBe('true')

      fireEvent.mouseLeave(trigger)
      act(() => {
        vi.advanceTimersByTime(50)
      })
      /** 鼠标处理器挂在浮层面板（圆角容器）上 */
      const panel = screen.getAllByRole('listbox')[0]!.closest('[class*="rounded-[20px]"]')!
      fireEvent.mouseEnter(panel)
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(trigger.getAttribute('aria-expanded')).toBe('true')

      fireEvent.mouseLeave(trigger)
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
    }
    finally {
      vi.useRealTimers()
    }
  })
})

describe('Cascader typeahead', () => {
  it('在当前列按首字母高亮，跳过 disabled，JSX label 使用 searchLabel', () => {
    vi.useFakeTimers()
    try {
      render(<Cascader options={ options } />)
      const trigger = screen.getByRole('combobox')
      fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(activeOptionName(trigger)).toBe('Fruit')

      fireEvent.keyDown(trigger, { key: 'v' })
      expect(activeOptionName(trigger)).toBe('Vegetable')

      act(() => {
        vi.advanceTimersByTime(600)
      })
      fireEvent.keyDown(trigger, { key: 'f' })
      fireEvent.keyDown(trigger, { key: 'ArrowRight' })
      expect(activeOptionName(trigger)).toBe('Apple')

      act(() => {
        vi.advanceTimersByTime(600)
      })
      fireEvent.keyDown(trigger, { key: 'a' })
      expect(activeOptionName(trigger)).toBe('Apricot')
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('上下键到头停住', () => {
    render(<Cascader options={ options } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(activeOptionName(trigger)).toBe('Fruit')
    fireEvent.keyDown(trigger, { key: 'End' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(activeOptionName(trigger)).toBe('Vegetable')
  })
})

describe('Cascader 菜单栈', () => {
  it('打开期间高亮项变 disabled 时，高亮归一到可用项，键盘从归一后的位置继续', () => {
    const build = (cherryDisabled: boolean): CascaderOption[] => [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry', disabled: cherryDisabled },
    ]

    const { rerender } = render(<Cascader options={ build(false) } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'End' })
    expect(activeOptionName(trigger)).toBe('Cherry')

    /** value 结构不变，菜单栈不重置，原高亮下标指向 disabled 项 */
    rerender(<Cascader options={ build(true) } />)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(activeOptionName(trigger)).toBe('Apple')
    expect(screen.getByRole('option', { name: 'Cherry' }).getAttribute(DATA_ATTR.highlighted)).toBe('false')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(activeOptionName(trigger)).toBe('Banana')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(activeOptionName(trigger)).toBe('Banana')
  })

  it('options 结构不变仅 label 变化时保留展开层级并展示新 label', () => {
    const build = (suffix: string): CascaderOption[] => [
      {
        value: 'fruit',
        label: `Fruit${suffix}`,
        children: [{ value: 'apple', label: `Apple${suffix}` }],
      },
    ]

    const { rerender } = render(<Cascader options={ build('') } />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    expect(screen.getAllByRole('listbox')).toHaveLength(2)

    rerender(<Cascader options={ build(' v2') } />)
    expect(screen.getAllByRole('listbox')).toHaveLength(2)
    expect(screen.getByRole('option', { name: 'Apple v2' })).toBeTruthy()
    expect(activeOptionName(trigger)).toBe('Apple v2')
  })
})
