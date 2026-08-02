import { act, render, renderHook } from '@testing-library/react'
import { StrictMode, useLayoutEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useKeyboardLayer } from '../useKeyboardLayer'

describe('useKeyboardLayer', () => {
  it('只把匹配按键交给栈顶层', () => {
    const onParentKeyDown = vi.fn()
    const onChildKeyDown = vi.fn()
    renderHook(() => {
      useKeyboardLayer({
        active: true,
        keys: ['Escape'],
        onKeyDown: onParentKeyDown,
      })
      useKeyboardLayer({
        active: true,
        keys: ['Enter'],
        onKeyDown: onChildKeyDown,
      })
    })

    const escapeEvent = dispatchKey('Escape')
    expect(escapeEvent.defaultPrevented).toBe(false)
    expect(onParentKeyDown).not.toHaveBeenCalled()
    expect(onChildKeyDown).not.toHaveBeenCalled()

    const enterEvent = dispatchKey('Enter')
    expect(enterEvent.defaultPrevented).toBe(true)
    expect(onChildKeyDown).toHaveBeenCalledOnce()
  })

  it('支持通过 when 匹配组合键', () => {
    const onKeyDown = vi.fn()
    renderHook(() => useKeyboardLayer({
      active: true,
      keys: ['Enter'],
      when: event => event.altKey,
      onKeyDown,
    }))

    dispatchKey('Enter')
    expect(onKeyDown).not.toHaveBeenCalled()

    dispatchKey('Enter', { altKey: true })
    expect(onKeyDown).toHaveBeenCalledOnce()
  })

  it.each([
    ['ctrlKey', { ctrlKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
    ['metaKey', { metaKey: true }],
  ] as const)('支持通过 %s 匹配修饰键', (modifier, eventInit) => {
    const onKeyDown = vi.fn()
    renderHook(() => useKeyboardLayer({
      active: true,
      keys: ['Enter'],
      [modifier]: true,
      onKeyDown,
    }))

    dispatchKey('Enter')
    expect(onKeyDown).not.toHaveBeenCalled()

    dispatchKey('Enter', eventInit)
    expect(onKeyDown).toHaveBeenCalledOnce()
  })

  it('将 keys、修饰键和 when 按 AND 关系匹配', () => {
    const onKeyDown = vi.fn()
    renderHook(() => useKeyboardLayer({
      active: true,
      keys: ['Enter'],
      ctrlKey: true,
      shiftKey: false,
      when: event => event.altKey,
      onKeyDown,
    }))

    dispatchKey('Enter', { ctrlKey: true })
    dispatchKey('Enter', { ctrlKey: true, altKey: true, shiftKey: true })
    dispatchKey('Escape', { ctrlKey: true, altKey: true })
    expect(onKeyDown).not.toHaveBeenCalled()

    dispatchKey('Enter', { ctrlKey: true, altKey: true })
    expect(onKeyDown).toHaveBeenCalledOnce()
  })

  it('处理器禁用时仍由栈顶层消费匹配事件', () => {
    const onParentKeyDown = vi.fn()
    const onChildKeyDown = vi.fn()
    renderHook(() => {
      useKeyboardLayer({
        active: true,
        keys: ['Escape'],
        onKeyDown: onParentKeyDown,
      })
      useKeyboardLayer({
        active: true,
        keys: ['Escape'],
        handlerEnabled: false,
        onKeyDown: onChildKeyDown,
      })
    })

    const event = dispatchKey('Escape')
    expect(event.defaultPrevented).toBe(true)
    expect(onChildKeyDown).not.toHaveBeenCalled()
    expect(onParentKeyDown).not.toHaveBeenCalled()
  })

  it('使用显式优先级决定真实父子组件的栈顶', () => {
    const onParentKeyDown = vi.fn()
    const onChildKeyDown = vi.fn()

    function Child() {
      useKeyboardLayer({ active: true, keys: ['Escape'], priority: 2, onKeyDown: onChildKeyDown })
      return null
    }
    function Parent() {
      useKeyboardLayer({ active: true, keys: ['Escape'], priority: 1, onKeyDown: onParentKeyDown })
      return <Child />
    }

    render(<Parent />)
    dispatchKey('Escape')
    expect(onChildKeyDown).toHaveBeenCalledOnce()
    expect(onParentKeyDown).not.toHaveBeenCalled()
  })

  it('在 layout 阶段读取同批更新后的 active 和配置', () => {
    const onParentKeyDown = vi.fn()
    const onChildKeyDown = vi.fn()
    let observedEvent: KeyboardEvent | undefined

    const { rerender } = render(
      <LayoutDispatchLayers
        childActive
        childHandlerEnabled
        childConsume
        dispatch={ false }
        onParentKeyDown={ onParentKeyDown }
        onChildKeyDown={ onChildKeyDown }
      />,
    )
    rerender(
      <LayoutDispatchLayers
        childActive={ false }
        childHandlerEnabled={ false }
        childConsume={ false }
        dispatch
        onDispatch={ (event) => { observedEvent = event } }
        onParentKeyDown={ onParentKeyDown }
        onChildKeyDown={ onChildKeyDown }
      />,
    )

    expect(onChildKeyDown).not.toHaveBeenCalled()
    expect(onParentKeyDown).toHaveBeenCalledOnce()
    expect(observedEvent?.defaultPrevented).toBe(true)
  })

  it('在 layout 阶段立即读取同批更新后的 handlerEnabled 和 consume', () => {
    const onParentKeyDown = vi.fn()
    const onChildKeyDown = vi.fn()
    let observedEvent: KeyboardEvent | undefined

    const { rerender } = render(
      <LayoutDispatchLayers
        childActive
        childHandlerEnabled
        childConsume
        dispatch={ false }
        onParentKeyDown={ onParentKeyDown }
        onChildKeyDown={ onChildKeyDown }
      />,
    )
    rerender(
      <LayoutDispatchLayers
        childActive
        childHandlerEnabled={ false }
        childConsume={ false }
        dispatch
        onDispatch={ (event) => { observedEvent = event } }
        onParentKeyDown={ onParentKeyDown }
        onChildKeyDown={ onChildKeyDown }
      />,
    )

    expect(onChildKeyDown).not.toHaveBeenCalled()
    expect(onParentKeyDown).not.toHaveBeenCalled()
    expect(observedEvent?.defaultPrevented).toBe(false)
  })

  it('consume=false 放行 DOM 事件但不向键盘栈下层分发', () => {
    const onParentKeyDown = vi.fn()
    const onChildKeyDown = vi.fn()
    renderHook(() => {
      useKeyboardLayer({ active: true, keys: ['Escape'], onKeyDown: onParentKeyDown })
      useKeyboardLayer({ active: true, keys: ['Escape'], consume: false, onKeyDown: onChildKeyDown })
    })

    const event = dispatchKey('Escape')
    expect(event.defaultPrevented).toBe(false)
    expect(onChildKeyDown).toHaveBeenCalledOnce()
    expect(onParentKeyDown).not.toHaveBeenCalled()
  })

  it('长按事件可只消费而不重复执行 handler', () => {
    const onKeyDown = vi.fn()
    renderHook(() => useKeyboardLayer({
      active: true,
      keys: ['Escape'],
      allowRepeat: false,
      onKeyDown,
    }))

    const event = dispatchKey('Escape', { repeat: true })
    expect(event.defaultPrevented).toBe(true)
    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('立即使用最新回调', () => {
    const first = vi.fn()
    const latest = vi.fn()
    const { rerender } = renderHook(
      ({ callback }) => useKeyboardLayer({ active: true, keys: ['Enter'], onKeyDown: callback }),
      { initialProps: { callback: first } },
    )

    rerender({ callback: latest })
    dispatchKey('Enter')
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledOnce()
  })

  it('同优先级时由最近重新激活的层响应', () => {
    const onFirstKeyDown = vi.fn()
    const onSecondKeyDown = vi.fn()
    const { rerender } = renderHook(
      ({ firstActive }) => {
        useKeyboardLayer({ active: firstActive, keys: ['Escape'], onKeyDown: onFirstKeyDown })
        useKeyboardLayer({ active: true, keys: ['Escape'], onKeyDown: onSecondKeyDown })
      },
      { initialProps: { firstActive: false } },
    )

    dispatchKey('Escape')
    rerender({ firstActive: true })
    dispatchKey('Escape')

    expect(onSecondKeyDown).toHaveBeenCalledOnce()
    expect(onFirstKeyDown).toHaveBeenCalledOnce()
  })

  it('支持多 key、空 keys、缺省 keys 和无 handler 契约', () => {
    const onKeyDown = vi.fn()
    const { rerender } = renderHook(
      ({ keys }: { keys?: readonly string[] }) => useKeyboardLayer({ active: true, keys, onKeyDown }),
      { initialProps: { keys: ['Enter', ' '] as readonly string[] | undefined } },
    )

    dispatchKey(' ')
    expect(onKeyDown).toHaveBeenCalledOnce()

    rerender({ keys: [] })
    expect(dispatchKey('Enter').defaultPrevented).toBe(false)

    rerender({ keys: undefined })
    expect(dispatchKey('a').defaultPrevented).toBe(true)

    const noHandler = renderHook(() => useKeyboardLayer({ active: true, keys: ['Tab'] }))
    expect(dispatchKey('Tab').defaultPrevented).toBe(true)
    noHandler.unmount()
  })

  it('strict mode 下成对注册和移除同一个 document listener', () => {
    const onKeyDown = vi.fn()
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(
      <StrictMode>
        <SingleLayer onKeyDown={ onKeyDown } />
      </StrictMode>,
    )

    dispatchKey('Escape')
    expect(onKeyDown).toHaveBeenCalledOnce()

    unmount()
    const event = dispatchKey('Escape')
    expect(event.defaultPrevented).toBe(false)
    expect(onKeyDown).toHaveBeenCalledOnce()

    const addedHandlers = addSpy.mock.calls
      .filter(([type]) => type === 'keydown')
      .map(([, handler, options]) => ({ handler, options }))
    const removedHandlers = removeSpy.mock.calls
      .filter(([type]) => type === 'keydown')
      .map(([, handler, options]) => ({ handler, options }))
    expect(addedHandlers.length).toBeGreaterThan(0)
    expect(removedHandlers).toEqual(addedHandlers)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})

function LayoutDispatchLayers(props: LayoutDispatchLayersProps) {
  const {
    childActive,
    childHandlerEnabled,
    childConsume,
    dispatch,
    onDispatch,
    onParentKeyDown,
    onChildKeyDown,
  } = props
  useKeyboardLayer({
    active: true,
    keys: ['Escape'],
    priority: 1,
    onKeyDown: onParentKeyDown,
  })
  useKeyboardLayer({
    active: childActive,
    keys: ['Escape'],
    priority: 2,
    handlerEnabled: childHandlerEnabled,
    consume: childConsume,
    onKeyDown: onChildKeyDown,
  })

  useLayoutEffect(() => {
    if (!dispatch)
      return
    const event = createKeyEvent('Escape')
    document.dispatchEvent(event)
    onDispatch?.(event)
  }, [dispatch, onDispatch])

  return null
}

function SingleLayer({ onKeyDown }: { onKeyDown: () => void }) {
  useKeyboardLayer({ active: true, keys: ['Escape'], onKeyDown })
  return null
}

function dispatchKey(key: string, init: KeyboardEventInit = {}) {
  const event = createKeyEvent(key, init)
  act(() => document.dispatchEvent(event))
  return event
}

function createKeyEvent(key: string, init: KeyboardEventInit = {}) {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  })
}

type LayoutDispatchLayersProps = {
  childActive: boolean
  childHandlerEnabled: boolean
  childConsume: boolean
  dispatch: boolean
  onDispatch?: (event: KeyboardEvent) => void
  onParentKeyDown: () => void
  onChildKeyDown: () => void
}
