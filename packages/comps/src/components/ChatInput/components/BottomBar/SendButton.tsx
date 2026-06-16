import type { BottomBarSendButtonProps } from '../../types'
import { ArrowUp } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Button } from '../../..'
import { useBottomBarState } from './BottomBarContext'

export const SendButton = memo<BottomBarSendButtonProps>(({ className, icon }) => {
  const {
    loading,
    disabled,
    actualValue,
    allowEmptySubmit,
    onSubmit,
  } = useBottomBarState()

  const sendDisabled = disabled || (!actualValue.trim() && !allowEmptySubmit)

  return (
    <Button
      loading={ loading }
      disabled={ sendDisabled }
      variant="primary"
      size="sm"
      className={ cn('shrink-0', className) }
      rightIcon={ icon ?? <ArrowUp size={ 17 } /> }
      rounded="full"
      onClick={ onSubmit }
    >
    </Button>
  )
})

SendButton.displayName = 'BottomBar.SendButton'
