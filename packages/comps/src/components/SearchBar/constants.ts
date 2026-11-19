import type { SearchBarShortcut } from './types'

/**
 * 默认聚焦快捷键：任意平台上 ⌘K 与 Ctrl+K 均可触发
 *
 * 首项为展示用的平台主组合（Mac 显示 ⌘K，其它平台显示 Ctrl+K），
 * 后两项保证 Mac 上的 Ctrl+K、其它平台的 Meta+K 也能触发，与早期 `metaKey || ctrlKey` 行为一致
 */
export const DEFAULT_SEARCH_BAR_SHORTCUT: readonly SearchBarShortcut[] = [
  { key: 'k', mod: true },
  { key: 'k', ctrl: true },
  { key: 'k', meta: true },
]
