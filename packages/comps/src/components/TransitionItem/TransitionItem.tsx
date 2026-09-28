import { forwardRef, memo } from 'react'
import { cn } from 'utils'
import type { TransitionItemProps } from './types'

export const TransitionItem = memo(forwardRef<HTMLElement, TransitionItemProps>((
  {
    style,
    className,
    tag = 'div',
    transitionName,
    children,
    ...rest
  },
  ref,
) => {
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
}))

TransitionItem.displayName = 'TransitionItem'
