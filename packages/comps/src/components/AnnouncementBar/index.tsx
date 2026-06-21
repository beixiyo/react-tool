'use client'

import { memo, useEffect, useState } from 'react'
import { cn } from 'utils'

export const AnnouncementBar = memo<AnnouncementBarProps>((props) => {
  const {
    style,
    className = 'bg-linear-to-b from-black/50 to-transparent',
    items = [],
    direction = 'vertical',
    durationMs = 3000,
    transitionMs = 500,
    pauseOnHover = true,
    itemClassName = 'text-white',
    ariaLabel = 'Announcement',
    ariaLive = 'polite',
  } = props

  /** 复位等待时间不得超过轮播间隔，避免 durationMs 过小时跳条/空白 */
  const safeTransitionMs = Math.max(0, Math.min(transitionMs, durationMs))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const length = items.length
  /** 首尾无缝：在末尾追加第一条 */
  const duplicatedItems = length > 0
    ? [...items, items[0]]
    : []

  useEffect(() => {
    if (length <= 1 || (pauseOnHover && isHovered))
      return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setCurrentIndex(prev => prev + 1)
    }, durationMs)

    return () => clearInterval(timer)
  }, [length, durationMs, pauseOnHover, isHovered])

  /** 当到达克隆的最后一条时，等待过渡动画结束，瞬间归位到第一条 */
  useEffect(() => {
    if (currentIndex === length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0)
      }, safeTransitionMs) // 与下方内联 transition 时长保持单一来源
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, length, safeTransitionMs])

  if (!length) {
    return null
  }

  const isVertical = direction === 'vertical'
  const offset = currentIndex * (100 / duplicatedItems.length)

  return (
    <div
      className={ cn(
        'relative overflow-hidden flex',
        isVertical
          ? 'flex-col justify-start'
          : 'flex-row items-center justify-start',
        className,
      ) }
      style={ style }
      role="region"
      aria-label={ ariaLabel }
      aria-live={ ariaLive }
      onMouseEnter={ () => setIsHovered(true) }
      onMouseLeave={ () => setIsHovered(false) }
    >
      <div
        className={ cn(
          'flex shrink-0 w-full h-full',
          isVertical
            ? 'flex-col'
            : 'flex-row',
        ) }
        style={ {
          transform: isVertical
            ? `translateY(-${offset}%)`
            : `translateX(-${offset}%)`,
          transition: isTransitioning
            ? `transform ${transitionMs}ms ease-in-out`
            : 'none',
          height: isVertical
            ? `${duplicatedItems.length * 100}%`
            : '100%',
          width: !isVertical
            ? `${duplicatedItems.length * 100}%`
            : '100%',
        } }
      >
        { duplicatedItems.map((item, index) => (
          <div
            key={ index }
            className={ cn(
              'flex items-center justify-center w-full h-full shrink-0',
              !isVertical && 'px-4',
              itemClassName,
            ) }
            style={ {
              height: isVertical
                ? `${100 / duplicatedItems.length}%`
                : '100%',
              width: !isVertical
                ? `${100 / duplicatedItems.length}%`
                : '100%',
            } }
          >
            { item }
          </div>
        )) }
      </div>
    </div>
  )
})

AnnouncementBar.displayName = 'AnnouncementBar'

export type AnnouncementBarProps = {
  items: React.ReactNode[]
  direction?: 'horizontal' | 'vertical'
  /**
   * 轮播间隔时间，单位：毫秒
   * @default 3000
   */
  durationMs?: number
  /**
   * 切换过渡动画时长，单位：毫秒（同时用于内联 transition 与复位定时器，保证单一来源）
   * @default 500
   */
  transitionMs?: number
  /**
   * 是否在鼠标悬停时暂停轮播
   * @default true
   */
  pauseOnHover?: boolean
  /**
   * 单条内容样式
   * @default ''
   */
  itemClassName?: string
  /**
   * 无障碍标签文案
   * @default 'Announcement'
   */
  ariaLabel?: string
  /**
   * 轮播内容更新的 aria-live 朗读策略
   * @default 'polite'
   */
  ariaLive?: 'off' | 'polite' | 'assertive'
} & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
