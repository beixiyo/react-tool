import type { ShortCutKeyOpts } from '../useShortCutKey'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useShortCutKey } from '../useShortCutKey'

describe('useShortCutKey', () => {
  it('触发匹配的组合键并默认阻止默认行为', () => {
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

  it('忽略不匹配的修饰键', () => {
    const onTrigger = vi.fn()
    render(<ShortcutProbe onTrigger={ onTrigger } />)

    fireEvent.keyDown(window, { key: 's' })
    fireEvent.keyDown(window, { key: 's', metaKey: true })

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('焦点位于可编辑元素内时可忽略快捷键', () => {
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

  it('遵循 disabled 和 preventDefault 选项', () => {
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
    fn: onTrigger,
    ...options,
  })

  return withInput
    ? <input aria-label="editable target" />
    : null
}

type ShortcutProbeProps = Partial<Omit<ShortCutKeyOpts, 'fn' | 'key'>>
  & {
    keyName?: string
    onTrigger: (event: KeyboardEvent) => void
    withInput?: boolean
  }
