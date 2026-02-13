'use client'

import type { CarouselRef } from '../Carousel'
import { debounce } from '@jl-org/tool'
import { ChevronLeft, Heart, MessageCircle, Share2, Star } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Carousel } from '../Carousel'
import { PhoneFrame } from '../PhoneFrame'

export const PhoneCarousel = memo<PhoneCarouselProps>(({
  imgHeight = 400,
  showPreview = true,
  previewCount = 3,
  imgs = [],
  autoPlayInterval = 5000,
  initialIndex = 0,
  title = '牛仔布手缝杯垫绣纹样分享',
  description = '#不完美美手工重参与所 #杯垫 #布艺手工 #DIY手工刺绣 #蓝染杯垫 #刺绣子蜂 #刺绣动物教程 #绣花布艺 #手工刺绣的乐趣 #刺绣绣制 ai创意',
  showShareButton = true,
  showFollowButton = true,
  followButtonText = '关注',
  initialLikeCount = 724,
  initialFavoriteCount = 843,
  initialCommentCount = 20,
  commentPlaceholder = '说点什么...',
  scale = 1,
}) => {
  /** 基础状态 */
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount)
  const [commentCount] = useState(initialCommentCount)

  /** 预览图位置相关状态 */
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0, opacity: 0 })
  const phoneCarouselRef = useRef<HTMLDivElement>(null)

  /** Carousel组件引用 */
  const carouselRef = useRef<CarouselRef>(null)

  /** 存储当前显示的预览图数据 */
  const [previewImages, setPreviewImages] = useState<Array<{ src: string, index: number }>>([])

  /** 更新预览图数据 */
  const updatePreviewImages = useCallback(() => {
    if (!showPreview || imgs.length <= 1)
      return

    const newPreviews = []
    /** 从当前索引开始，获取后续的预览图 */
    for (let i = 1; i <= previewCount; i++) {
      const index = (currentIndex + i) % imgs.length
      newPreviews.push({ index, src: imgs[index] })
    }
    setPreviewImages(newPreviews)
  }, [currentIndex, imgs, previewCount, showPreview])

  /** 当currentIndex变化时更新预览图 */
  useEffect(() => {
    updatePreviewImages()
  }, [currentIndex, updatePreviewImages])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => (isLiked
      ? prev - 1
      : prev + 1))
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    setFavoriteCount(prev => (isFavorited
      ? prev - 1
      : prev + 1))
  }

  /** 计算预览图位置的函数 */
  const calculateCarouselPosition = useCallback(() => {
    if (phoneCarouselRef.current) {
      const rect = phoneCarouselRef.current.getBoundingClientRect()

      setPreviewPosition({
        top: rect.top,
        left: rect.right + 20,
        opacity: rect.width > 0 && rect.height > 0
          ? 1
          : 0,
      })
    }
  }, [])

  /** 计算预览图位置的监听器 */
  useEffect(() => {
    /** 创建防抖版本的计算函数 */
    const debouncedCalculatePosition = debounce(calculateCarouselPosition, 100)

    /** 初始计算和添加事件监听 */
    calculateCarouselPosition()
    window.addEventListener('resize', debouncedCalculatePosition)
    window.addEventListener('load', calculateCarouselPosition)
    document.addEventListener('scroll', debouncedCalculatePosition, true)

    /** 创建一个计时器数组，在不同时间点计算以确保DOM完全加载 */
    const timers = [
      setTimeout(calculateCarouselPosition, 100),
      setTimeout(calculateCarouselPosition, 300),
      setTimeout(calculateCarouselPosition, 500),
      setTimeout(calculateCarouselPosition, 1000),
    ]

    /** 清理函数 */
    return () => {
      window.removeEventListener('resize', debouncedCalculatePosition)
      window.removeEventListener('load', calculateCarouselPosition)
      document.removeEventListener('scroll', debouncedCalculatePosition, true)
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [calculateCarouselPosition])

  /** 监听scale变化，重新计算预览图位置 */
  useEffect(() => {
    calculateCarouselPosition()

    /** 由于DOM可能需要时间更新，设置延迟重新计算 */
    const timers = [
      setTimeout(calculateCarouselPosition, 100),
      setTimeout(calculateCarouselPosition, 300),
    ]

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [scale, calculateCarouselPosition])

  /** 处理Carousel索引变化 */
  const handleSlideChange = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  /** 计算缩放后的图片高度 */
  const scaledImgHeight = imgHeight * scale

  /** 创建应用内容 */
  const appContent = (
    <>
      {/* App Header */ }
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="items-center justify-center rounded-full p-1 transition-colors hover:bg-background2">
            <ChevronLeft className="h-[calc(1.25rem*var(--scale-factor,1))] w-[calc(1.25rem*var(--scale-factor,1))] text-text" style={ { '--scale-factor': scale } as React.CSSProperties } />
          </button>
          <div className="h-[calc(2rem*var(--scale-factor,1))] w-[calc(2rem*var(--scale-factor,1))] cursor-pointer rounded-full from-orange-400 to-pink-400 bg-gradient-to-br transition-transform hover:scale-105" style={ { '--scale-factor': scale } as React.CSSProperties }></div>
          <span className="text-[calc(0.875rem*var(--scale-factor,1))] text-text font-medium" style={ { '--scale-factor': scale } as React.CSSProperties }>无乐城编织学</span>
        </div>
        <div className="flex items-center gap-2">
          { showFollowButton && (
            <button className="h-[calc(1.75rem*var(--scale-factor,1))] rounded-full bg-danger px-3 py-1 text-[calc(0.75rem*var(--scale-factor,1))] text-white transition-all hover:scale-105 hover:opacity-90" style={ { '--scale-factor': scale } as React.CSSProperties }>
              { followButtonText }
            </button>
          ) }

          { showShareButton && (
            <button className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-background2">
              <Share2 className="h-[calc(1rem*var(--scale-factor,1))] w-[calc(1rem*var(--scale-factor,1))] text-text" style={ { '--scale-factor': scale } as React.CSSProperties } />
            </button>
          ) }
        </div>
      </div>

      {/* Image Carousel */ }
      <div
        ref={ phoneCarouselRef }
        className="relative overflow-hidden bg-background2"
        style={ { height: scaledImgHeight } }
      >
        {/* 使用Carousel组件替代原来的轮播图实现 */ }
        <Carousel
          ref={ carouselRef }
          imgs={ imgs }
          imgHeight={ scaledImgHeight }
          initialIndex={ currentIndex }
          autoPlayInterval={ autoPlayInterval }
          showArrows
          showDots
          enableSwipe
          pauseOnHover
          showPreview={ false }
          className="h-full"
          objectFit="cover"
          /** 当轮播图索引变化时同步状态 */
          onSlideChange={ handleSlideChange }
        />
      </div>

      {/* Content Section */ }
      <div className="p-4 space-y-3">
        <h2 className="text-[calc(1.125rem*var(--scale-factor,1))] text-text font-bold leading-tight" style={ { '--scale-factor': scale } as React.CSSProperties }>{ title }</h2>
        <p className="text-[calc(0.875rem*var(--scale-factor,1))] text-text2 leading-relaxed" style={ { '--scale-factor': scale } as React.CSSProperties }>
          { description }
        </p>

        {/* Interaction Stats */ }
        <div className="flex items-center gap-6 pt-2">
          <div className="flex cursor-pointer items-center gap-1 text-[calc(0.75rem*var(--scale-factor,1))] text-text2 transition-colors hover:text-info" style={ { '--scale-factor': scale } as React.CSSProperties }>
            <MessageCircle className="h-[calc(1rem*var(--scale-factor,1))] w-[calc(1rem*var(--scale-factor,1))]" style={ { '--scale-factor': scale } as React.CSSProperties } />
            <span>{ commentPlaceholder }</span>
          </div>
          <div className="ml-auto flex items-center gap-4 text-[calc(0.75rem*var(--scale-factor,1))]" style={ { '--scale-factor': scale } as React.CSSProperties }>
            <motion.button
              onClick={ handleLike }
              className={ `flex items-center gap-1 transition-all duration-200 hover:scale-110 ${isLiked
                ? 'text-danger'
                : 'text-text2 transition-all duration-200 hover:scale-110 hover:text-danger'
              }` }
              whileTap={ { scale: 0.9 } }
            >
              <motion.div
                animate={ isLiked
                  ? { scale: [1, 1.3, 1] }
                  : {} }
                transition={ { duration: 0.3 } }>
                <Heart
                  className={ `w-[calc(1rem*var(--scale-factor,1))] h-[calc(1rem*var(--scale-factor,1))] ${isLiked
                    ? 'fill-current'
                    : ''}` }
                  style={ { '--scale-factor': scale } as React.CSSProperties } />
              </motion.div>
              { likeCount }
            </motion.button>

            <motion.button
              onClick={ handleFavorite }
              className={ `flex items-center gap-1 transition-all duration-200 hover:scale-110 ${isFavorited
                ? 'text-warning'
                : 'text-text2 transition-all duration-200 hover:scale-110 hover:text-warning'
              }` }
              whileTap={ { scale: 0.9 } }
            >
              <motion.div
                animate={ isFavorited
                  ? { scale: [1, 1.3, 1] }
                  : {} }
                transition={ { duration: 0.3 } }>
                <Star
                  className={ `w-[calc(1rem*var(--scale-factor,1))] h-[calc(1rem*var(--scale-factor,1))] ${isFavorited
                    ? 'fill-current'
                    : ''}` }
                  style={ { '--scale-factor': scale } as React.CSSProperties } />
              </motion.div>
              { favoriteCount }
            </motion.button>
            <button className="flex items-center gap-1 text-text2 transition-all duration-200 hover:scale-110 hover:text-info">
              <MessageCircle className="h-[calc(1rem*var(--scale-factor,1))] w-[calc(1rem*var(--scale-factor,1))]" style={ { '--scale-factor': scale } as React.CSSProperties } />
              { commentCount }
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-8">
        <PhoneFrame scale={ scale }>
          { appContent }
        </PhoneFrame>

        {/* Preview Images */ }
        { showPreview && (
          <div
            className="selet-none absolute flex gap-4 transition-all duration-300"
            style={ {
              top: previewPosition.top,
              left: previewPosition.left,
              height: scaledImgHeight,
              opacity: previewPosition.opacity,
            } }>
            <AnimatePresence mode="popLayout">
              { previewImages.map((preview, index) => (
                <motion.div
                  key={ `preview-${preview.index}-${currentIndex}` }
                  initial={ { opacity: 0, x: 20 } }
                  animate={ { opacity: 1, x: 0 } }
                  exit={ { opacity: 0, x: -20 } }
                  transition={ { delay: index * 0.1 } }
                  className="group relative h-full cursor-pointer"
                  onClick={ () => {
                    /** 使用ref调用Carousel方法 */
                    if (carouselRef.current) {
                      carouselRef.current.goToIndex(preview.index)
                    }
                    else {
                      /** 兜底方案，直接修改状态 */
                      setCurrentIndex(preview.index)
                    }
                  } }
                >
                  <div className="aspect-3/4 h-full overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] dark:shadow-gray-800 hover:shadow-xl">
                    <img
                      src={ preview.src || '/placeholder.svg' }
                      alt={ `Preview ${index + 1}` }
                      className="h-full w-full object-cover"
                    />
                  </div>
                </motion.div>
              )) }
            </AnimatePresence>
          </div>
        ) }
      </div>
    </div>
  )
})

/**
 * 移动端轮播组件属性
 */
export type PhoneCarouselProps = {
  /**
   * 图片高度
   * @default 400
   */
  imgHeight?: number
  /** 是否显示预览图 */
  showPreview?: boolean
  /** 预览图数量 */
  previewCount?: number
  /** 图片数组 */
  imgs: string[]
  /** 自动播放间隔（毫秒），设为0禁用自动播放 */
  autoPlayInterval?: number
  /** 初始图片索引 */
  initialIndex?: number
  /** 标题文本 */
  title?: string
  /** 描述文本 */
  description?: string
  /** 是否显示分享按钮 */
  showShareButton?: boolean
  /** 是否显示关注按钮 */
  showFollowButton?: boolean
  /** 关注按钮文本 */
  followButtonText?: string
  /** 初始点赞数 */
  initialLikeCount?: number
  /** 初始收藏数 */
  initialFavoriteCount?: number
  /** 初始评论数 */
  initialCommentCount?: number
  /** 评论占位文本 */
  commentPlaceholder?: string
  /**
   * 组件整体缩放比例
   * @default 1
   */
  scale?: number
}
