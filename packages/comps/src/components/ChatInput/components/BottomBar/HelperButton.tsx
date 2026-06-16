import type { BottomBarPartProps } from '../../types'
import { ArrowUp, HelpCircle, History, Sparkles } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import { formatChatInputShortcut } from '../../shortcuts'
import { useBottomBarState } from './BottomBarContext'

export const HelperButton = memo<BottomBarPartProps>(({ className }) => {
  const {
    t,
    enablePromptTemplates,
    enableHistory,
    shortcuts,
  } = useBottomBarState()

  const sendShortcut = formatChatInputShortcut(shortcuts.send)

  return (
    <Tooltip
      content={
        <div className="flex items-center gap-4">
          { enablePromptTemplates && (
            <span className="flex items-center gap-1">
              <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">
                { formatChatInputShortcut(shortcuts.openPrompt) }
              </div>
              <Sparkles size={ 12 } />
              { t('chatInput.shortcuts.templates') }
            </span>
          ) }
          { enableHistory && (
            <span className="flex items-center gap-1">
              <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">
                { formatChatInputShortcut(shortcuts.openHistory) }
              </div>
              <History size={ 12 } />
              { t('chatInput.shortcuts.history') }
            </span>
          ) }
          <span className="flex items-center gap-1">
            <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">
              { sendShortcut }
            </div>
            <ArrowUp size={ 12 } />
            { t('chatInput.shortcuts.send') }
          </span>
        </div>
      }
    >
      <button
        type="button"
        style={ { translate: '0px 3px' } }
        className={ cn('rounded-xl transition-all duration-200 cursor-help text-text2 hover:text-text hover:scale-105', className) }
      >
        <HelpCircle size={ 22 } strokeWidth={ 1.5 } />
      </button>
    </Tooltip>
  )
})

HelperButton.displayName = 'BottomBar.HelperButton'
