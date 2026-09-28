'use client'

import cn from 'clsx'
import type { BrProps } from './types'

export function Br({ mobile, desktop, className, ...props }: BrProps) {
  return (
    <br
      { ...props }
      className={ cn(
        mobile && 'md:hidden',
        desktop && 'hidden md:inline',
        className,
      ) }
    />
  )
}
