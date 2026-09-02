import { Paperclip } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import type { BottomBarActionProps } from '../../types'
import { BottomBarActionIcon } from './BottomBarActionIcon'
import { useBottomBarState } from './BottomBarContext'
import { ICON_BTN_CLS } from './styles'

export const UploaderButton = memo<BottomBarActionProps>(({ className, icon }) => {
  const { t, disabled, onUploaderClick } = useBottomBarState()

  return (
    <Tooltip content={ t('chatInput.buttons.uploadFile') }>
      <button
        type="button"
        aria-label={ t('chatInput.buttons.uploadFile') }
        disabled={ disabled }
        onClick={ onUploaderClick }
        className={ cn(ICON_BTN_CLS, disabled && 'pointer-events-none opacity-50', className) }
      >
        <BottomBarActionIcon icon={ icon ?? <Paperclip /> } />
      </button>
    </Tooltip>
  )
})

UploaderButton.displayName = 'BottomBar.UploaderButton'
