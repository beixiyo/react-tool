import { ArrowUp } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Button } from '../../..'
import type { BottomBarActionProps } from '../../types'
import { BottomBarActionIcon } from './BottomBarActionIcon'
import { useBottomBarState } from './BottomBarContext'
import { BOTTOM_BAR_ACTION_BUTTON_CLS } from './styles'

export const SendButton = memo<BottomBarActionProps>(({ className, icon }) => {
  const { t, loading, disabled, actualValue, allowEmptySubmit, onSubmit } = useBottomBarState()

  const sendDisabled = disabled || (!actualValue.trim() && !allowEmptySubmit)

  return (
    <Button
      aria-label={ t('chatInput.shortcuts.send') }
      loading={ loading }
      disabled={ sendDisabled }
      variant="primary"
      size="sm"
      className={ cn(BOTTOM_BAR_ACTION_BUTTON_CLS, className) }
      rightIcon={ <BottomBarActionIcon icon={ icon ?? <ArrowUp /> } /> }
      rounded="full"
      onClick={ onSubmit }
    >
    </Button>
  )
})

SendButton.displayName = 'BottomBar.SendButton'
