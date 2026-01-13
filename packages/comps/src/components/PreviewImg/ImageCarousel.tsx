'use client'

import type { CarouselRef } from '../Carousel'
import { memo, useEffect, useRef } from 'react'
import { cn } from 'utils'
import { Carousel } from '../Carousel'

export interface ImageCarouselProps {
  /**
   * 图片数组
   */
  images: string[]
  /**
   * 当前选中的图片索引
   */
  currentIndex: number
  /**
   * 图片切换回调
   */
  onImageChange: (index: number) => void
  /**
   * 轮播图高度（用于计算预留空间）
   */
  height?: number
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 顶部图片轮播组件
 * 用于多图预览时在顶部显示可切换的轮播图
 */
export const ImageCarousel = memo<ImageCarouselProps>(({
  images,
  currentIndex,
  onImageChange,
  height = 120,
  className,
}) => {
  const carouselRef = useRef<CarouselRef>(null)

  /** 同步轮播图索引 */
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.goToIndex(currentIndex)
    }
  }, [currentIndex])

  if (images.length <= 1) {
    return null
  }

  return (
    <div
      className={ cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-[60]',
        'pointer-events-auto',
        className,
      ) }
      style={ { height: `${height}px` } }
    >
      <div className="h-full w-[600px] max-w-[90vw] min-w-[300px]">
        <Carousel
          ref={ carouselRef }
          imgs={ images }
          imgHeight={ height }
          initialIndex={ currentIndex }
          showArrows={ true }
          showDots={ true }
          enableSwipe={ true }
          enableKeyboardNav={ false }
          pauseOnHover={ true }
          transitionType="fade"
          animationDuration={ 0.3 }
          objectFit="contain"
          onSlideChange={ onImageChange }
          className="h-full w-full rounded-lg overflow-hidden bg-backgroundSecondary/80 backdrop-blur-sm border border-border"
        />
      </div>
    </div>
  )
})

ImageCarousel.displayName = 'ImageCarousel'
