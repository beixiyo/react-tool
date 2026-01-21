import type { PageSwiperProps } from './types'
import { useShortCutKey } from 'hooks'
import { Children, memo, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { Indicator } from './Indicator'
import { NavigationButtons } from './NavigationButtons'
import { useDragHandler } from './useDragHandler'
import { usePageNavigation } from './usePageNavigation'

export const PageSwiper = memo<PageSwiperProps>((props) => {
  const {
    className,
    style,
    children,

    showPreview = false,
    previewWidth = 100,

    index: controlledIndex,
    onIndexChange,
    threshold = 0.05,
    showButtons = false,
    showIndicator = true,
    gap = 40,
    ref,
  } = props

  const childrenArray = Children.toArray(children)
  const childrenLength = childrenArray.length
  const isControlled = controlledIndex !== undefined
  /** 非受控模式：如果没有传入 index，使用内部状态，初始值为 0 */
  const [internalIndex, setInternalIndex] = useState(0)

  /** 受控模式使用外部传入的 index，非受控模式使用内部状态 */
  const currentIndex = isControlled
    ? controlledIndex
    : internalIndex

  /** 预览模式：当 showPreview 为 true 时生效 */
  const effectiveShowPreview = showPreview

  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /** 页面导航逻辑 */
  const { calculateTranslateX, applyTransform, getContainerWidth } = usePageNavigation({
    showPreview: effectiveShowPreview,
    previewWidth,
    gap,
    currentIndex,
    trackRef,
    containerRef,
  })

  /** 处理索引更新的统一方法 */
  const handleIndexChange = useCallback((newIndex: number) => {
    if (isControlled) {
      /** 受控模式：只调用回调，不更新内部状态 */
      onIndexChange?.(newIndex)
    }
    else {
      /** 非受控模式：更新内部状态 */
      setInternalIndex(newIndex)
      onIndexChange?.(newIndex)
    }
  }, [isControlled, onIndexChange])

  /** 拖拽处理逻辑 */
  const { handleDragStart, handleDragMove, handleDragEnd, handleTouchMoveCapture } = useDragHandler({
    currentIndex,
    childrenLength,
    threshold,
    trackRef,
    containerRef,
    applyTransform,
    calculateTranslateX,
    getContainerWidth,
    onIndexChange: handleIndexChange,
  })

  /** 页面导航方法 */
  const goToNext = useCallback(() => {
    if (currentIndex < childrenLength - 1) {
      const newIndex = currentIndex + 1
      handleIndexChange(newIndex)
      applyTransform(newIndex, true)
    }
  }, [currentIndex, childrenLength, handleIndexChange, applyTransform])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      handleIndexChange(newIndex)
      applyTransform(newIndex, true)
    }
  }, [currentIndex, handleIndexChange, applyTransform])

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < childrenLength && index !== currentIndex) {
      handleIndexChange(index)
      applyTransform(index, true)
    }
  }, [currentIndex, childrenLength, handleIndexChange, applyTransform])

  useShortCutKey({
    key: 'ArrowLeft',
    fn: () => goToPrev(),
  })

  useShortCutKey({
    key: 'ArrowRight',
    fn: () => goToNext(),
  })

  useImperativeHandle(ref, () => ({
    next: goToNext,
    prev: goToPrev,
    goToIndex,
    getCurrentIndex: () => currentIndex,
    getChildrenLength: () => childrenLength,
  }), [goToNext, goToPrev, goToIndex, currentIndex, childrenLength])

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
          /**
           * 预览模式下，所有页面宽度统一为：容器宽度 - 左右两侧预览宽度
           * 只有在内容长度大于 1 时，才应用预览模式的宽度计算
           */
          const pageWidth = effectiveShowPreview
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
      { showButtons && (
        <NavigationButtons
          currentIndex={ currentIndex }
          totalPages={ childrenLength }
          onPrev={ goToPrev }
          onNext={ goToNext }
        />
      ) }

      {/* Indicator - 已移动到 Header 右侧 */ }
      { showIndicator && childrenLength > 1 && (
        <Indicator
          activeIndex={ currentIndex }
          length={ childrenLength }
          onChange={ goToIndex }
        />
      ) }
    </div>
  )
})

PageSwiper.displayName = 'PageSwiper'

export type { PageSwiperProps, PageSwiperRef } from './types'
