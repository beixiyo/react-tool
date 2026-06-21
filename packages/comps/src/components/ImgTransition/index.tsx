'use client'

import cn from 'clsx'
import { useLatestCallback } from 'hooks'
import { AnimatePresence, motion } from 'motion/react'
import React, { memo, useEffect, useState } from 'react'

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
    if (srcs.length === 0 || paused)
      return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const next = (prevIndex + 1) % srcs.length
        notifyIndexChange(next)
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [srcs.length, interval, paused])

  if (srcs.length === 0)
    return null

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

export interface ImgTransitionProps {
  /**
   * 图片地址列表
   */
  srcs: string[]
  /**
   * 自动切换间隔（毫秒）
   * @default 3000
   */
  interval?: number
  /**
   * 单次过渡动画时长（秒）
   * @default 0.3
   */
  transitionDuration?: number
  /**
   * 是否暂停自动切换
   * @default false
   */
  paused?: boolean
  /**
   * 容器类名
   */
  className?: string
  /**
   * 容器内联样式
   */
  style?: React.CSSProperties
  /**
   * 图片类名
   */
  imgClassName?: string
  /**
   * 图片 alt 文案（静态）；纯装饰图可传空串
   * @default `Transition image ${index + 1}`
   */
  alt?: string
  /**
   * 根据当前索引动态生成 alt 文案，优先级高于 alt
   */
  getAlt?: (index: number) => string
  /**
   * 当前图片索引变化时的回调
   */
  onIndexChange?: (index: number) => void
}
