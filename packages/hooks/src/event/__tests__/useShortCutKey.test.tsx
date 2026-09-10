import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { KeyEnum } from 'utils/keyboard'
import type { ShortCutKeyOpts } from '../useShortCutKey'
import { useShortCutKey } from '../useShortCutKey'

describe('useShortCutKey', () => {
  it('triggers matching key combinations and prevents default by default', () => {
    const onTrigger = vi.fn()
    render(<ShortcutProbe onTrigger={ onTrigger } />)

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      cancelable: true,
    })
    window.dispatchEvent(event)

    expect(onTrigger).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it('ignores unmatched modifiers', () => {
    const onTrigger = vi.fn()
    render(<ShortcutProbe onTrigger={ onTrigger } />)

    fireEvent.keyDown(window, { key: 's' })
    fireEvent.keyDown(window, { key: 's', metaKey: true })

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('根据平台匹配 Mod 修饰键', () => {
    const originalPlatform = navigator.platform
    const originalUserAgent = navigator.userAgent
    const onTrigger = vi.fn()

    try {
      setNavigatorPlatform('MacIntel')
      setNavigatorUserAgent('Macintosh')
      const macView = render(
        <ShortcutProbe
          keyName="z"
          mod
          onTrigger={ onTrigger }
        />,
      )

      fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
      expect(onTrigger).not.toHaveBeenCalled()

      fireEvent.keyDown(window, { key: 'z', metaKey: true })
      expect(onTrigger).toHaveBeenCalledOnce()

      macView.unmount()
      onTrigger.mockClear()
      setNavigatorPlatform('Win32')
      setNavigatorUserAgent('Windows')
      render(
        <ShortcutProbe
          keyName="z"
          mod
          onTrigger={ onTrigger }
        />,
      )

      fireEvent.keyDown(window, { key: 'z', metaKey: true })
      expect(onTrigger).not.toHaveBeenCalled()

      fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
      expect(onTrigger).toHaveBeenCalledOnce()
    }
    finally {
      setNavigatorPlatform(originalPlatform)
      setNavigatorUserAgent(originalUserAgent)
    }
  })

  it('can ignore shortcuts when focus is inside editable elements', () => {
    const onTrigger = vi.fn()
    render(
      <ShortcutProbe
        ignoreWhenEditable
        keyName="Enter"
        onTrigger={ onTrigger }
        withInput
      />,
    )

    screen.getByLabelText('editable target').focus()
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('does not trigger while an IME composition is active', () => {
    const onTrigger = vi.fn()
    render(
      <ShortcutProbe
        keyName="Enter"
        onTrigger={ onTrigger }
      />,
    )

    fireEvent.keyDown(window, { key: 'Enter', isComposing: true })
    fireEvent.keyDown(window, { key: 'Enter', keyCode: 229 })

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('按下与抬起分别走 onKeyDown 和 onKeyUp', () => {
    const onDown = vi.fn()
    const onUp = vi.fn()
    render(
      <ShortcutProbe
        keyName="Escape"
        onKeyUp={ onUp }
        onTrigger={ onDown }
      />,
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onDown).toHaveBeenCalledOnce()
    expect(onUp).not.toHaveBeenCalled()

    fireEvent.keyUp(window, { key: 'Escape' })
    expect(onDown).toHaveBeenCalledOnce()
    expect(onUp).toHaveBeenCalledOnce()
  })

  /**
   * 修饰键期望对 keydown / keyup 是同一份，没法按事件类型分开：
   * Alt 抬起时 `altKey` 已经是 false，所以「长按说话」必须拆成两个 hook，
   * `useShortCutKey` 的 JSDoc 示例照此写
   *
   * 顺带记录两条 DOM 事实（只是行为示范，`KeyEnum` 末尾有 `(string & {})`，
   * 任何字符串都合法，这里约束不了键名枚举本身）：Ctrl 的 `key` 是 `Control`，
   * 写 `Ctrl` 按到天亮也不会命中
   */
  it('监听修饰键自身要按事件方向拆成两个 hook', () => {
    const onDown = vi.fn()
    const onUp = vi.fn()
    const onMissedUp = vi.fn()
    const onCtrlDown = vi.fn()
    const onDeadKeyName = vi.fn()

    function ModifierProbe() {
      const alt: KeyEnum = 'Alt'
      const control: KeyEnum = 'Control'

      useShortCutKey({ key: alt, alt: true, onKeyDown: onDown })
      useShortCutKey({ key: alt, alt: false, onKeyUp: onUp })
      /** 错误示范：同一个 hook 共用 ctrl: true，抬起时 ctrlKey 已是 false */
      useShortCutKey({ key: control, ctrl: true, onKeyDown: onCtrlDown, onKeyUp: onMissedUp })
      /** `Ctrl` 不是 `KeyboardEvent.key` 的取值，按下 Control 也不会命中 */
      useShortCutKey({ key: 'Ctrl', onKeyDown: onDeadKeyName })

      return null
    }

    render(<ModifierProbe />)

    fireEvent.keyDown(window, { key: 'Alt', altKey: true })
    expect(onDown).toHaveBeenCalledOnce()
    expect(onUp).not.toHaveBeenCalled()

    fireEvent.keyUp(window, { key: 'Alt', altKey: false })
    expect(onUp).toHaveBeenCalledOnce()

    fireEvent.keyDown(window, { key: 'Control', ctrlKey: true })
    fireEvent.keyUp(window, { key: 'Control', ctrlKey: false })
    expect(onCtrlDown).toHaveBeenCalledOnce()
    expect(onMissedUp).not.toHaveBeenCalled()
    expect(onDeadKeyName).not.toHaveBeenCalled()
  })

  it('只传 onKeyUp 时不监听 keydown', () => {
    const onUp = vi.fn()
    render(
      <ShortcutProbeKeyUpOnly
        onKeyUp={ onUp }
      />,
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onUp).not.toHaveBeenCalled()

    fireEvent.keyUp(window, { key: 'Escape' })
    expect(onUp).toHaveBeenCalledOnce()
  })

  it('传入 code 时按物理键位匹配，忽略被 Option 改写的 key', () => {
    const onTrigger = vi.fn()
    render(
      <ShortcutProbe
        alt
        code="KeyA"
        keyName="a"
        onTrigger={ onTrigger }
      />,
    )

    /** macOS 上 Option + A 的 event.key 是 å，只有 code 能稳定命中 */
    fireEvent.keyDown(window, { key: 'å', code: 'KeyA', altKey: true })
    expect(onTrigger).toHaveBeenCalledOnce()
  })

  it('allowRepeat=false 时忽略长按重复事件', () => {
    const onTrigger = vi.fn()
    render(
      <ShortcutProbe
        allowRepeat={ false }
        keyName="Enter"
        onTrigger={ onTrigger }
      />,
    )

    fireEvent.keyDown(window, { key: 'Enter', repeat: true })
    expect(onTrigger).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onTrigger).toHaveBeenCalledOnce()
  })

  it('respects disabled and preventDefault options', () => {
    const disabledTrigger = vi.fn()
    const allowedTrigger = vi.fn()
    const { rerender } = render(
      <ShortcutProbe
        enabled={ false }
        onTrigger={ disabledTrigger }
      />,
    )

    fireEvent.keyDown(window, { key: 's', ctrlKey: true })
    expect(disabledTrigger).not.toHaveBeenCalled()

    rerender(
      <ShortcutProbe
        onTrigger={ allowedTrigger }
        preventDefault={ false }
      />,
    )

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      cancelable: true,
    })
    window.dispatchEvent(event)

    expect(allowedTrigger).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(false)
  })
})

function ShortcutProbe({
  keyName = 's',
  onTrigger,
  withInput = false,
  ...options
}: ShortcutProbeProps) {
  useShortCutKey({
    key: keyName,
    ctrl: keyName === 's',
    onKeyDown: onTrigger,
    ...options,
  })

  return withInput
    ? <input aria-label="editable target" />
    : null
}

function ShortcutProbeKeyUpOnly({ onKeyUp }: { onKeyUp: (event: KeyboardEvent) => void }) {
  useShortCutKey({ key: 'Escape', onKeyUp })
  return null
}

type ShortcutProbeProps =
  & Partial<Omit<ShortCutKeyOpts, 'key' | 'onKeyDown'>>
  & {
    keyName?: string
    onTrigger: (event: KeyboardEvent) => void
    withInput?: boolean
  }

function setNavigatorPlatform(value: string) {
  Object.defineProperty(navigator, 'platform', {
    configurable: true,
    value,
  })
}

function setNavigatorUserAgent(value: string) {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value,
  })
}
