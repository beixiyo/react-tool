import type { ChatInputShortcutAction, ChatInputShortcutList, ChatInputShortcuts, ResolvedChatInputShortcuts } from '../../types'

export const DEFAULT_CHAT_INPUT_SHORTCUTS: ResolvedChatInputShortcuts = {
  send: ['Enter'],
  wrap: ['Shift+Enter'],
  openPrompt: ['Mod+/'],
  openHistory: ['Mod+H'],
}

export function resolveChatInputShortcuts(shortcuts?: ChatInputShortcuts): ResolvedChatInputShortcuts {
  const resolved: ResolvedChatInputShortcuts = {
    send: normalizeShortcutList(shortcuts?.send, DEFAULT_CHAT_INPUT_SHORTCUTS.send),
    wrap: normalizeShortcutList(shortcuts?.wrap, DEFAULT_CHAT_INPUT_SHORTCUTS.wrap),
    openPrompt: normalizeShortcutList(shortcuts?.openPrompt, DEFAULT_CHAT_INPUT_SHORTCUTS.openPrompt),
    openHistory: normalizeShortcutList(shortcuts?.openHistory, DEFAULT_CHAT_INPUT_SHORTCUTS.openHistory),
  }

  warnShortcutConflicts(resolved)

  return resolved
}

export function getFirstChatInputShortcut(shortcuts: readonly string[]): string {
  return shortcuts[0] ?? ''
}

/**
 * 归一化单个动作的按键列表
 *
 * 三档语义要分开：`undefined` 取默认值，空数组是**显式解绑**（该动作不绑任何键），
 * 其余去重后原样使用。空数组回退到默认值会让「表单输入框不要 Enter 发送」
 * 这类需求无法表达，只能去占一个用不上的组合键
 */
function normalizeShortcutList(
  shortcuts: ChatInputShortcutList | undefined,
  fallback: ResolvedChatInputShortcuts[ChatInputShortcutAction],
): ResolvedChatInputShortcuts[ChatInputShortcutAction] {
  if (!shortcuts) return [...fallback]

  const list = Array.isArray(shortcuts)
    ? shortcuts
    : [shortcuts]

  return Array.from(new Set(list.filter(Boolean)))
}

function warnShortcutConflicts(shortcuts: ResolvedChatInputShortcuts) {
  if (typeof console === 'undefined') return

  const shortcutToActions = new Map<string, ChatInputShortcutAction[]>()
  for (const action of Object.keys(shortcuts) as ChatInputShortcutAction[]) {
    for (const shortcut of shortcuts[action]) {
      shortcutToActions.set(shortcut, [...shortcutToActions.get(shortcut) ?? [], action])
    }
  }

  const conflicts = [...shortcutToActions.entries()]
    .filter(([, actions]) => actions.length > 1)
    .map(([shortcut, actions]) => `${shortcut}: ${actions.join(', ')}`)

  if (conflicts.length > 0) {
    console.warn(`[ChatInput] shortcut conflicts detected: ${conflicts.join('; ')}`)
  }
}
