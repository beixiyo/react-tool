import type { BottomBarPartProps } from '../../types'
import { Sparkles } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import { formatChatInputShortcut } from '../../shortcuts'
import { useBottomBarState } from './BottomBarContext'
import { ICON_BTN_CLS } from './styles'

export const PromptButton = memo<BottomBarPartProps>(({ className }) => {
  const {
    t,
    shortcuts,
    showPromptPanel,
    onShowPromptPanelToggle,
  } = useBottomBarState()

  return (
    <Tooltip content={
      <div className="flex items-center gap-2">
        <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">
          { formatChatInputShortcut(shortcuts.openPrompt) }
        </div>
        { t('chatInput.buttons.promptTemplates') }
      </div>
    }>
      <button
        type="button"
        onClick={ onShowPromptPanelToggle }
        className={ cn(ICON_BTN_CLS, showPromptPanel && 'text-info bg-infoBg/30 scale-105', className) }
      >
        <Sparkles size={ 18 } />
      </button>
    </Tooltip>
  )
})

PromptButton.displayName = 'BottomBar.PromptButton'
