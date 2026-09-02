/** ChatInput 面板底部的统一快捷键说明。 */

import type { LucideIcon } from 'lucide-react'
import { memo } from 'react'

export const PanelShortcut = memo<PanelShortcutProps>(({ icon: Icon, label, keys }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
    <Icon className="size-3.5" />
    <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[11px] text-text">{ keys }</kbd>
    <span>{ label }</span>
  </span>
))

PanelShortcut.displayName = 'PanelShortcut'

type PanelShortcutProps = {
  icon: LucideIcon
  label: string
  keys: string
}
