'use client'

import { useLatestCallback, useStable } from 'hooks'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { CarouselArrows, CarouselDots, CarouselImage, CarouselPreview } from './components'
import { ContinuousTrack } from './components/ContinuousTrack'
import { useCarouselAutoPlay, useCarouselDrag, useCarouselKeyboard, useCarouselNavigation } from './hooks'
import type { CarouselProps, CarouselRef } from './types'
import { getPreviewImages } from './utils'
import { getTransition, getVariants } from './variants'

/**
 * 轮播图组件
 *
 * 一个功能丰富的图片轮播组件，支持多种动画效果、自动播放、键盘导航等功能
 * 适用于图片展示、产品轮播、幻灯片等场景
 *
 * 主要特性：
 * - 支持滑动切换（触摸/鼠标拖拽）
 * - 支持多种动画类型（slide、fade、zoom）
 * - 支持自动播放和暂停
 * - 支持键盘导航（方向键）
 * - 支持预览图功能
 * - 支持自定义宽高比
 *
 * @example
 * ```tsx
 * <Carousel
 *   imgs={['img1.jpg', 'img2.jpg', 'img3.jpg']}
 *   autoPlayInterval={3000}
 *   transitionType="fade"
 *   showArrows={true}
 *   showDots={true}
 * />
 * ```
 */
export const Carousel = memo(forwardRef<CarouselRef, CarouselProps>(({
  style,
  className,
  imgs: incomingImgs = [],
  imgHeight = 400,
  autoPlayInterval = 5000,
  initialIndex = 0,
  showArrows = true,
  showDots = true,
  showPreview = false,
  previewCount = 3,
  previewPosition = 'right',
  transitionType = 'slide',
  animationDuration = transitionType === 'continuous'
    ? 0.4
    : 0.5,
  indicatorType = 'dot',
  enableSwipe = true,
  enableKeyboardNav = true,
  keyboardScope = 'container',
  enableAutoHeight = false,
  pauseOnHover = true,
  objectFit = 'cover',
  aspectRatio,
  onSlideChange,
  children,
  placeholderImage,
  previewPlaceholderImage,
}, ref) => {
  const imgs = useStable(incomingImgs)
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null)

  /** 导航逻辑 */
  const {
    currentIndex,
    direction,
    paginate: rawPaginate,
    goToIndex: rawGoToIndex,
  } = useCarouselNavigation(imgs, initialIndex, transitionType, onSlideChange)

  const trackBusy = useRef(false)
  /** 过渡中只保留最后一个意图，不回放历史操作 */
  const pendingNavigation = useRef<{ direction: number; index?: never } | { index: number; direction?: never } | null>(null)
  const flushFrame = useRef<number | null>(null)
  const paginate = useLatestCallback((direction: number) => {
    if (transitionType === 'continuous' && imgs.length > 1) {
      if (trackBusy.current) {
        pendingNavigation.current = { direction }
        return
      }
      trackBusy.current = true
    }
    rawPaginate(direction)
  })

  const next = useLatestCallback(() => paginate(1))
  const prev = useLatestCallback(() => paginate(-1))

  const goToIndex = useLatestCallback((index: number) => {
    if (transitionType === 'continuous' && imgs.length > 1) {
      if (trackBusy.current) {
        pendingNavigation.current = { index }
        return
      }
      if (index === currentIndex) return
      trackBusy.current = true
    }
    rawGoToIndex(index)
  })

  useEffect(() => () => {
    if (flushFrame.current !== null) cancelAnimationFrame(flushFrame.current)
  }, [])

  const handleTrackTransitionDone = useLatestCallback(() => {
    // 首尾克隆帧必须先无动画归位并完成一次绘制，再启动下一段动画
    // 单个 rAF 仍在绘制之前，快速切换时会把归位和下一次位移合并成反向动画
    flushFrame.current = requestAnimationFrame(() => {
      flushFrame.current = requestAnimationFrame(() => {
        flushFrame.current = null
        trackBusy.current = false
        const pending = pendingNavigation.current
        pendingNavigation.current = null
        if (pending?.index !== undefined) goToIndex(pending.index)
        else if (pending?.direction !== undefined) paginate(pending.direction)
      })
    })
  })

  /** 自动播放 */
  const { setIsPaused } = useCarouselAutoPlay(
    autoPlayInterval,
    imgs.length,
    paginate,
  )

  /** 键盘导航 */
  useCarouselKeyboard(enableKeyboardNav, paginate, keyboardScope, containerElement)

  /** 拖拽逻辑 */
  const { handleDragEnd } = useCarouselDrag(enableSwipe, paginate)

  /** 暴露组件方法给父组件 */
  useImperativeHandle(ref, () => ({
    goToIndex,
    next,
    prev,
  }), [goToIndex, next, prev])

  /** 获取预览图列表 */
  const previewImages = useMemo(() => {
    if (!showPreview) {
      return []
    }
    return getPreviewImages(currentIndex, imgs, previewCount)
  }, [showPreview, currentIndex, imgs, previewCount])

  /** 构建容器样式 */
  const containerStyle: React.CSSProperties = useMemo(() => {
    const baseStyle: React.CSSProperties = { ...style }

    if (aspectRatio) {
      baseStyle.position = 'relative'
      baseStyle.width = '100%'
      baseStyle.paddingBottom = `${(1 / aspectRatio) * 100}%`
      baseStyle.height = 0
      baseStyle.overflow = 'hidden'
    }
    else if (!enableAutoHeight) {
      baseStyle.height = `${imgHeight}px`
    }

    return baseStyle
  }, [style, aspectRatio, enableAutoHeight, imgHeight])

  return (
    <div
      ref={ setContainerElement }
      className={ cn('carousel-container relative overflow-hidden', className) }
      style={ containerStyle }
      role="region"
      aria-roledescription="carousel"
      tabIndex={ enableKeyboardNav && keyboardScope === 'container'
        ? 0
        : undefined }
      onMouseEnter={ pauseOnHover
        ? () => setIsPaused(true)
        : undefined }
      onMouseLeave={ pauseOnHover
        ? () => setIsPaused(false)
        : undefined }
    >
      { /* 主轮播图区域 */ }
      <div
        className={ cn(
          'relative w-full',
          aspectRatio
            ? 'absolute inset-0'
            : 'h-full',
        ) }
      >
        { transitionType === 'continuous'
          ? (
            <ContinuousTrack
              imgs={ imgs }
              currentIndex={ currentIndex }
              direction={ direction }
              duration={ animationDuration }
              objectFit={ objectFit }
              placeholderImage={ placeholderImage }
              enableSwipe={ enableSwipe }
              onNext={ next }
              onPrev={ prev }
              onTransitionDone={ handleTrackTransitionDone }
            >
              { children }
            </ContinuousTrack>
          )
          : (
            <AnimatePresence initial={ false } custom={ direction }>
              <motion.div
                key={ currentIndex }
                custom={ direction }
                variants={ getVariants(transitionType) }
                initial="enter"
                animate="center"
                exit="exit"
                transition={ getTransition(transitionType, animationDuration) }
                drag={ enableSwipe
                  ? 'x'
                  : false }
                dragConstraints={ { left: 0, right: 0 } }
                dragElastic={ 1 }
                onDragEnd={ handleDragEnd }
                className="absolute inset-0"
              >
                { imgs[currentIndex] && (
                  <CarouselImage
                    src={ imgs[currentIndex] }
                    alt={ `Slide ${currentIndex + 1}` }
                    objectFit={ objectFit }
                    placeholderImage={ placeholderImage }
                  >
                    { children }
                  </CarouselImage>
                ) }
              </motion.div>
            </AnimatePresence>
          ) }

        { /* 导航箭头 */ }
        { showArrows && imgs.length > 1 && (
          <CarouselArrows
            onPrev={ prev }
            onNext={ next }
          />
        ) }

        { /* 导航指示器 */ }
        { showDots && imgs.length > 1 && (
          <CarouselDots
            imgs={ imgs }
            currentIndex={ currentIndex }
            indicatorType={ indicatorType }
            onDotClick={ goToIndex }
          />
        ) }
      </div>

      { /* 预览图区域 */ }
      { showPreview && imgs.length > 1 && (
        <CarouselPreview
          previews={ previewImages }
          currentIndex={ currentIndex }
          previewPosition={ previewPosition }
          objectFit={ objectFit }
          onPreviewClick={ goToIndex }
          previewPlaceholderImage={ previewPlaceholderImage }
        />
      ) }
    </div>
  )
}))

Carousel.displayName = 'Carousel'

export type { CarouselProps, CarouselRef } from './types'
