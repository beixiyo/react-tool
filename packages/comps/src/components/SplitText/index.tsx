import type { CSSProperties } from 'react'
import { memo } from 'react'
import { cn } from 'utils'

/**
 * 文字被线分割
 */
export const SplitText = memo<SplitTextProps>((
  {
    style,
    className,
    children,
  },
) => {
  return <div
    className={ cn(
      'flex items-center justify-center w-full',
      className,
    ) }
    style={ style }
  >
    <div className="h-px flex-1 bg-border"></div>
    <span className="mx-2 font-bold">{ children || 'No Data' }</span>
    <div className="h-px flex-1 bg-border"></div>
  </div>
})

SplitText.displayName = 'SplitText'

export interface SplitTextProps {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}
