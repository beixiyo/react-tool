'use client'

import type { CarouselProps, CarouselRef } from './types'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo } from 'react'
import { cn } from 'utils'
import {
  CarouselArrows,
  CarouselDots,
  CarouselImage,
  CarouselPreview,
} from './components'
import {
  useCarouselAutoPlay,
  useCarouselDrag,
  useCarouselKeyboard,
  useCarouselNavigation,
} from './hooks'
import { getPreviewImages } from './utils'
import { getTransition, getVariants } from './variants'

/**
 * 轮播图组件
 *
 * 一个功能丰富的图片轮播组件，支持多种动画效果、自动播放、键盘导航等功能。
 * 适用于图片展示、产品轮播、幻灯片等场景。
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
  imgs = [],
  imgHeight = 400,
  autoPlayInterval = 5000,
  initialIndex = 0,
  showArrows = true,
  showDots = true,
  showPreview = false,
  previewCount = 3,
  previewPosition = 'right',
  transitionType = 'slide',
  animationDuration = 0.5,
  indicatorType = 'dot',
  enableSwipe = true,
  enableKeyboardNav = true,
  enableAutoHeight = false,
  pauseOnHover = true,
  objectFit = 'cover',
  aspectRatio,
  onSlideChange,
  children,
  placeholderImage,
  previewPlaceholderImage,
}, ref) => {
  // 导航逻辑
  const {
    currentIndex,
    direction,
    paginate,
    goToIndex,
    handleIndexChange,
    setDirectionIfNeeded,
  } = useCarouselNavigation(imgs, initialIndex, transitionType, onSlideChange)

  // 自动播放
  const { setIsPaused } = useCarouselAutoPlay(
    autoPlayInterval,
    imgs.length,
    paginate,
  )

  // 键盘导航
  useCarouselKeyboard(enableKeyboardNav, paginate)

  // 拖拽逻辑
  const { handleDragEnd } = useCarouselDrag(enableSwipe, paginate)

  // 暴露组件方法给父组件
  useImperativeHandle(ref, () => ({
    goToIndex,
    next: () => paginate(1),
    prev: () => paginate(-1),
  }), [goToIndex, paginate])

  // 获取预览图列表
  const previewImages = useMemo(() => {
    if (!showPreview) {
      return []
    }
    return getPreviewImages(currentIndex, imgs, previewCount)
  }, [showPreview, currentIndex, imgs, previewCount])

  // 构建容器样式
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

  // 处理指示器点击
  const handleDotClick = useCallback((index: number, direction: number) => {
    setDirectionIfNeeded(direction)
    handleIndexChange(index)
  }, [setDirectionIfNeeded, handleIndexChange])

  // 处理预览图点击
  const handlePreviewClick = useCallback((index: number) => {
    setDirectionIfNeeded(1)
    handleIndexChange(index)
  }, [setDirectionIfNeeded, handleIndexChange])

  return (
    <div
      className={ cn('carousel-container relative overflow-hidden', className) }
      style={ containerStyle }
      onMouseEnter={ pauseOnHover ? () => setIsPaused(true) : undefined }
      onMouseLeave={ pauseOnHover ? () => setIsPaused(false) : undefined }
    >
      {/* 主轮播图区域 */}
      <div className={ cn(
        'relative w-full',
        aspectRatio ? 'absolute inset-0' : 'h-full',
      ) }>
        <AnimatePresence initial={ false } custom={ direction }>
          <motion.div
            key={ currentIndex }
            custom={ direction }
            variants={ getVariants(transitionType) }
            initial="enter"
            animate="center"
            exit="exit"
            transition={ getTransition(transitionType, animationDuration) }
            drag={ enableSwipe ? 'x' : false }
            dragConstraints={ { left: 0, right: 0 } }
            dragElastic={ 1 }
            onDragEnd={ handleDragEnd }
            className="absolute inset-0"
          >
            {imgs[currentIndex] && (
              <CarouselImage
                src={ imgs[currentIndex] }
                alt={ `Slide ${currentIndex + 1}` }
                objectFit={ objectFit }
                placeholderImage={ placeholderImage }
              >
                {children}
              </CarouselImage>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 导航箭头 */}
        {showArrows && imgs.length > 1 && (
          <CarouselArrows
            onPrev={ () => paginate(-1) }
            onNext={ () => paginate(1) }
          />
        )}

        {/* 导航指示器 */}
        {showDots && imgs.length > 1 && (
          <CarouselDots
            imgs={ imgs }
            currentIndex={ currentIndex }
            indicatorType={ indicatorType }
            onDotClick={ handleDotClick }
          />
        )}
      </div>

      {/* 预览图区域 */}
      {showPreview && imgs.length > 1 && (
        <CarouselPreview
          previews={ previewImages }
          currentIndex={ currentIndex }
          previewPosition={ previewPosition }
          objectFit={ objectFit }
          onPreviewClick={ handlePreviewClick }
          previewPlaceholderImage={ previewPlaceholderImage }
        />
      )}
    </div>
  )
}))

Carousel.displayName = 'Carousel'

// 导出类型
export type { CarouselProps, CarouselRef } from './types'
