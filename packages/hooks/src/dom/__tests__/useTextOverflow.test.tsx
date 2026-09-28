import { render, screen, waitFor } from '@testing-library/react'
import { useLayoutEffect } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { useTextOverflow } from '../useTextOverflow'

/**
 * Chromium 中被 ResizeObserver 观察的元素脱离文档时，观察器会收到一次全 0 尺寸回调，
 * 全局 setup 里的空实现模拟不了这条路径，这里换成「观察到元素脱管就触发回调」的版本，
 * 才能复现「元素卸载时状态被清掉、重新挂载后无人再测量」的真实时序
 */
class DetachFiringResizeObserver implements ResizeObserver {
  private readonly targets = new Set<Element>()
  private readonly domObserver = new MutationObserver(() => {
    for (const target of this.targets) {
      if (!target.isConnected) this.callback()
    }
  })

  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element): void {
    this.targets.add(target)
    this.domObserver.observe(document.body, { childList: true, subtree: true })
  }

  unobserve(target: Element): void {
    this.targets.delete(target)
  }

  disconnect(): void {
    this.targets.clear()
    this.domObserver.disconnect()
  }
}

const SetupResizeObserver = globalThis.ResizeObserver

afterEach(() => {
  globalThis.ResizeObserver = SetupResizeObserver
})

describe('useTextOverflow', () => {
  it('元素卸载后重新挂载时重新检测溢出', async () => {
    globalThis.ResizeObserver = DetachFiringResizeObserver

    const { rerender } = render(<Probe shown={ true } overflowing={ true } />)
    expect(screen.getByTestId('flag').textContent).toBe('true')

    /** 元素卸载（如进入编辑态）：脱管回调把状态清掉是符合浏览器事实的 */
    rerender(<Probe shown={ false } overflowing={ true } />)
    await waitFor(() => expect(screen.getByTestId('flag').textContent).toBe('false'))

    /** 元素重新挂载（如取消编辑）：必须对新元素重新测量，而不是沿用脱管后的 false */
    rerender(<Probe shown={ true } overflowing={ true } />)
    await waitFor(() => expect(screen.getByTestId('flag').textContent).toBe('true'))
  })
})

interface ProbeProps {
  shown: boolean
  overflowing: boolean
}

function Probe({ shown, overflowing }: ProbeProps) {
  const { contentRef, isOverflowing } = useTextOverflow()

  /**
   * jsdom 不做布局，按 props 伪造尺寸；脱管后浏览器读到全 0，这里保持一致，
   * 否则脱管回调会把状态算成仍溢出，测不出「重挂后无人测量」的问题
   */
  useLayoutEffect(() => {
    const element = contentRef.current
    if (!element) return

    Object.defineProperty(element, 'scrollWidth', {
      configurable: true,
      get: () => (element.isConnected && overflowing
        ? 500
        : 0),
    })
    Object.defineProperty(element, 'clientWidth', {
      configurable: true,
      get: () => (element.isConnected
        ? 100
        : 0),
    })
  })

  return (
    <>
      { shown && <div ref={ contentRef as React.RefObject<HTMLDivElement | null> }>标题文本</div> }
      <span data-testid="flag">{ String(isOverflowing) }</span>
    </>
  )
}
