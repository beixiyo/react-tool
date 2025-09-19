import { memo } from 'react'
import { cn } from 'utils'

/**
 * 分割线
 */
export const SplitLine = memo((
  {
    style,
    className,
    height = 8,
    innerClassName,
  }: SplitLineProps,
) => {
  return <div
    className={ cn(
      'flex items-center justify-center w-full',
      className,
    ) }
    style={ {
      height,
      ...style,
    } }
  >
    <div className={ cn(
      'h-px w-full bg-gray-600 opacity-10',
      innerClassName,
    ) }></div>
  </div>
})

SplitLine.displayName = 'SplitLine'

export type SplitLineProps = {
  className?: string
  innerClassName?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  height?: number
}
