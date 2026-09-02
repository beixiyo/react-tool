import { ArrowUp, HelpCircle, History, Sparkles } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import { formatChatInputShortcut } from '../../shortcuts'
import type { BottomBarActionProps } from '../../types'
import { BottomBarActionIcon } from './BottomBarActionIcon'
import { useBottomBarState } from './BottomBarContext'
import { ICON_BTN_CLS } from './styles'

export const HelperButton = memo<BottomBarActionProps>(({ className, icon }) => {
  const { t, disabled, enablePromptTemplates, enableHistory, shortcuts } = useBottomBarState()

  const sendShortcut = formatChatInputShortcut(shortcuts.send)

  return (
    <Tooltip
      content={
        <div className="flex items-center gap-4">
          { enablePromptTemplates && (
            <span className="flex items-center gap-1">
              <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatChatInputShortcut(shortcuts.openPrompt) }</div>
              <Sparkles size={ 12 } />
              { t('chatInput.shortcuts.templates') }
            </span>
          ) }
          { enableHistory && (
            <span className="flex items-center gap-1">
              <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatChatInputShortcut(shortcuts.openHistory) }</div>
              <History size={ 12 } />
              { t('chatInput.shortcuts.history') }
            </span>
          ) }
          <span className="flex items-center gap-1">
            <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ sendShortcut }</div>
            <ArrowUp size={ 12 } />
            { t('chatInput.shortcuts.send') }
          </span>
        </div>
       }
    >
      <button
        type="button"
        aria-label={ t('chatInput.buttons.shortcutHelp') }
        disabled={ disabled }
        className={ cn(ICON_BTN_CLS, 'cursor-help', disabled && 'pointer-events-none opacity-50', className) }
      >
        <BottomBarActionIcon icon={ icon ?? <HelpCircle /> } />
      </button>
    </Tooltip>
  )
})

HelperButton.displayName = 'BottomBar.HelperButton'
