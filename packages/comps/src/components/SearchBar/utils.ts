import { isApplePlatform, matchesKey, matchesModifiers } from 'utils/keyboard'
import type { SearchBarProps, SearchBarShortcut } from './types'

/**
 * 把快捷键配置格式化为展示文本
 *
 * Apple 平台用符号紧凑拼接（`⌘K`），其它平台用 `+` 连接（`Ctrl+K`）
 */
export function formatShortcut(shortcut: SearchBarShortcut): string {
  const apple = isApplePlatform()
  const parts: string[] = []

  if (shortcut.mod) parts.push(apple
    ? '⌘'
    : 'Ctrl')
  /** 非 Apple 平台 mod 已是 Ctrl，避免重复 */
  if (shortcut.ctrl && !(shortcut.mod && !apple)) parts.push(apple
    ? '⌃'
    : 'Ctrl')
  if (shortcut.alt) parts.push(apple
    ? '⌥'
    : 'Alt')
  if (shortcut.shift) parts.push(apple
    ? '⇧'
    : 'Shift')
  if (shortcut.meta && !shortcut.mod) parts.push(apple
    ? '⌘'
    : 'Meta')

  const key = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key
  parts.push(key)

  return parts.join(apple
    ? ''
    : '+')
}

/** 把 `shortcut` prop 归一为组合列表；关闭时返回空数组 */
export function normalizeShortcuts(shortcut: SearchBarProps['shortcut']): readonly SearchBarShortcut[] {
  if (!shortcut) return []
  return Array.isArray(shortcut)
    ? shortcut
    : [shortcut as SearchBarShortcut]
}

/** 事件是否命中某个快捷键组合 */
export function matchesShortcut(event: KeyboardEvent, shortcut: SearchBarShortcut): boolean {
  const { key, ...modifiers } = shortcut
  return matchesKey(event, { key }) && matchesModifiers(event, modifiers)
}
