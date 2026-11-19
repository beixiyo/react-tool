// @vitest-environment jsdom

/**
 * SearchBar 聚焦快捷键与默认文案契约：
 * 默认 Mod+K、可自定义 / 关闭、限定监听目标、多实例只有一个响应
 */
import { act, fireEvent, render } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SearchBar } from '../SearchBar'

/** jsdom 不是 Apple 平台，Mod 解析为 Ctrl */
function pressCtrl(key: string, target: Element | Window = window, init: KeyboardEventInit = {}) {
  fireEvent.keyDown(target, { key, ctrlKey: true, ...init })
}

function setPlatform(platform: string, userAgent: string) {
  Object.defineProperty(navigator, 'platform', { configurable: true, value: platform })
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent })
}

describe('SearchBar 快捷键', () => {
  it('默认 Ctrl+K 聚焦输入框，焦点在其它输入框内也响应', () => {
    const { getByRole } = render(
      <>
        <input aria-label="other" />
        <SearchBar placeholder="search" />
      </>,
    )
    const other = getByRole('textbox', { name: 'other' })
    other.focus()

    pressCtrl('k', other)
    expect(document.activeElement).toBe(getByRole('combobox'))
  })

  it('默认在非 Apple 平台上 Meta+K 也能触发', () => {
    const { getByRole } = render(<SearchBar />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(document.activeElement).toBe(getByRole('combobox'))
  })

  describe('Apple 平台', () => {
    beforeEach(() => setPlatform('MacIntel', 'Mozilla/5.0 (Macintosh)'))
    afterEach(() => setPlatform('', 'jsdom'))

    it('⌘K 与 Ctrl+K 都能触发，底部提示显示 ⌘K', () => {
      const { getByRole, getByText, unmount } = render(<SearchBar actions={ [] } />)
      const input = getByRole('combobox')

      fireEvent.keyDown(window, { key: 'k', metaKey: true })
      expect(document.activeElement).toBe(input)
      expect(getByText('按 ⌘K 打开命令')).toBeTruthy()
      unmount()

      const second = render(<SearchBar />)
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
      expect(document.activeElement).toBe(second.getByRole('combobox'))
    })
  })

  it('传数组时命中任一组合即可，提示展示首项', () => {
    const { getByRole, getByText } = render(
      <SearchBar actions={ [] } shortcut={ [{ key: '/', mod: true }, { key: 'p', alt: true }] } />,
    )
    const input = getByRole('combobox')

    fireEvent.keyDown(window, { key: 'p', altKey: true })
    expect(document.activeElement).toBe(input)
    expect(getByText('按 Ctrl+/ 打开命令')).toBeTruthy()
  })

  it('自定义快捷键后旧快捷键不再生效', () => {
    const { getByRole } = render(<SearchBar shortcut={ { key: 'j', mod: true, shift: true } } />)
    const input = getByRole('combobox')

    pressCtrl('k')
    expect(document.activeElement).not.toBe(input)

    pressCtrl('j', window, { shiftKey: true })
    expect(document.activeElement).toBe(input)
  })

  it('shortcut=false / null 时不监听', () => {
    const { getAllByRole } = render(
      <>
        <SearchBar shortcut={ false } />
        <SearchBar shortcut={ null } />
      </>,
    )
    pressCtrl('k')

    for (const input of getAllByRole('combobox')) {
      expect(document.activeElement).not.toBe(input)
    }
  })

  it('多实例共用 window 时只有先挂载的实例响应', () => {
    const { getAllByRole } = render(
      <>
        <SearchBar placeholder="first" />
        <SearchBar placeholder="second" />
      </>,
    )
    const [first] = getAllByRole('combobox')

    pressCtrl('k')
    expect(document.activeElement).toBe(first)
  })

  it('shortcutTarget 为元素时只响应该元素内的按键', () => {
    function Scoped() {
      const [scope, setScope] = useState<HTMLDivElement | null>(null)
      return (
        <div ref={ setScope } data-testid="scope">
          <SearchBar shortcutTarget={ scope } />
        </div>
      )
    }

    const { getByRole, getByTestId } = render(<Scoped />)
    const input = getByRole('combobox')

    pressCtrl('k')
    expect(document.activeElement).not.toBe(input)

    pressCtrl('k', getByTestId('scope'))
    expect(document.activeElement).toBe(input)
  })
})

describe('SearchBar 默认文案', () => {
  const actions = [{ id: '1', label: 'Apple', icon: null }]

  it('空态与底部提示为默认文案，并按快捷键配置展示', () => {
    const { getByRole, getByText } = render(<SearchBar actions={ actions } value="zzz" />)
    act(() => getByRole('combobox').focus())

    expect(getByText('没有找到匹配的结果')).toBeTruthy()
    expect(getByText('按 Ctrl+K 打开命令')).toBeTruthy()
    expect(getByText('ESC 取消')).toBeTruthy()
  })

  it('关闭快捷键后不展示快捷键提示', () => {
    const { getByRole, getByText, queryByText } = render(
      <SearchBar actions={ actions } value="zzz" shortcut={ false } />,
    )
    act(() => getByRole('combobox').focus())

    expect(getByText('没有找到匹配的结果')).toBeTruthy()
    expect(queryByText(/打开命令/)).toBeNull()
  })
})
