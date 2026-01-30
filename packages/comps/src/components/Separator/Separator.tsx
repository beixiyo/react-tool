'use client'

import { forwardRef } from 'react'
import { cn } from 'utils'

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(({
  decorative,
  orientation = 'vertical',
  className = '',
  containerClassName = '',
  ...divProps
}, ref) => {
  const ariaOrientation = orientation === 'vertical'
    ? orientation
    : undefined
  const semanticProps = decorative
    ? { role: 'none' }
    : { 'aria-orientation': ariaOrientation, 'role': 'separator' }

  const content = <div
    className={ cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full my-1' : 'h-6 w-[1px]',
      className,
    ) }
    { ...semanticProps }
    { ...divProps }
    ref={ ref }
  />

  if (!containerClassName) {
    return content
  }

  return (
    <div className={ containerClassName }>
      { content }
    </div>
  )
})

Separator.displayName = 'Separator'

export type Orientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  decorative?: boolean
  containerClassName?: string
}
