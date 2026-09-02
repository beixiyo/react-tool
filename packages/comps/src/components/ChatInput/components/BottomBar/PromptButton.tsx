import { Sparkles } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import { formatChatInputShortcut } from '../../shortcuts'
import type { BottomBarActionProps } from '../../types'
import { BottomBarActionIcon } from './BottomBarActionIcon'
import { useBottomBarState } from './BottomBarContext'
import { ICON_BTN_CLS } from './styles'

export const PromptButton = memo<BottomBarActionProps>(({ className, icon }) => {
  const { t, disabled, shortcuts, showPromptPanel, onShowPromptPanelToggle } = useBottomBarState()

  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2">
          <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatChatInputShortcut(shortcuts.openPrompt) }</div>
          { t('chatInput.buttons.promptTemplates') }
        </div>
       }
    >
      <button
        type="button"
        aria-label={ t('chatInput.buttons.promptTemplates') }
        aria-pressed={ showPromptPanel }
        disabled={ disabled }
        onClick={ onShowPromptPanelToggle }
        className={ cn(ICON_BTN_CLS, showPromptPanel && 'bg-background3 text-text', disabled && 'pointer-events-none opacity-50', className) }
      >
        <BottomBarActionIcon icon={ icon ?? <Sparkles /> } />
      </button>
    </Tooltip>
  )
})

PromptButton.displayName = 'BottomBar.PromptButton'
