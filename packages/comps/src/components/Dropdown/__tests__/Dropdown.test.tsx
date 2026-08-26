import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Dropdown } from '../Dropdown'

const items = [
  {
    name: 'Inbox',
    items: [
      { id: 'first', label: 'First item' },
      { id: 'second', label: 'Second item' },
    ],
  },
]

describe('Dropdown 可访问交互', () => {
  it('键盘选择后在同一次提交中同步 current 状态与选中样式', () => {
    function ControlledDropdown() {
      const [selectedId, setSelectedId] = useState('first')

      return (
        <Dropdown
          items={ items }
          defaultExpanded={ ['Inbox'] }
          selectedId={ selectedId }
          onClick={ setSelectedId }
          itemActiveClassName="is-active"
        />
      )
    }

    render(<ControlledDropdown />)

    const firstItem = screen.getByRole('button', { name: 'First item' })
    const secondItem = screen.getByRole('button', { name: 'Second item' })
    fireEvent.keyDown(secondItem, { key: 'Enter' })

    expect(firstItem.getAttribute('aria-current')).toBeNull()
    expect(secondItem.getAttribute('aria-current')).toBe('true')
    expect(secondItem.classList.contains('is-active')).toBe(true)
  })

  it('默认分区标题和普通项目支持键盘激活，并暴露 current 状态', () => {
    const onClick = vi.fn()
    render(
      <Dropdown
        items={ items }
        defaultExpanded={ [] }
        selectedId="first"
        onClick={ onClick }
      />,
    )

    const header = screen.getByRole('button', { name: 'Inbox' })
    expect(header.getAttribute('aria-expanded')).toBe('false')
    const contentId = header.getAttribute('aria-controls')
    expect(contentId && document.getElementById(contentId)).not.toBeNull()

    fireEvent.keyDown(header, { key: 'Enter' })
    expect(header.getAttribute('aria-expanded')).toBe('true')

    const firstItem = screen.getByRole('button', { name: 'First item' })
    expect(firstItem.getAttribute('aria-current')).toBe('true')

    fireEvent.keyDown(firstItem, { key: 'Enter' })
    fireEvent.keyDown(firstItem, { key: ' ' })
    expect(onClick.mock.calls.map(([id]) => id)).toEqual(['first', 'first'])

    fireEvent.keyDown(header, { key: ' ' })
    expect(header.getAttribute('aria-expanded')).toBe('false')
  })

  it('收起态预览支持 Tab 聚焦与 Enter/Space 展开', () => {
    render(
      <Dropdown
        items={ items }
        defaultExpanded={ [] }
        collapsedPreview
      />,
    )

    const preview = screen.getByRole('button', { name: 'First item' })
    expect(preview.getAttribute('aria-expanded')).toBe('false')
    expect(preview.getAttribute('aria-controls')).not.toBeNull()

    fireEvent.keyDown(preview, { key: 'Enter' })
    expect(preview.getAttribute('aria-expanded')).toBe('true')
  })

  it('自定义分区标题使用等价 button 语义', () => {
    render(
      <Dropdown
        items={ [
          {
            name: 'Custom section',
            header: () => <span>Custom header</span>,
            items: [{ id: 'custom', label: 'Custom item' }],
          },
        ] }
      />,
    )

    const header = screen.getByRole('button', { name: 'Custom header' })
    expect(header.getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(header, { key: ' ' })
    expect(header.getAttribute('aria-expanded')).toBe('true')
  })

  it('不可折叠的默认分区标题不暴露为无动作的 button', () => {
    render(
      <Dropdown
        items={ [
          {
            name: 'Static section',
            collapsible: false,
            items: [{ id: 'static', label: 'Static item' }],
          },
        ] }
      />,
    )

    expect(screen.queryByRole('button', { name: 'Static section' })).toBeNull()
    expect(screen.getByText('Static section').closest('div')).not.toBeNull()
  })

  it('虚拟项目复用普通项目的键盘激活与 current 语义', () => {
    const onClick = vi.fn()
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 320,
      top: 0,
      width: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
    const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 200 })
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 320 })

    try {
      render(
        <Dropdown
          items={ [
            {
              name: 'Virtual section',
              maxHeight: 200,
              virtual: true,
              items: [
                { id: 'virtual-first', label: 'Virtual first' },
                { id: 'virtual-second', label: 'Virtual second' },
              ],
            },
          ] }
          defaultExpanded={ ['Virtual section'] }
          selectedId="virtual-first"
          onClick={ onClick }
        />,
      )

      const row = screen.getByRole('button', { name: 'Virtual first' })
      expect(row.getAttribute('aria-current')).toBe('true')
      fireEvent.keyDown(row, { key: 'Enter' })
      expect(onClick).toHaveBeenCalledWith('virtual-first')
    }
    finally {
      rect.mockRestore()
      if (offsetHeight) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight)
      if (offsetWidth) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', offsetWidth)
    }
  })
})
