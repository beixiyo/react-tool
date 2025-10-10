'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from 'utils'

/**
 * 轮播图组件引用对象类型
 */
export interface CarouselRef {
  /**
   * 跳转到指定索引
   */
  goToIndex: (index: number) => void
  /**
   * 下一张图片
   */
  next: () => void
  /**
   * 上一张图片
   */
  prev: () => void
}

export const Carousel = memo(forwardRef<CarouselRef, CarouselProps>((
  {
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
  },
  ref,
) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  /** 动画变体 */
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0
        ? '100%'
        : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0
        ? '100%'
        : '-100%',
      opacity: 0,
    }),
  }

  const fadeVariants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  }

  const zoomVariants = {
    enter: {
      opacity: 0,
      scale: 0.8,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.2,
    },
  }

  /** 选择动画变体 */
  const getVariants = () => {
    switch (transitionType) {
      case 'fade':
        return fadeVariants
      case 'zoom':
        return zoomVariants
      case 'slide':
      default:
        return slideVariants
    }
  }

  /** 滑动配置 */
  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  /** 设置当前索引并触发回调 */
  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index)
    onSlideChange?.(index)
  }, [onSlideChange])

  /** 翻页逻辑 */
  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    const newIndex = newDirection === 1
      ? (currentIndex === imgs.length - 1
          ? 0
          : currentIndex + 1)
      : (currentIndex === 0
          ? imgs.length - 1
          : currentIndex - 1)

    handleIndexChange(newIndex)
  }, [currentIndex, imgs.length, handleIndexChange])

  /** 获取预览图 */
  const getPreviewImages = useCallback(() => {
    if (!showPreview || imgs.length <= 1)
      return []

    const previews = []
    for (let i = 1; i <= previewCount; i++) {
      const index = (currentIndex + i) % imgs.length
      previews.push({ index, src: imgs[index] })
    }
    return previews
  }, [currentIndex, imgs, previewCount, showPreview])

  /** 键盘导航 */
  useEffect(() => {
    if (!enableKeyboardNav)
      return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1)
      }
      else if (e.key === 'ArrowRight') {
        paginate(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enableKeyboardNav, paginate])

  /** 自动播放 */
  useEffect(() => {
    if (autoPlayInterval <= 0 || isPaused || imgs.length <= 1)
      return

    const timer = setInterval(() => {
      paginate(1)
    }, autoPlayInterval)

    return () => clearInterval(timer)
  }, [autoPlayInterval, isPaused, paginate, imgs.length])

  /** 计算轮播图高度 */
  const carouselHeight = enableAutoHeight
    ? 'auto'
    : `${imgHeight}px`

  /** 直接跳转到指定索引 */
  const goToIndex = useCallback((index: number) => {
    if (index < 0 || index >= imgs.length || index === currentIndex)
      return

    setDirection(index > currentIndex
      ? 1
      : -1)
    handleIndexChange(index)
  }, [currentIndex, handleIndexChange, imgs.length])

  /** 暴露组件方法 */
  useImperativeHandle(ref, () => ({
    goToIndex,
    next: () => paginate(1),
    prev: () => paginate(-1),
  }), [goToIndex, paginate])

  /** 构建容器样式 */
  const containerStyle: React.CSSProperties = {
    ...style,
  }

  /** 处理高度和宽高比 */
  if (aspectRatio) {
    /** 使用宽高比，内容区域将根据容器宽度自动调整高度 */
    containerStyle.position = 'relative'
    containerStyle.width = '100%'
    containerStyle.paddingBottom = `${(1 / aspectRatio) * 100}%`
    containerStyle.height = 0
    containerStyle.overflow = 'hidden'
  }
  else if (!enableAutoHeight) {
    /** 使用固定高度 */
    containerStyle.height = `${imgHeight}px`
  }

  return (
    <div
      className={ cn(
        'carousel-container relative overflow-hidden',
        className,
      ) }
      style={ containerStyle }
      onMouseEnter={ pauseOnHover
        ? () => setIsPaused(true)
        : undefined }
      onMouseLeave={ pauseOnHover
        ? () => setIsPaused(false)
        : undefined }
    >
      {/* 主轮播图区域 */ }
      <div className={ cn(
        'relative w-full',
        aspectRatio
          ? 'absolute inset-0'
          : 'h-full',
      ) }>
        <AnimatePresence initial={ false } custom={ direction }>
          <motion.div
            key={ currentIndex }
            custom={ direction }
            variants={ getVariants() }
            initial="enter"
            animate="center"
            exit="exit"
            transition={ {
              opacity: { duration: animationDuration },
              scale: { duration: animationDuration },
            } }
            drag={ enableSwipe
              ? 'x'
              : false }
            dragConstraints={ { left: 0, right: 0 } }
            dragElastic={ 1 }
            onDragEnd={ (e, { offset, velocity }) => {
              if (!enableSwipe)
                return

              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              }
              else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            } }
            className="absolute inset-0"
          >
            { imgs[currentIndex] && (
              <img
                src={ imgs[currentIndex] }
                alt={ `Slide ${currentIndex + 1}` }
                className="h-full w-full"
                style={ { objectFit } }
                draggable={ false }
                onError={ (e) => {
                  /** 图片加载失败时设置为占位图 */
                  const target = e.target as HTMLImageElement
                  target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Found'
                } }
              />
            ) }
            { children && (
              <div className="absolute inset-0">
                { children }
              </div>
            ) }
          </motion.div>
        </AnimatePresence>

        {/* 导航箭头 */ }
        { showArrows && imgs.length > 1 && (
          <>
            <button
              onClick={ () => paginate(-1) }
              className="absolute left-4 top-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xs transition-all -translate-y-1/2 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={ () => paginate(1) }
              className="absolute right-4 top-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xs transition-all -translate-y-1/2 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) }

        {/* 导航指示器 */ }
        { showDots && imgs.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex gap-2 -translate-x-1/2">
            { imgs.map((_, index) => (
              <button
                key={ index }
                onClick={ () => {
                  setDirection(index > currentIndex
                    ? 1
                    : -1)
                  handleIndexChange(index)
                } }
                className={ cn(
                  indicatorType === 'dot'
                    ? 'h-2 w-2 rounded-full transition-all duration-300 hover:scale-125'
                    : 'h-1 w-8 rounded-xs transition-all',
                  index === currentIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/70',
                ) }
                aria-label={ `Go to slide ${index + 1}` }
              />
            )) }
          </div>
        ) }
      </div>

      {/* 预览图区域 */ }
      { showPreview && imgs.length > 1 && (
        <div
          className={ cn(
            'flex gap-4 overflow-hidden',
            previewPosition === 'right'
              ? 'absolute right-4 top-1/2 -translate-y-1/2 flex-col'
              : previewPosition === 'bottom'
                ? 'mt-4 flex-row justify-center'
                : '',
          ) }
        >
          { getPreviewImages().map((preview, index) => (
            <motion.div
              key={ `${preview.index}-${currentIndex}` }
              initial={ { opacity: 0, scale: 0.9 } }
              animate={ { opacity: 1, scale: 1 } }
              transition={ { delay: index * 0.1 } }
              className="group relative cursor-pointer"
              onClick={ () => {
                setDirection(1)
                handleIndexChange(preview.index)
              } }
            >
              <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105">
                <img
                  src={ preview.src }
                  alt={ `Preview ${preview.index + 1}` }
                  className="h-full w-full"
                  style={ {
                    objectFit,
                    height: previewPosition === 'right'
                      ? '100px'
                      : '80px',
                    width: previewPosition === 'right'
                      ? '80px'
                      : '100px',
                  } }
                  onError={ (e) => {
                    /** 图片加载失败时设置为占位图 */
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/100x100?text=Preview'
                  } }
                />
              </div>
            </motion.div>
          )) }
        </div>
      ) }
    </div>
  )
}))

Carousel.displayName = 'Carousel'

/**
 * 轮播图组件属性
 */
export type CarouselProps = {
  /**
   * 图片数组
   */
  imgs?: string[]
  /**
   * 图片高度
   * @default 400
   */
  imgHeight?: number
  /**
   * 自动播放间隔（毫秒），设为0禁用自动播放
   * @default 5000
   */
  autoPlayInterval?: number
  /**
   * 初始图片索引
   * @default 0
   */
  initialIndex?: number
  /**
   * 是否显示导航箭头
   * @default true
   */
  showArrows?: boolean
  /**
   * 是否显示导航指示器
   * @default true
   */
  showDots?: boolean
  /**
   * 是否显示预览图
   * @default false
   */
  showPreview?: boolean
  /**
   * 预览图数量
   * @default 3
   */
  previewCount?: number
  /**
   * 预览图位置
   * @default 'right'
   */
  previewPosition?: 'right' | 'bottom'
  /**
   * 过渡动画类型
   * @default 'slide'
   */
  transitionType?: 'slide' | 'fade' | 'zoom'
  /**
   * 动画持续时间（秒）
   * @default 0.5
   */
  animationDuration?: number
  /**
   * 指示器类型
   * @default 'dot'
   */
  indicatorType?: 'dot' | 'line'
  /**
   * 是否启用滑动切换
   * @default true
   */
  enableSwipe?: boolean
  /**
   * 是否启用键盘导航
   * @default true
   */
  enableKeyboardNav?: boolean
  /**
   * 是否自动调整高度
   * @default false
   */
  enableAutoHeight?: boolean
  /**
   * 鼠标悬停时是否暂停自动播放
   * @default true
   */
  pauseOnHover?: boolean
  /**
   * 图片适配方式
   * @default 'cover'
   */
  objectFit?: 'cover' | 'contain' | 'fill'
  /**
   * 图片宽高比（宽度/高度），设置后将自动维持该比例
   * 例如16:9的比例为1.78
   */
  aspectRatio?: number
  /**
   * 轮播图切换回调函数
   */
  onSlideChange?: (index: number) => void
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
