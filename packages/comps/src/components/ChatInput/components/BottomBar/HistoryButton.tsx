import type { BottomBarPartProps } from '../../types'
import { History } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import { formatChatInputShortcut } from '../../shortcuts'
import { useBottomBarState } from './BottomBarContext'
import { ICON_BTN_CLS } from './styles'

export const HistoryButton = memo<BottomBarPartProps>(({ className }) => {
  const {
    t,
    shortcuts,
    showHistoryPanel,
    onShowHistoryPanelToggle,
  } = useBottomBarState()

  return (
    <Tooltip content={
      <div className="flex items-center gap-2">
        <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">
          { formatChatInputShortcut(shortcuts.openHistory) }
        </div>
        { t('chatInput.buttons.inputHistory') }
      </div>
    }>
      <button
        type="button"
        onClick={ onShowHistoryPanelToggle }
        className={ cn(ICON_BTN_CLS, showHistoryPanel && 'text-success bg-successBg/30 scale-105', className) }
      >
        <History size={ 18 } />
      </button>
    </Tooltip>
  )
})

HistoryButton.displayName = 'BottomBar.HistoryButton'
