import { forwardRef, memo } from 'react'
import { cn } from 'utils'

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

  return <Tag
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
}))

TransitionItem.displayName = 'TransitionItem'

export type TransitionItemProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  /**
   * 渲染的标签 / 组件
   * @default 'div'
   */
  tag?: React.ElementType
  /** view transition 名称，会拼接为 `view-${transitionName}` */
  transitionName: string | number
} & Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'className' | 'children'>
