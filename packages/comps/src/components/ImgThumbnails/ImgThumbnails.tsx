'use client'

import type { ImgThumbnailsProps } from './types'
import { memo, useCallback, useEffect, useRef } from 'react'
import { cn } from 'utils'
import { LazyImg } from '../LazyImg'

/**
 * 图片缩略图预览组件
 * 用于多图预览时在底部显示可切换的缩略图列表
 */
export const ImgThumbnails = memo<ImgThumbnailsProps>(({
  images,
  currentIndex,
  onImageChange,
  className,
  containerClassName,
  orientation = 'vertical',
  style,
  hideBorder = false,
  hideHighlight = false,
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
      if (orientation === 'vertical') {
        const containerHeight = scrollContainer.clientHeight
        const thumbnailTop = targetThumbnail.offsetTop
        const thumbnailHeight = targetThumbnail.offsetHeight
        const scrollTop = thumbnailTop - (containerHeight / 2) + (thumbnailHeight / 2)

        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        })
      }
      else {
        const containerWidth = scrollContainer.clientWidth
        const thumbnailLeft = targetThumbnail.offsetLeft
        const thumbnailWidth = targetThumbnail.offsetWidth
        const scrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2)

        scrollContainer.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        })
      }
    }
  }, [orientation])

  const getButtonClassName = (index: number) => {
    const base = 'relative shrink-0 overflow-hidden rounded-lg transition-all'
    const highlightClassName = currentIndex === index
      ? 'border border-systemOrange shadow-lg shadow-systemOrange/50 scale-105'
      : 'border border-transparent hover:border-border hover:scale-102'

    return hideHighlight
      ? base
      : `${base} ${highlightClassName}`
  }

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

  if (images.length === 0) {
    return null
  }

  const isVertical = orientation === 'vertical'

  return (
    <div
      ref={ containerRef }
      className={ cn(className) }
    >
      {/* 缩略图容器 */ }
      <div
        ref={ scrollContainerRef }
        className={ cn(
          'flex gap-2 w-fit',
          'scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent',
          'bg-background2/30 backdrop-blur-xs rounded-xl',
          !hideBorder && 'border border-border p-1',
          isVertical
            ? 'flex-col overflow-y-auto overflow-x-hidden'
            : 'flex-row overflow-x-auto overflow-y-hidden',
          containerClassName,
        ) }
        style={ isVertical
          ? {
              maxHeight: 'calc(95vh - 80px)',
              maxWidth: '80px',
              ...style,
            }
          : {
              maxWidth: '100%',
              maxHeight: '80px',
              ...style,
            } }
      >
        { images.map((src, index) => (
          <button
            key={ `${src}-${index}` }
            onClick={ () => onImageChange(index) }
            className={ cn(getButtonClassName(index)) }
            style={ {
              width: 60,
              height: 60,
            } }
            aria-label={ `切换到第 ${index + 1} 张图片` }
          >
            <LazyImg
              src={ src }
              alt={ `缩略图 ${index + 1}` }
              previewable={ false }
              className="w-full h-full"
              imgClassName={ cn(
                'w-full h-full object-cover hover:opacity-100',
                currentIndex === index
                  ? 'opacity-100'
                  : 'opacity-80',
              ) }
              draggable={ false }
            />
          </button>
        )) }
      </div>
    </div>
  )
})

ImgThumbnails.displayName = 'ImgThumbnails'
