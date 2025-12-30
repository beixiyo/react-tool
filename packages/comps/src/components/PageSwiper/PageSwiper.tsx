import type { RefObject } from 'react'
import React, { Children, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { Indicator } from './Indicator'

export const PageSwiper = memo<PageSwiperProps>((props) => {
  const {
    className,
    style,
    children,

    showPreview = false,
    previewWidth = 100,

    onIndexChange,
    initialIndex = 0,
    threshold = 0.05,
    showButtons = false,
    showIndicator = true,
    gap = 40,
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
    isHorizontalSwipe: false,
    isVerticalSwipe: false,
  })

  useEffect(() => {
    onIndexChange?.(currentIndex)
  }, [currentIndex, onIndexChange])

  /** 计算指定索引的 translateX 偏移量，保证当前页居中，左右两侧显示预览 */
  const calculateTranslateX = useCallback((index: number, containerWidth: number) => {
    if (!showPreview) {
      return index * (containerWidth + gap)
    }

    // 页面宽度 = 容器宽度 - 左右两侧预览宽度
    const pageWidth = containerWidth - 2 * previewWidth

    // track的每一页起始位置 - 左侧留白 = 最终偏移
    // 使用时会加负号，所以第一页(index=0)时: -(0 - 100) = 100px
    return index * (pageWidth + gap) - previewWidth
  }, [showPreview, previewWidth, gap])

  /** 仅在初始时设置位置，避免与拖拽动画冲突 */
  useEffect(() => {
    if (trackRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const translateX = calculateTranslateX(initialIndex, containerWidth)
      trackRef.current.style.transform = `translateX(${-translateX}px)`
    }
  }, [initialIndex, gap, showPreview, previewWidth, calculateTranslateX])

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
    dragState.current.isHorizontalSwipe = false
    dragState.current.isVerticalSwipe = false

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

    /** 检测是否为垂直滑动：垂直位移大于水平位移 */
    if (!dragState.current.isHorizontalSwipe && !dragState.current.isVerticalSwipe) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        dragState.current.isVerticalSwipe = true
      }
      else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        dragState.current.isHorizontalSwipe = true
      }
    }

    /** 如果检测到垂直滑动，禁用本次左右滑动，恢复到原始位置 */
    if (dragState.current.isVerticalSwipe) {
      if (trackRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const translateX = calculateTranslateX(currentIndex, containerWidth)
        trackRef.current.style.transition = 'transform 0.3s ease-in-out'
        trackRef.current.style.transform = `translateX(${-translateX}px)`
      }
      dragState.current.draggedDistance = 0
      return
    }

    /** 如果检测到水平滑动，阻止默认滚动行为 */
    if (dragState.current.isHorizontalSwipe && 'touches' in e) {
      e.preventDefault()
    }

    dragState.current.draggedDistance = deltaX

    const containerWidth = containerRef.current?.offsetWidth || 0
    const baseTranslate = -calculateTranslateX(currentIndex, containerWidth)
    trackRef.current.style.transform = `translateX(${baseTranslate + deltaX}px)`
  }, [currentIndex, gap, calculateTranslateX])

  const handleDragEnd = useCallback(() => {
    if (!dragState.current.isDragging)
      return
    dragState.current.isDragging = false

    const containerWidth = containerRef.current?.offsetWidth || 0
    const thresholdValue = containerWidth * threshold

    let newIndex = currentIndex

    /** 如果检测到是垂直滑动，不触发页面切换 */
    if (dragState.current.isVerticalSwipe) {
      dragState.current.isVerticalSwipe = false
      if (trackRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const translateX = calculateTranslateX(currentIndex, containerWidth)
        trackRef.current.style.transition = 'transform 0.3s ease-in-out'
        trackRef.current.style.transform = `translateX(${-translateX}px)`
      }
      dragState.current.isHorizontalSwipe = false
      return
    }

    if (dragState.current.draggedDistance < -thresholdValue && currentIndex < childrenArray.length - 1) {
      newIndex = currentIndex + 1
    }
    else if (dragState.current.draggedDistance > thresholdValue && currentIndex > 0) {
      newIndex = currentIndex - 1
    }

    if (trackRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const translateX = calculateTranslateX(newIndex, containerWidth)
      trackRef.current.style.transition = 'transform 0.3s ease-in-out'
      trackRef.current.style.transform = `translateX(${-translateX}px)`
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }

    /** 重置水平滑动状态 */
    dragState.current.isHorizontalSwipe = false
  }, [currentIndex, childrenArray.length, threshold, gap, calculateTranslateX])

  const goToNext = useCallback(() => {
    if (currentIndex < childrenArray.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      if (trackRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const translateX = calculateTranslateX(newIndex, containerWidth)
        trackRef.current.style.transition = 'transform 0.3s ease-in-out'
        trackRef.current.style.transform = `translateX(${-translateX}px)`
      }
    }
  }, [currentIndex, childrenArray.length, gap, calculateTranslateX])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      if (trackRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const translateX = calculateTranslateX(newIndex, containerWidth)
        trackRef.current.style.transition = 'transform 0.3s ease-in-out'
        trackRef.current.style.transform = `translateX(${-translateX}px)`
      }
    }
  }, [currentIndex, gap, calculateTranslateX])

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < childrenArray.length && index !== currentIndex) {
      setCurrentIndex(index)
      if (trackRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const translateX = calculateTranslateX(index, containerWidth)
        trackRef.current.style.transition = 'transform 0.3s ease-in-out'
        trackRef.current.style.transform = `translateX(${-translateX}px)`
      }
    }
  }, [currentIndex, childrenArray.length, gap, calculateTranslateX])

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
      onTouchMoveCapture={ (e) => {
        /** 如果正在水平滑动，阻止默认滚动行为 */
        if (dragState.current.isHorizontalSwipe) {
          e.preventDefault()
        }
      } }
    >
      <div
        ref={ trackRef }
        className="flex h-full"
        style={ gap > 0
          ? { gap: `${gap}px` }
          : undefined }
      >
        { childrenArray.map((child, index) => {
          // 预览模式下，所有页面宽度统一为：容器宽度 - 左右两侧预览宽度
          const pageWidth = showPreview
            ? `calc(100% - ${previewWidth * 2}px)`
            : '100%'

          return (
            <div
              key={ index }
              className="flex-shrink-0 h-full flex flex-col"
              style={ { width: pageWidth } }
            >
              <div className="flex-1 overflow-y-auto">
                { child }
              </div>
            </div>
          )
        }) }
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

PageSwiper.displayName = 'PageSwiper'

export type PageSwiperProps = {
  /**
   * 是否显示预览模式，左右两侧留白能看到预览内容
   * @default false
   */
  showPreview?: boolean
  /**
   * 预览宽度
   * @default 100
   */
  previewWidth?: number

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
   * 每个页面之间的间隔（像素）
   * @default 0
   */
  gap?: number
  /**
   * 组件引用对象
   */
  ref?: RefObject<PageSwiperRef | null>
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

export type PageSwiperRef = {
  next: () => void
  prev: () => void
  goToIndex: (index: number) => void
  getCurrentIndex: () => number
  getChildrenLength: () => number
}
