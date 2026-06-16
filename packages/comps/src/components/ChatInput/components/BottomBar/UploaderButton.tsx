import type { BottomBarUploaderButtonProps } from '../../types'
import { Paperclip } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import { useBottomBarState } from './BottomBarContext'
import { ICON_BTN_CLS } from './styles'

export const UploaderButton = memo<BottomBarUploaderButtonProps>(({ className, icon }) => {
  const { t, onUploaderClick } = useBottomBarState()

  return (
    <Tooltip content={ t('chatInput.buttons.uploadFile') }>
      <button
        type="button"
        onClick={ onUploaderClick }
        className={ cn(ICON_BTN_CLS, className) }
      >
        { icon ?? <Paperclip size={ 18 } /> }
      </button>
    </Tooltip>
  )
})

UploaderButton.displayName = 'BottomBar.UploaderButton'
