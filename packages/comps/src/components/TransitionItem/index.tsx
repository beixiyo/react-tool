import { memo } from 'react'
import { cn } from 'utils'

export const TransitionItem = memo<TransitionItemProps>((
  {
    style,
    className,
    tag = 'div',
    transitionName,
    children,
  },
) => {
  const Tag = tag

  return <Tag
    className={ cn(
      'TransitionItem',
      className,
    ) }
    style={ {
      viewTransitionName: `view-${transitionName}`,
      ...style,
    } }
  >
    { children }
  </Tag>
})

TransitionItem.displayName = 'TransitionItem'

export type TransitionItemProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  tag?: React.ElementType
  transitionName: string | number
}
