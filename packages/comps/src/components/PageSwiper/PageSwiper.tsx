import { Children, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { Indicator } from './Indicator'
import { NavigationButtons } from './NavigationButtons'
import { usePageNavigation } from './usePageNavigation'
import { useDragHandler } from './useDragHandler'
import type { PageSwiperProps } from './types'

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

  // 页面导航逻辑
  const { calculateTranslateX, applyTransform, getContainerWidth } = usePageNavigation({
    showPreview,
    previewWidth,
    gap,
    initialIndex,
    trackRef,
    containerRef,
  })

  // 处理索引变化回调
  useEffect(() => {
    onIndexChange?.(currentIndex)
  }, [currentIndex, onIndexChange])

  // 拖拽处理逻辑
  const { handleDragStart, handleDragMove, handleDragEnd, handleTouchMoveCapture } = useDragHandler({
    currentIndex,
    childrenLength: childrenArray.length,
    threshold,
    trackRef,
    containerRef,
    applyTransform,
    calculateTranslateX,
    getContainerWidth,
    onIndexChange: setCurrentIndex,
  })

  // 页面导航方法
  const goToNext = useCallback(() => {
    if (currentIndex < childrenArray.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      applyTransform(newIndex, true)
    }
  }, [currentIndex, childrenArray.length, applyTransform])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      applyTransform(newIndex, true)
    }
  }, [currentIndex, applyTransform])

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < childrenArray.length && index !== currentIndex) {
      setCurrentIndex(index)
      applyTransform(index, true)
    }
  }, [currentIndex, childrenArray.length, applyTransform])

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
      onTouchMoveCapture={ handleTouchMoveCapture }
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

      {/* 两侧按钮 */}
      { showButtons && (
        <NavigationButtons
          currentIndex={ currentIndex }
          totalPages={ childrenArray.length }
          onPrev={ goToPrev }
          onNext={ goToNext }
        />
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

// 导出类型
export type { PageSwiperProps, PageSwiperRef } from './types'
