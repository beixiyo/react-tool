'use client'

import { useLatestCallback } from 'hooks'
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

  /** 稳定引用 + 永远取最新逻辑，避免内联回调导致 effect 反复重启动画 */
  const handleComplete = useLatestCallback(() => {
    onComplete?.()
  })

  useEffect(() => {
    setVisibleChars(0)
    /** interval 提到 timeout 外层持有，保证 cleanup 能在卸载/依赖变化时一并清理 */
    let interval: ReturnType<typeof setInterval> | undefined

    const timer = setTimeout(() => {
      let currentChar = 0
      interval = setInterval(() => {
        if (currentChar < text.length) {
          setVisibleChars(prev => prev + 1)
          currentChar++
        }
        else {
          clearInterval(interval)
          handleComplete()
        }
      }, delay)
    }, initialDelay)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [text, delay, initialDelay])

  return (
    <div
      className={ cn('inline-flex', className) }
      aria-label={ text }
    >
      { text.split('').map((char, index) => (
        <span
          key={ index }
          aria-hidden
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
