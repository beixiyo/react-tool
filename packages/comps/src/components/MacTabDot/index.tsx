import { memo } from 'react'
import { cn } from 'utils'

/**
 * Mac 顶部红绿灯
 */
export const MacTabDot = memo<MacTabDotProps>((
  {
    style,
    className,
    dotClassName,
  },
) => {
  return <div
    className={ cn(
      'MacTabDotContainer flex items-center gap-2',
      className,
    ) }
    style={ style }
  >
    <div className={ cn(
      'h-3 w-3 rounded-full bg-red-400',
      dotClassName,
    ) } />
    <div className={ cn(
      'h-3 w-3 rounded-full bg-yellow-400',
      dotClassName,
    ) } />
    <div className={ cn(
      'h-3 w-3 rounded-full bg-green-400',
      dotClassName,
    ) } />
  </div>
})

MacTabDot.displayName = 'MacTabDot'

export type MacTabDotProps = {
  dotClassName?: string
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
