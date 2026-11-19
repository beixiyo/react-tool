import { memo } from 'react'
import { cn } from 'utils'
import type { TransitionItemProps } from './types'

export const TransitionItem = memo(({
  ref,
  style,
  className,
  tag = 'div',
  transitionName,
  children,
  ...rest
}: TransitionItemProps) => {
  const Tag = tag

  return (
    <Tag
      ref={ ref }
      className={ cn(
        'TransitionItem',
        className,
      ) }
      style={ {
        viewTransitionName: `view-${transitionName}`,
        ...style,
      } }
      { ...rest }
    >
      { children }
    </Tag>
  )
})

TransitionItem.displayName = 'TransitionItem'
