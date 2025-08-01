import type { CSSProperties } from 'react'
import { cn } from '@/utils'
import { memo } from 'react'

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
    <div className="h-[1px] flex-1 bg-[#9984]"></div>
    <span className="mx-2 font-bold">{ children || 'No Data' }</span>
    <div className="h-[1px] flex-1 bg-[#9984]"></div>
  </div>
})

SplitText.displayName = 'SplitText'

export interface SplitTextProps {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}
