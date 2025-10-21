import type { RefObject } from 'react'
import React, { Children, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { Indicator } from './Indicator'

export const SwipeNavi = memo<SwipeNaviProps>((props) => {
  const {
    className,
    style,
    children,
    onIndexChange,
    initialIndex = 0,
    threshold = 0.05,
    verticalThreshold = 9,
    showButtons = false,
    showIndicator = true,
    ref,
  } = props

  const childrenArray = Children.toArray(children)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const dragState = useRef({
    startX: 0,
    startY: 0,
    isDragging: false,
    draggedDistance: 0,
  })

  useEffect(() => {
    onIndexChange?.(currentIndex)
  }, [currentIndex, onIndexChange])

  /** 仅在初始时设置位置，避免与拖拽动画冲突 */
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${initialIndex * 100}%)`
    }
  }, [initialIndex])

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (childrenArray.length <= 1)
      return

    dragState.current.isDragging = true
    dragState.current.startX = 'touches' in e
      ? e.touches[0].clientX
      : e.clientX
    dragState.current.startY = 'touches' in e
      ? e.touches[0].clientY
      : e.clientY
    dragState.current.draggedDistance = 0

    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }, [childrenArray.length])

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.current.isDragging || !trackRef.current)
      return

    const currentX = 'touches' in e
      ? e.touches[0].clientX
      : e.clientX
    const currentY = 'touches' in e
      ? e.touches[0].clientY
      : e.clientY

    const deltaX = currentX - dragState.current.startX
    const deltaY = currentY - dragState.current.startY

    /** 如果垂直滚动距离大于阈值，则忽略水平滑动 */
    if (Math.abs(deltaY) > verticalThreshold) {
      return
    }

    dragState.current.draggedDistance = deltaX

    const baseTranslate = -currentIndex * (containerRef.current?.offsetWidth || 0)
    trackRef.current.style.transform = `translateX(${baseTranslate + deltaX}px)`
  }, [currentIndex, verticalThreshold])

  const handleDragEnd = useCallback(() => {
    if (!dragState.current.isDragging)
      return
    dragState.current.isDragging = false

    const containerWidth = containerRef.current?.offsetWidth || 0
    const thresholdValue = containerWidth * threshold

    let newIndex = currentIndex

    if (dragState.current.draggedDistance < -thresholdValue && currentIndex < childrenArray.length - 1) {
      newIndex = currentIndex + 1
    }
    else if (dragState.current.draggedDistance > thresholdValue && currentIndex > 0) {
      newIndex = currentIndex - 1
    }

    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.3s ease-in-out'
      trackRef.current.style.transform = `translateX(-${newIndex * 100}%)`
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
  }, [currentIndex, childrenArray.length, threshold])

  const goToNext = useCallback(() => {
    if (currentIndex < childrenArray.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.3s ease-in-out'
        trackRef.current.style.transform = `translateX(-${newIndex * 100}%)`
      }
    }
  }, [currentIndex, childrenArray.length])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.3s ease-in-out'
        trackRef.current.style.transform = `translateX(-${newIndex * 100}%)`
      }
    }
  }, [currentIndex])

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < childrenArray.length && index !== currentIndex) {
      setCurrentIndex(index)
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.3s ease-in-out'
        trackRef.current.style.transform = `translateX(-${index * 100}%)`
      }
    }
  }, [currentIndex, childrenArray.length])

  useImperativeHandle(ref, () => ({
    next: goToNext,
    prev: goToPrev,
    goToIndex,
    getCurrentIndex: () => currentIndex,
    getChildrenLength: () => childrenArray.length,
  }), [goToNext, goToPrev, goToIndex, currentIndex, childrenArray.length])

  return (
    <div
      ref={ containerRef }
      className={ cn('overflow-hidden w-full h-full relative', className) }
      style={ style }
      onMouseDown={ handleDragStart }
      onTouchStart={ handleDragStart }
      onMouseMove={ handleDragMove }
      onTouchMove={ handleDragMove }
      onMouseUp={ handleDragEnd }
      onMouseLeave={ handleDragEnd }
      onTouchEnd={ handleDragEnd }
    >
      <div
        ref={ trackRef }
        className="flex h-full"
      >
        { childrenArray.map((child, index) => (
          <div key={ index } className="flex-shrink-0 w-full h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              { child }
            </div>
          </div>
        )) }
      </div>

      {/* 两侧按钮 */ }
      { showButtons && childrenArray.length > 1 && (
        <>
          {/* 左侧按钮 */ }
          { currentIndex > 0 && (
            <button
              onClick={ goToPrev }
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200"
              aria-label="上一页"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          ) }

          {/* 右侧按钮 */ }
          { currentIndex < childrenArray.length - 1 && (
            <button
              onClick={ goToNext }
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200"
              aria-label="下一页"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ) }
        </>
      ) }

      {/* Indicator - 已移动到 Header 右侧 */ }
      { showIndicator && childrenArray.length > 1 && (
        <Indicator
          activeIndex={ currentIndex }
          length={ childrenArray.length }
          onChange={ goToIndex }
        />
      ) }
    </div>
  )
})

SwipeNavi.displayName = 'SwipeNavigation'

export type SwipeNaviProps = {
  /**
   * 当页面切换时触发的回调
   */
  onIndexChange?: (index: number) => void
  /**
   * 初始页面索引
   * @default 0
   */
  initialIndex?: number
  /**
   * 滑动切换的阈值，相对于容器宽度的比例
   * @default 0.15
   */
  threshold?: number
  /**
   * 垂直滚动阈值，当垂直滚动距离超过此值时忽略水平滑动
   * @default 10
   */
  verticalThreshold?: number
  /**
   * 是否显示两侧切换按钮
   * @default false
   */
  showButtons?: boolean
  /**
   * 是否显示底部指示器
   * @default true
   */
  showIndicator?: boolean
  /**
   * 组件引用对象
   */
  ref?: RefObject<SwipeNaviRef | null>
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

export type SwipeNaviRef = {
  next: () => void
  prev: () => void
  goToIndex: (index: number) => void
  getCurrentIndex: () => number
  getChildrenLength: () => number
}
