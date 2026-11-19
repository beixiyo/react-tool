import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import type { BottomBarIconButtonProps } from '../../types'
import { BottomBarActionIcon } from './BottomBarActionIcon'
import { ICON_BTN_CLS } from './styles'

export const BottomBarIconButton = memo<BottomBarIconButtonProps>(({ label, active, disabled, onClick, className, icon }) => {
  const button = (
    <button
      type="button"
      aria-label={ label }
      disabled={ disabled }
      onClick={ onClick }
      className={ cn(ICON_BTN_CLS, active && 'bg-background3 text-text', disabled && 'pointer-events-none opacity-50', className) }
    >
      <BottomBarActionIcon icon={ icon } />
    </button>
  )

  return label
    ? <Tooltip content={ label }>{ button }</Tooltip>
    : button
})

BottomBarIconButton.displayName = 'BottomBarIconButton'
