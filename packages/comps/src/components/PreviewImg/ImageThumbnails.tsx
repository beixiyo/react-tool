'use client'

import { memo, useCallback, useEffect, useRef } from 'react'
import { cn } from 'utils'

export interface ImageThumbnailsProps {
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
   * 自定义类名
   */
  className?: string
}

/**
 * 图片缩略图预览组件
 * 用于多图预览时在底部显示可切换的缩略图列表
 */
export const ImageThumbnails = memo<ImageThumbnailsProps>(({
  images,
  currentIndex,
  onImageChange,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  /** 检查是否需要显示滚动按钮 */
  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current || !containerRef.current) {
      return
    }
  }, [])

  /** 滚动到指定索引的缩略图 */
  const scrollToIndex = useCallback((index: number) => {
    if (!scrollContainerRef.current) {
      return
    }

    const scrollContainer = scrollContainerRef.current
    const thumbnails = scrollContainer.children
    const targetThumbnail = thumbnails[index] as HTMLElement

    if (targetThumbnail) {
      const containerHeight = scrollContainer.clientHeight
      const thumbnailTop = targetThumbnail.offsetTop
      const thumbnailHeight = targetThumbnail.offsetHeight
      const scrollTop = thumbnailTop - (containerHeight / 2) + (thumbnailHeight / 2)

      scrollContainer.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      })
    }
  }, [])

  /** 当当前索引变化时，滚动到对应位置 */
  useEffect(() => {
    scrollToIndex(currentIndex)
  }, [currentIndex, scrollToIndex])

  /** 监听滚动事件 */
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) {
      return
    }

    checkScrollButtons()
    scrollContainer.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)

    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [checkScrollButtons])

  /** 初始检查 */
  useEffect(() => {
    checkScrollButtons()
  }, [images, checkScrollButtons])

  if (images.length <= 1) {
    return null
  }

  return (
    <div
      ref={ containerRef }
      className={ cn(
        'fixed right-10 top-1/2 -translate-y-1/2 z-[60]',
        'pointer-events-auto',
        className,
      ) }
    >
      {/* 缩略图容器 */ }
      <div
        ref={ scrollContainerRef }
        className={ cn(
          'flex flex-col gap-2 overflow-y-auto overflow-x-hidden',
          'scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent',
          'p-1',
          'bg-backgroundSecondary/30 backdrop-blur-sm rounded-xl border border-border',
        ) }
        style={ {
          maxHeight: 'calc(95vh - 80px)',
          maxWidth: '80px',
        } }
      >
        { images.map((src, index) => (
          <button
            key={ `${src}-${index}` }
            onClick={ () => onImageChange(index) }
            className={ cn(
              'relative flex-shrink-0 overflow-hidden rounded-lg',
              'transition-all border',
              currentIndex === index
                ? 'border-systemOrange shadow-lg shadow-systemOrange/50 scale-105'
                : 'border-transparent hover:border-border hover:scale-102',
            ) }
            style={ {
              width: 60,
              height: 60,
            } }
            aria-label={ `切换到第 ${index + 1} 张图片` }
          >
            <img
              src={ src }
              alt={ `缩略图 ${index + 1}` }
              className={ cn(
                'w-full h-full object-cover transition-all',
                currentIndex === index
                  ? 'opacity-100'
                  : 'opacity-80 hover:opacity-100',
              ) }
              draggable={ false }
            />
            { currentIndex === index && (
              <div className="absolute inset-0 bg-systemOrange/10 pointer-events-none" />
            ) }
          </button>
        )) }
      </div>
    </div>
  )
})

ImageThumbnails.displayName = 'ImageThumbnails'
