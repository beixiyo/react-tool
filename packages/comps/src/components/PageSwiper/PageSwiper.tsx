import { useControllableState, useLatestRef, useResizeObserver, useShortCutKey, useWheelDirection } from 'hooks'
import { Children, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { useDragHandler } from './hooks/useDragHandler'
import { usePageNavigation } from './hooks/usePageNavigation'
import { Indicator } from './subcomponents/Indicator'
import { NavigationButtons } from './subcomponents/NavigationButtons'
import type { PageSwiperProps } from './types'

export const PageSwiper = memo<PageSwiperProps>((props) => {
  const {
    className,
    contentClassName,
    style,
    children,

    showPreview = false,
    previewWidth = 100,

    index: controlledIndex,
    initialIndex = 0,
    onIndexChange,
    threshold = 0.05,
    showButtons = false,
    showIndicator = true,
    gap = 40,
    enableWheel = false,
    enableKeyboard = true,
    keyboardScope = 'global',
    ref,
  } = props

  const childrenArray = Children.toArray(children)
  const childrenLength = childrenArray.length
  const [currentIndex, setCurrentIndex] = useControllableState({
    value: controlledIndex,
    defaultValue: initialIndex,
    onChange: onIndexChange,
  })

  /** 预览模式：当 showPreview 为 true 时生效 */
  const effectiveShowPreview = showPreview

  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /** 容器元素同时存一份 state，供 container 作用域的键盘监听在挂载后绑定 */
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null)
  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el
    setContainerElement(el)
  }, [])

  /** 页面导航逻辑 */
  const { calculateTranslateX, applyTransform, getContainerWidth, isAnimatingRef } = usePageNavigation({
    showPreview: effectiveShowPreview,
    previewWidth,
    gap,
    currentIndex,
    trackRef,
    containerRef,
  })

  /** 用 ref 持有最新回调与索引，避免空依赖 effect 捕获陈旧引用 */
  const onIndexChangeRef = useLatestRef(onIndexChange)
  const currentIndexRef = useLatestRef(currentIndex)

  /** 确保初始索引同步到外部（仅挂载时执行一次） */
  useEffect(() => {
    onIndexChangeRef.current?.(currentIndexRef.current)
    /** 仅在挂载时同步一次初始索引 */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    onIndexChange: setCurrentIndex,
  })

  /** 页面导航方法 */
  const goToNext = useCallback(() => {
    if (currentIndex < childrenLength - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      applyTransform(newIndex, true)
    }
  }, [currentIndex, childrenLength, applyTransform])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      applyTransform(newIndex, true)
    }
  }, [currentIndex, applyTransform])

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < childrenLength && index !== currentIndex) {
      setCurrentIndex(index)
      applyTransform(index, true)
    }
  }, [currentIndex, childrenLength, applyTransform])

  /** 滚轮控制上一页 / 下一页 */
  const handleWheel = useWheelDirection(
    {
      onScrollUp: () => {
        if (childrenLength > 1) goToPrev()
      },
      onScrollDown: () => {
        if (childrenLength > 1) goToNext()
      },
    },
    {
      /** 适当提高阈值，避免触控板轻微抖动导致误触发 */
      threshold: 20,
      /** 默认阻止容器自身滚动，专注于翻页（若内部仍可滚动则不会触发） */
      preventDefault: true,
      stopPropagation: true,
      enable: enableWheel,
      useClosestScrollableParent: true,
      boundaryContainerRef: containerRef,
    },
  )

  /** 方向键翻页：默认监听 window，`keyboardScope="container"` 时只在焦点位于容器内时响应 */
  const keyboardTarget = keyboardScope === 'container'
    ? containerElement
    : typeof window === 'undefined'
    ? null
    : window

  useShortCutKey({
    key: 'ArrowLeft',
    el: keyboardTarget,
    onKeyDown: () => goToPrev(),
    enabled: enableKeyboard,
    ignoreWhenEditable: true,
  })

  useShortCutKey({
    key: 'ArrowRight',
    el: keyboardTarget,
    onKeyDown: () => goToNext(),
    enabled: enableKeyboard,
    ignoreWhenEditable: true,
  })

  useImperativeHandle(ref, () => ({
    next: goToNext,
    prev: goToPrev,
    goToIndex,
    getCurrentIndex: () => currentIndex,
    getChildrenLength: () => childrenLength,
  }), [goToNext, goToPrev, goToIndex, currentIndex, childrenLength])

  useResizeObserver([containerRef], () => {
    if (isAnimatingRef.current) {
      return
    }
    applyTransform(currentIndex, false)
  })

  return (
    <div
      ref={ setContainerRef }
      className={ cn('w-full h-full relative', className) }
      style={ style }
      tabIndex={ enableKeyboard && keyboardScope === 'container'
        ? 0
        : undefined }
      onWheel={ handleWheel }
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
              className="flex h-full shrink-0 flex-col"
              style={ { width: pageWidth } }
            >
              <div className={ cn('flex-1 overflow-y-auto', contentClassName) }>
                { child }
              </div>
            </div>
          )
        }) }
      </div>

      { /* 两侧按钮 */ }
      { showButtons && (
        <NavigationButtons
          currentIndex={ currentIndex }
          totalPages={ childrenLength }
          onPrev={ goToPrev }
          onNext={ goToNext }
        />
      ) }

      { /* Indicator - 已移动到 Header 右侧 */ }
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
