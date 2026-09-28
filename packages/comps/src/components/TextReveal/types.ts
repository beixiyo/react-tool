/**
 * TextReveal 类型声明
 */

import type * as React from 'react'

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
