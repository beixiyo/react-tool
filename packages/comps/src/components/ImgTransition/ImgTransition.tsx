'use client'

import cn from 'clsx'
import { useLatestCallback } from 'hooks'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useEffect, useState } from 'react'
import type { ImgTransitionProps } from './types'

/**
 * 图片过渡组件
 * - 在一组图片间循环切换，带淡入淡出与模糊过渡
 */
export const ImgTransition = memo<ImgTransitionProps>(({
  srcs,
  interval = 3000,
  transitionDuration = 0.3,
  paused = false,
  className,
  style,
  imgClassName,
  alt,
  getAlt,
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  /** 用稳定引用持有回调，避免内联函数导致定时器频繁重建 */
  const notifyIndexChange = useLatestCallback((index: number) => {
    onIndexChange?.(index)
  })

  useEffect(() => {
    if (srcs.length === 0 || paused) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const next = (prevIndex + 1) % srcs.length
        notifyIndexChange(next)
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [srcs.length, interval, paused])

  if (srcs.length === 0) return null

  const resolvedAlt = getAlt
    ? getAlt(currentIndex)
    : (alt ?? `Transition image ${currentIndex + 1}`)

  return (
    <div
      className={ cn('relative w-full h-full overflow-hidden', className) }
      style={ style }
    >
      <AnimatePresence mode="wait">
        <motion.img
          decoding="async"
          loading="lazy"
          key={ currentIndex }
          src={ srcs[currentIndex] }
          alt={ resolvedAlt }
          className={ cn('w-full rounded-md', imgClassName) }
          initial={ { opacity: 0.3, filter: 'blur(10px)' } }
          animate={ {
            opacity: 1,
            filter: 'blur(0px)',
          } }
          exit={ {
            opacity: 0.1,
            filter: 'blur(10px)',
          } }
          transition={ {
            duration: transitionDuration,
          } }
        />
      </AnimatePresence>
    </div>
  )
})

ImgTransition.displayName = 'ImgTransition'
