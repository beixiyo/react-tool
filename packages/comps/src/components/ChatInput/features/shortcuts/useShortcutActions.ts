import type { UseShortcutActionsOptions } from '../../types'
import { useShortCutKey } from 'hooks'

export function useShortcutActions(options: UseShortcutActionsOptions) {
  const {
    shortcuts,
    promptEnabled,
    historyEnabled,
    openPrompt,
    openHistory,
  } = options

  const promptShortcut = getGlobalShortcutConfig(shortcuts.openPrompt[0])
  const historyShortcut = getGlobalShortcutConfig(shortcuts.openHistory[0])

  useShortCutKey({
    ...promptShortcut,
    enabled: promptEnabled && promptShortcut.valid,
    ignoreWhenEditable: false,
    onKeyDown: openPrompt,
  })

  useShortCutKey({
    ...historyShortcut,
    enabled: historyEnabled && historyShortcut.valid,
    ignoreWhenEditable: false,
    onKeyDown: openHistory,
  })
}

function getGlobalShortcutConfig(shortcut: string | undefined) {
  if (!shortcut)
    return DISABLED_SHORTCUT

  const [modifier, key] = shortcut.includes('+')
    ? shortcut.split('+')
    : ['', shortcut]

  if (!key)
    return DISABLED_SHORTCUT

  if (modifier === 'Mod')
    return { ...DISABLED_SHORTCUT, key, mod: true, valid: true }

  return {
    ...DISABLED_SHORTCUT,
    key,
    ctrl: modifier === 'Ctrl',
    meta: modifier === 'Meta',
    shift: modifier === 'Shift',
    alt: modifier === 'Alt',
    valid: true,
  }
}

const DISABLED_SHORTCUT = {
  key: '',
  mod: false,
  ctrl: false,
  meta: false,
  shift: false,
  alt: false,
  valid: false,
}
