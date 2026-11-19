'use client'

import { cn } from 'utils'
import type { SeparatorProps } from './types'

export const Separator = ({
  ref,
  decorative,
  orientation = 'vertical',
  className = '',
  containerClassName = '',
  ...divProps
}: SeparatorProps) => {
  const ariaOrientation = orientation === 'vertical'
    ? orientation
    : undefined
  const semanticProps = decorative
    ? { role: 'none' }
    : { 'aria-orientation': ariaOrientation, role: 'separator' }

  const content = (
    <div
      className={ cn(
        'shrink-0 bg-border',
        orientation === 'horizontal'
          ? 'h-px w-full my-1'
          : 'h-6 w-px',
        className,
      ) }
      { ...semanticProps }
      { ...divProps }
      ref={ ref }
    />
  )

  if (!containerClassName) {
    return content
  }

  return (
    <div className={ containerClassName }>
      { content }
    </div>
  )
}

Separator.displayName = 'Separator'
