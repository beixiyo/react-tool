'use client'

import React, { memo, useEffect, useState } from 'react'
import { cn } from 'utils'

/**
 * 文字渐渐弹出效果
 */
export const TextReveal = memo(({
  text,
  className,
  charClassName,
  charStyle,
  delay = 40,
  initialDelay = 0,
  transitionDuration = '0.5s',
  easing = 'cubic-bezier(0.35, -0.14, 0.48, 1.6)',
  onComplete,
}: TextRevealProps) => {
  const [visibleChars, setVisibleChars] = useState<number>(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let currentChar = 0
      const interval = setInterval(() => {
        if (currentChar < text.length) {
          setVisibleChars(prev => prev + 1)
          currentChar++
        }
        else {
          clearInterval(interval)
          onComplete?.()
        }
      }, delay)

      return () => clearInterval(interval)
    }, initialDelay)

    return () => clearTimeout(timer)
  }, [text, delay, initialDelay, onComplete])

  return (
    <div className={ cn('inline-flex', className) }>
      { text.split('').map((char, index) => (
        <span
          key={ index }
          className={ cn(
            'transform transition-transform',
            charClassName,
            visibleChars > index
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0',
          ) }
          style={ {
            ...charStyle,
            transitionDuration,
            transitionTimingFunction: easing,
            transitionProperty: 'all',
            whiteSpace: 'pre',
          } }
        >
          { char }
        </span>
      )) }
    </div>
  )
})

export type TextRevealProps = {
  /**
   * The text to animate
   */
  text: string

  /**
   * Additional className for the container
   */
  className?: string

  /**
   * Additional className for each character
   */
  charClassName?: string

  /**
   * styles for each character
   */
  charStyle?: React.CSSProperties

  /**
   * Delay between each character animation in milliseconds
   * @default 50
   */
  delay?: number

  /**
   * Initial delay before starting the animation in milliseconds
   * @default 0
   */
  initialDelay?: number

  transitionDuration?: string

  /**
   * CSS easing function for the animation
   * @default cubic-bezier(0.4, 0, 0.2, 1)
   */
  easing?: string

  /**
   * Callback function called when animation completes
   */
  onComplete?: () => void
}
