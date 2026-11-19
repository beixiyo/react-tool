import { render, screen } from '@testing-library/react'
import { createRef, StrictMode } from 'react'
import type { Ref, RefObject } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useComposedRef } from '../ref'

describe('useComposedRef', () => {
  it('调用 callback cleanup 而不向其传 null，并清空内部 ref', () => {
    const cleanup = vi.fn()
    const callbackRef = vi.fn((node: HTMLDivElement | null) => {
      if (node) return cleanup
    })
    const onMounted = vi.fn()
    const onUnmounted = vi.fn()
    let internalRef: RefObject<HTMLDivElement | null> | undefined

    const view = render(
      <RefHarness
        ref={ callbackRef }
        onMounted={ onMounted }
        onUnmounted={ onUnmounted }
        onElementRef={ (ref) => {
          internalRef = ref
        } }
      />,
    )
    const node = screen.getByTestId('target') as HTMLDivElement

    expect(callbackRef).toHaveBeenCalledWith(node)
    expect(onMounted).toHaveBeenCalledWith(node)
    expect(internalRef?.current).toBe(node)

    view.unmount()

    expect(cleanup).toHaveBeenCalledOnce()
    expect(callbackRef).toHaveBeenCalledTimes(1)
    expect(onMounted).toHaveBeenLastCalledWith(null)
    expect(onUnmounted).toHaveBeenCalledOnce()
    expect(internalRef?.current).toBeNull()
  })

  it('分离时向旧式 callback ref 传入 null', () => {
    const callbackRef = vi.fn((_node: HTMLDivElement | null) => {})
    const view = render(<RefHarness ref={ callbackRef } />)
    const node = screen.getByTestId('target')

    expect(callbackRef).toHaveBeenCalledWith(node)
    view.unmount()
    expect(callbackRef).toHaveBeenLastCalledWith(null)
  })

  it('分离时清空 object ref', () => {
    const objectRef = createRef<HTMLDivElement>()
    const view = render(<RefHarness ref={ objectRef } />)

    expect(objectRef.current).toBe(screen.getByTestId('target'))
    view.unmount()
    expect(objectRef.current).toBeNull()
  })

  it('替换 ref 时先清理旧 callback，再连接新 ref', () => {
    const oldCleanup = vi.fn()
    const newCleanup = vi.fn()
    const oldRef = vi.fn((node: HTMLDivElement | null) => {
      if (node) return oldCleanup
    })
    const newRef = vi.fn((node: HTMLDivElement | null) => {
      if (node) return newCleanup
    })
    let internalRef: RefObject<HTMLDivElement | null> | undefined

    const view = render(
      <RefHarness
        ref={ oldRef }
        onElementRef={ (ref) => {
          internalRef = ref
        } }
      />,
    )
    const node = screen.getByTestId('target')

    view.rerender(
      <RefHarness
        ref={ newRef }
        onElementRef={ (ref) => {
          internalRef = ref
        } }
      />,
    )

    expect(oldCleanup).toHaveBeenCalledOnce()
    expect(oldRef).toHaveBeenCalledTimes(1)
    expect(newRef).toHaveBeenCalledWith(node)
    expect(internalRef?.current).toBe(node)

    view.unmount()
    expect(newCleanup).toHaveBeenCalledOnce()
    expect(newRef).toHaveBeenCalledTimes(1)
    expect(internalRef?.current).toBeNull()
  })

  it('StrictMode 重复连接时执行 cleanup，且不向其传入 null', () => {
    const cleanup = vi.fn()
    const callbackRef = vi.fn((node: HTMLDivElement | null) => {
      if (node) return cleanup
    })

    const view = render(
      <StrictMode>
        <RefHarness ref={ callbackRef } />
      </StrictMode>,
    )
    const node = screen.getByTestId('target')

    expect(callbackRef.mock.calls.some(([value]) => value === node)).toBe(true)
    expect(callbackRef.mock.calls.every(([value]) => value !== null)).toBe(true)

    view.unmount()

    const attachCount = callbackRef.mock.calls.filter(([value]) => value !== null).length
    expect(cleanup).toHaveBeenCalledTimes(attachCount)
    expect(callbackRef.mock.calls.every(([value]) => value !== null)).toBe(true)
  })
})

function RefHarness({
  ref,
  onMounted,
  onUnmounted,
  onElementRef,
}: {
  ref?: Ref<HTMLDivElement>
  onMounted?: (node: HTMLDivElement | null) => void
  onUnmounted?: () => void
  onElementRef?: (ref: RefObject<HTMLDivElement | null>) => void
}) {
  const { setRef, elementRef } = useComposedRef({ ref, onMounted, onUnmounted })
  onElementRef?.(elementRef)

  return <div ref={ setRef } data-testid="target" />
}
