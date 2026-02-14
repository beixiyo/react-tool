import { useEffect } from 'react'
import { useLatestRef } from '../ref'

const EDITABLE_SELECTOR = 'input, textarea, [contenteditable="true"]'

function isFocusInEditable(): boolean {
  const el = document.activeElement
  return !!el && el instanceof HTMLElement && !!el.closest(EDITABLE_SELECTOR)
}

/**
 * 键盘快捷键钩子函数
 * @param opts 快捷键配置选项
 * @example
 * ```tsx
 * // 全局保存，在输入框内不触发
 * useShortCutKey({ key: 's', ctrl: true, fn: onSave })
 *
 * // 弹窗内 Escape 关闭，即使焦点在输入框也响应
 * useShortCutKey({ key: 'Escape', fn: onClose, ignoreWhenEditable: false })
 *
 * // 条件启用
 * useShortCutKey({ key: 'Enter', fn: onSubmit, enabled: isFormValid })
 *
 * // 不阻止默认（例如保留浏览器保存对话框）
 * useShortCutKey({ key: 's', ctrl: true, fn: onSave, preventDefault: false })
 * ```
 */
export function useShortCutKey(opts: ShortCutKeyOpts) {
  const {
    fn,
    key,
    el = typeof window !== 'undefined'
      ? window
      : undefined as unknown as ShortCutTarget,
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    capture = false,
    enabled = true,
    ignoreWhenEditable = false,
    preventDefault: shouldPreventDefault = true,
    onKeyDown,
  } = opts

  const watchFn = useLatestRef(fn)

  useEffect(() => {
    if (!enabled || !el)
      return

    const handleKeyDown = (e: KeyboardEvent) => {
      onKeyDown?.(e)

      const keyMatches = e.key?.toLowerCase() === key.toLowerCase()
      const ctrlMatches = e.ctrlKey === ctrl
      const shiftMatches = e.shiftKey === shift
      const altMatches = e.altKey === alt
      const metaMatches = e.metaKey === meta
      const comboMatches = keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches

      if (comboMatches && watchFn.current) {
        if (shouldPreventDefault)
          e.preventDefault()
        if (ignoreWhenEditable && isFocusInEditable())
          return
        watchFn.current(e)
      }
    }

    el.addEventListener('keydown', handleKeyDown as EventListener, capture)

    return () => {
      el.removeEventListener('keydown', handleKeyDown as EventListener, capture)
    }
  }, [alt, capture, ctrl, el, enabled, ignoreWhenEditable, key, meta, shift, shouldPreventDefault, watchFn])
}

export type ShortCutTarget = HTMLElement | Window | Document

export type ShortCutKeyOpts = KeyModifier & {
  /**
   * 键名，大小写不敏感
   */
  key: KeyEnum
  /**
   * 快捷键触发时的回调函数
   */
  fn: (e: KeyboardEvent) => void
  /**
   * 监听目标，默认 window（全局快捷键）
   */
  el?: ShortCutTarget | null
  /**
   * 是否在捕获阶段监听
   * @default false
   */
  capture?: boolean
  /**
   * 是否启用该快捷键
   * @default true
   */
  enabled?: boolean
  /**
   * 焦点在输入框/可编辑区域时是否不触发（避免与输入冲突）
   * @default false
   */
  ignoreWhenEditable?: boolean
  /**
   * 匹配时是否阻止默认行为（如阻止 Ctrl+S 的浏览器保存）
   * @default true
   */
  preventDefault?: boolean

  onKeyDown?: (e: KeyboardEvent) => void
}

export type KeyEnum = ('Ctrl' | 'Shift' | 'Alt' | 'Meta' | 'Enter' | 'Escape' | 'Tab' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Backspace' | 'Delete' | 'Insert' | 'Home' | 'End' | 'PageUp' | 'PageDown' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' | 'CapsLock' | 'NumLock' | 'ScrollLock' | 'PrintScreen' | 'Pause' | 'Break' | 'Clear' | 'ContextMenu' | 'Scroll' | 'Unidentified') | (string & {})

export type KeyModifier = {
  /**
   * 是否需要按下 Ctrl 键
   * @default false
   */
  ctrl?: boolean
  /**
   * 是否需要按下 Shift 键
   * @default false
   */
  shift?: boolean
  /**
   * 是否需要按下 Alt 键
   * @default false
   */
  alt?: boolean
  /**
   * 是否需要按下 Meta 键（Windows 键或 Mac 的 Command 键）
   * @default false
   */
  meta?: boolean
}
