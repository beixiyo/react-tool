import type { ScrollCarouselProps } from './types'
import { useLatestCallback } from 'hooks'
import { Children, memo, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { useDrag } from './useDrag'

const TRANSITION = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'

/**
 * 多卡片可见的横向滚动轮播
 *
 * 支持触摸/鼠标拖拽手势、边界橡皮筋、快速滑动检测、
 * 图片拖拽禁用、进度回调、命令式导航 API
 */
export const ScrollCarousel = memo<ScrollCarouselProps>((props) => {
  const {
    className,
    style,
    children,
    gap = 16,
    threshold = 0.15,
    onProgressChange,
    onIndexChange,
    disableDrag = false,
    ref,
    ...restProps
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)

  const childrenArray = Children.toArray(children)
  const childrenLength = childrenArray.length

  /** 获取第一张卡片宽度 */
  const getCardWidth = useLatestCallback(() => {
    const firstCard = trackRef.current?.children[0] as HTMLElement | undefined
    return firstCard?.offsetWidth ?? 300
  })

  /** 最大可滚动距离 */
  const getMaxScrollLeft = useLatestCallback(() => {
    const track = trackRef.current
    const container = containerRef.current
    if (!track || !container)
      return 0
    return Math.max(0, track.scrollWidth - container.clientWidth)
  })

  /** 当前滚动位置 */
  const getCurrentScrollLeft = useLatestCallback(() => scrollLeft)

  /** 计算并通知进度 */
  const notifyProgress = useLatestCallback((sl: number) => {
    if (!onProgressChange)
      return
    const max = getMaxScrollLeft()
    if (max <= 0) {
      onProgressChange(0)
      return
    }
    onProgressChange(Math.min(1, Math.max(0, sl / max)))
  })

  /** 应用 transform 并更新状态 */
  const applyScrollLeft = useLatestCallback((value: number, animate: boolean) => {
    const track = trackRef.current
    if (!track)
      return
    const max = getMaxScrollLeft()
    const clamped = Math.min(max, Math.max(0, value))

    track.style.transition = animate
      ? TRANSITION
      : 'none'
    track.style.transform = `translateX(${-clamped}px)`
    setScrollLeft(clamped)
    notifyProgress(clamped)
  })

  /** 拖拽移动时实时跟随（不 clamp，允许边界橡皮筋） */
  const handleDragMove = useLatestCallback((sl: number) => {
    const track = trackRef.current
    if (!track)
      return
    track.style.transform = `translateX(${-sl}px)`
    setScrollLeft(sl)
    notifyProgress(Math.max(0, sl))
  })

  /** 拖拽结束：根据方向滚动一张卡片或回弹 */
  const handleDragEnd = useLatestCallback((direction: -1 | 0 | 1) => {
    const cardWidth = getCardWidth()
    const max = getMaxScrollLeft()

    if (direction === 0) {
      /** 没有触发切换，吸附到最近的卡片 */
      const nearestIndex = Math.round(scrollLeft / (cardWidth + gap))
      const target = Math.min(max, nearestIndex * (cardWidth + gap))
      applyScrollLeft(target, true)
      onIndexChange?.(nearestIndex)
      return
    }

    /** 计算当前索引并移动一格 */
    const currentIndex = Math.round(scrollLeft / (cardWidth + gap))
    const nextIndex = Math.max(0, Math.min(childrenLength - 1, currentIndex + direction))
    const target = Math.min(max, nextIndex * (cardWidth + gap))
    applyScrollLeft(target, true)
    onIndexChange?.(nextIndex)
  })

  const drag = useDrag({
    trackRef,
    threshold,
    getCardWidth,
    getMaxScrollLeft,
    getCurrentScrollLeft,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
  })

  /** 命令式导航 */
  const scrollByCards = useLatestCallback((count: number) => {
    const cardWidth = getCardWidth()
    const max = getMaxScrollLeft()
    const currentIndex = Math.round(scrollLeft / (cardWidth + gap))
    const nextIndex = Math.max(0, Math.min(childrenLength - 1, currentIndex + count))
    const target = Math.min(max, nextIndex * (cardWidth + gap))
    applyScrollLeft(target, true)
    onIndexChange?.(nextIndex)
  })

  useImperativeHandle(ref, () => ({
    next: () => scrollByCards(1),
    prev: () => scrollByCards(-1),
    goToIndex: (index: number) => {
      const cardWidth = getCardWidth()
      const max = getMaxScrollLeft()
      const target = Math.min(max, index * (cardWidth + gap))
      applyScrollLeft(target, true)
      onIndexChange?.(index)
    },
    getProgress: () => {
      const max = getMaxScrollLeft()
      return max <= 0
        ? 0
        : Math.min(1, Math.max(0, scrollLeft / max))
    },
    getChildrenLength: () => childrenLength,
    getIsOverflow: () => getMaxScrollLeft() > 0,
  }), [scrollLeft, gap, childrenLength, getCardWidth, getMaxScrollLeft, applyScrollLeft, onIndexChange, scrollByCards])

  const dragHandlers = disableDrag
    ? {}
    : {
        onMouseDown: drag.handleDragStart,
        onTouchStart: drag.handleDragStart,
        onMouseMove: drag.handleDragMove,
        onTouchMove: drag.handleDragMove,
        onMouseUp: drag.handleDragEnd,
        onMouseLeave: drag.handleDragEnd,
        onTouchEnd: drag.handleDragEnd,
        onTouchMoveCapture: drag.handleTouchMoveCapture,
      }

  return (
    <div
      ref={ containerRef }
      className={ cn('overflow-hidden select-none', className) }
      style={ style }
      { ...dragHandlers }
      { ...restProps }
    >
      <div
        ref={ trackRef }
        className="flex"
        style={ {
          gap: `${gap}px`,
          willChange: 'transform',
        } }
        onDragStart={ e => e.preventDefault() }
      >
        { childrenArray.map((child, index) => (
          <div key={ index } className="shrink-0">
            { child }
          </div>
        )) }
      </div>
    </div>
  )
})

ScrollCarousel.displayName = 'ScrollCarousel'
