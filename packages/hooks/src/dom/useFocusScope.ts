import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { focusElement, getTabbableElements } from 'utils/keyboard'
import { useLatestCallback } from '../memo'
import { useLatestRef } from '../ref'

/**
 * 浮层焦点范围：激活时把焦点移入容器，可选在范围内循环 Tab，失活时把焦点归还给激活前的元素
 *
 * Modal / Drawer / ContextMenu 等浮层共用同一套进入、循环、归还语义
 * 返回的 `onKeyDown` 需挂在焦点范围的根节点上（React 合成事件），
 * 不监听 window / document，因此不会拦截浮层外的键盘事件
 *
 * @example
 * ```tsx
 * const { onKeyDown } = useFocusScope({ active: open, containerRef: panelRef, trap: true })
 * return <div ref={ panelRef } role="dialog" aria-modal="true" tabIndex={ -1 } onKeyDown={ onKeyDown } />
 * ```
 */
export function useFocusScope(options: UseFocusScopeOptions) {
  const {
    active,
    containerRef,
    trapRef,
    trap = false,
    initialFocus = 'first',
    restoreFocus = true,
    maxFocusAttempts = 45
  } = options

  const previousFocusedRef = useRef<HTMLElement | null>(null)
  const initialFocusRef = useLatestRef(initialFocus)
  const restoreFocusRef = useLatestRef(restoreFocus)

  useEffect(() => {
    if (!active || typeof document === 'undefined') return

    previousFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    /**
     * 下一帧再聚焦，等待 Portal 挂载；进入动画期间容器可能仍是 `visibility: hidden`，
     * 此时 focus() 会被浏览器静默忽略，所以未生效时逐帧重试，直到成功或超过上限
     */
    let raf = 0
    let attempts = 0
    const tryFocus = () => {
      const container = containerRef.current
      if (!container) return

      const target = resolveInitialFocus(container, initialFocusRef.current)
      if (!target) return

      focusElement(target)
      attempts += 1

      /** 只在焦点仍停在激活前位置时重试，用户或内部逻辑已移走焦点就不再抢回 */
      const current = document.activeElement
      const untouched = current === previousFocusedRef.current || current === document.body || current === null
      if (current !== target && untouched && attempts < maxFocusAttempts) {
        raf = requestAnimationFrame(tryFocus)
      }
    }
    raf = requestAnimationFrame(tryFocus)

    return () => {
      cancelAnimationFrame(raf)

      const previous = previousFocusedRef.current
      previousFocusedRef.current = null
      if (!restoreFocusRef.current) return
      if (previous && document.contains(previous)) focusElement(previous)
    }
  }, [active, containerRef, initialFocusRef, restoreFocusRef])

  const onKeyDown = useLatestCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (!trap || !active || event.key !== 'Tab' || event.defaultPrevented) return

    const scope = trapRef?.current ?? containerRef.current
    if (!scope) return

    event.preventDefault()
    focusElement(getNextTabbable(scope, event.shiftKey))
  })

  return { onKeyDown }
}

/** 计算 Tab 循环的下一个焦点；范围内没有可 Tab 元素时停在范围根节点 */
function getNextTabbable(scope: HTMLElement, backward: boolean): HTMLElement {
  const focusable = getTabbableElements(scope)
  if (focusable.length === 0) return scope

  const activeElement = document.activeElement as HTMLElement | null
  const currentIndex = activeElement
    ? focusable.indexOf(activeElement)
    : -1

  if (backward) {
    return currentIndex <= 0
      ? focusable[focusable.length - 1]!
      : focusable[currentIndex - 1]!
  }

  return currentIndex < 0 || currentIndex === focusable.length - 1
    ? focusable[0]!
    : focusable[currentIndex + 1]!
}

function resolveInitialFocus(container: HTMLElement, initialFocus: FocusScopeInitialFocus): HTMLElement | null {
  if (initialFocus === 'none') return null
  if (initialFocus === 'container') return container
  if (typeof initialFocus === 'function') return initialFocus(container) ?? container

  return getTabbableElements(container)[0] ?? container
}

/**
 * 初始焦点策略
 * - `first`：容器内首个可 Tab 元素，没有时聚焦容器
 * - `container`：聚焦容器自身（容器需设置 `tabIndex={-1}`）
 * - `none`：不移动焦点
 * - 函数：自定义目标，返回空时聚焦容器
 */
export type FocusScopeInitialFocus =
  | 'first'
  | 'container'
  | 'none'
  | ((container: HTMLElement) => HTMLElement | null | undefined)

export type UseFocusScopeOptions = {
  /**
   * 初始聚焦的最大重试帧数
   * @default 45
   */
  maxFocusAttempts?: number
  /** 焦点范围是否激活；由 false 变 true 时移入焦点，由 true 变 false 或卸载时归还焦点 */
  active: boolean
  /** 浮层容器，用于计算初始焦点 */
  containerRef: RefObject<HTMLElement | null>
  /**
   * Tab 循环的范围；默认与 `containerRef` 相同
   *
   * 容器外还有同属浮层的可聚焦元素（如遮罩上的关闭按钮）时传入更外层的节点
   */
  trapRef?: RefObject<HTMLElement | null>
  /**
   * 是否把 Tab / Shift+Tab 限制在范围内循环；`aria-modal="true"` 的浮层应开启
   * @default false
   */
  trap?: boolean
  /**
   * 激活时的初始焦点
   * @default 'first'
   */
  initialFocus?: FocusScopeInitialFocus
  /**
   * 失活时是否把焦点归还给激活前的元素
   * @default true
   */
  restoreFocus?: boolean
}
