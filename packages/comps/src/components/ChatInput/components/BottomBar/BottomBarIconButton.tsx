import type { BottomBarIconButtonProps } from '../../types'
import { memo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../../..'
import { ICON_BTN_CLS } from './styles'

export const BottomBarIconButton = memo<BottomBarIconButtonProps>(({
  label,
  active,
  disabled,
  onClick,
  className,
  children,
}) => {
  const button = (
    <button
      type="button"
      disabled={ disabled }
      onClick={ onClick }
      className={ cn(
        ICON_BTN_CLS,
        active && 'text-text bg-background3 scale-105',
        disabled && 'opacity-50 pointer-events-none',
        className,
      ) }
    >
      { children }
    </button>
  )

  return label
    ? <Tooltip content={ label }>{ button }</Tooltip>
    : button
})

BottomBarIconButton.displayName = 'BottomBarIconButton'
