'use client'

import cn from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import React, { memo, useEffect, useState } from 'react'

/**
 * 图片过渡组件
 */
export const ImgTransition = memo<ImgTransitionProps>(({
  srcs,
  interval = 3000,
  className,
  style,
  imgClassName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % srcs.length)
    }, interval)

    return () => clearInterval(timer)
  }, [srcs.length, interval])

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
          alt={ `Transition image ${currentIndex + 1}` }
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
            duration: 0.3,
          } }
        />
      </AnimatePresence>
    </div>
  )
})

ImgTransition.displayName = 'ImgTransition'

interface ImgTransitionProps {
  srcs: string[]
  interval?: number
  className?: string
  style?: React.CSSProperties
  imgClassName?: string
}
