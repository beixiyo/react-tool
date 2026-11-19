import type { KeyboardEvent, RefObject } from 'react'
import { useEffect, useRef } from 'react'

/** 面板内可接收初始焦点的元素：日历 / 月份 / 年份网格中 roving tabindex 为 0 的项 */
const INITIAL_FOCUS_SELECTOR = '[role="grid"] [tabindex="0"]'
const TRIGGER_FOCUSABLE_SELECTOR = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
const OPEN_KEYS = new Set(['Enter', ' '])

/**
 * Picker 面板的焦点交接
 *
 * - 通过键盘（Enter / Space）打开时，面板就绪后把焦点移入网格的当前日期；鼠标打开不抢焦点
 * - 关闭时若焦点仍在面板内（或随面板卸载丢失），归还给打开前聚焦的 trigger 元素；外部点击关闭不归还
 * - 只在 trigger 与面板自身元素上监听，不绑定 window / document
 */
export function usePickerFocusHandoff({
  isOpen,
  ready,
  triggerRef,
  dropdownRef,
}: UsePickerFocusHandoffOptions) {
  const openedByKeyboardRef = useRef(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const focusInsideRef = useRef(false)

  /** 面板就绪后移入初始焦点 */
  useEffect(() => {
    if (!isOpen || !ready || !openedByKeyboardRef.current) return
    openedByKeyboardRef.current = false

    const frame = requestAnimationFrame(() => {
      dropdownRef.current?.querySelector<HTMLElement>(INITIAL_FOCUS_SELECTOR)?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [dropdownRef, isOpen, ready])

  /** 跟踪焦点是否位于面板内，焦点移到面板外的其他元素时不再归还 */
  useEffect(() => {
    const dropdown = dropdownRef.current
    if (!isOpen || !ready || !dropdown) return

    const handleFocusIn = () => {
      focusInsideRef.current = true
    }
    const handleFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget
      /** relatedTarget 为空表示焦点随节点卸载丢失，仍视为在面板内 */
      if (next instanceof Node && !dropdown.contains(next)) focusInsideRef.current = false
    }

    dropdown.addEventListener('focusin', handleFocusIn)
    dropdown.addEventListener('focusout', handleFocusOut)
    return () => {
      dropdown.removeEventListener('focusin', handleFocusIn)
      dropdown.removeEventListener('focusout', handleFocusOut)
    }
  }, [dropdownRef, isOpen, ready])

  /** 关闭时归还焦点 */
  useEffect(() => {
    if (isOpen || !focusInsideRef.current) return
    focusInsideRef.current = false

    const active = document.activeElement
    const lost = !active || active === document.body || !!dropdownRef.current?.contains(active)
    if (!lost) return

    const target = returnFocusRef.current?.isConnected
      ? returnFocusRef.current
      : triggerRef.current?.querySelector<HTMLElement>(TRIGGER_FOCUSABLE_SELECTOR)
    target?.focus()
  }, [dropdownRef, isOpen, triggerRef])

  /** 挂到 trigger 包裹元素的捕获阶段，记录打开方式与归还目标 */
  const triggerHandlers = {
    onKeyDownCapture: (event: KeyboardEvent<HTMLElement>) => {
      if (!OPEN_KEYS.has(event.key)) return
      openedByKeyboardRef.current = true
      returnFocusRef.current = event.target as HTMLElement
    },
    onPointerDownCapture: () => {
      openedByKeyboardRef.current = false
      returnFocusRef.current = null
    },
  }

  /** 外部点击关闭时由用户决定焦点去向，不再归还 */
  const cancelReturnFocus = () => {
    focusInsideRef.current = false
  }

  return { triggerHandlers, cancelReturnFocus }
}

export interface UsePickerFocusHandoffOptions {
  /** 面板是否打开 */
  isOpen: boolean
  /** 面板是否已定位完成并可见 */
  ready: boolean
  triggerRef: RefObject<HTMLElement | null>
  dropdownRef: RefObject<HTMLElement | null>
}
