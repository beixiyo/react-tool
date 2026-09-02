import { History } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import { formatChatInputShortcut } from '../../shortcuts'
import type { BottomBarActionProps } from '../../types'
import { BottomBarActionIcon } from './BottomBarActionIcon'
import { useBottomBarState } from './BottomBarContext'
import { ICON_BTN_CLS } from './styles'

export const HistoryButton = memo<BottomBarActionProps>(({ className, icon }) => {
  const { t, disabled, shortcuts, showHistoryPanel, onShowHistoryPanelToggle } = useBottomBarState()

  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2">
          <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatChatInputShortcut(shortcuts.openHistory) }</div>
          { t('chatInput.buttons.inputHistory') }
        </div>
       }
    >
      <button
        type="button"
        aria-label={ t('chatInput.buttons.inputHistory') }
        aria-pressed={ showHistoryPanel }
        disabled={ disabled }
        onClick={ onShowHistoryPanelToggle }
        className={ cn(ICON_BTN_CLS, showHistoryPanel && 'bg-background3 text-text', disabled && 'pointer-events-none opacity-50', className) }
      >
        <BottomBarActionIcon icon={ icon ?? <History /> } />
      </button>
    </Tooltip>
  )
})

HistoryButton.displayName = 'BottomBar.HistoryButton'
