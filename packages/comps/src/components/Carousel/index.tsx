'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from 'utils'

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

/**
 * 轮播图组件引用对象类型
 * 通过 ref 可以程序化控制轮播图的切换
 */
export interface CarouselRef {
  /**
   * 跳转到指定索引
   * @param index - 目标图片的索引（从 0 开始）
   */
  goToIndex: (index: number) => void
  /**
   * 切换到下一张图片
   */
  next: () => void
  /**
   * 切换到上一张图片
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
  // 当前显示的图片索引
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  // 切换方向：1 表示向右（下一张），-1 表示向左（上一张），0 表示无方向
  const [direction, setDirection] = useState(0)
  // 是否暂停自动播放（鼠标悬停时）
  const [isPaused, setIsPaused] = useState(false)

  /**
   * 滑动动画变体
   * 图片从左右两侧滑入，当前图片滑出
   */
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

  /**
   * 淡入淡出动画变体
   * 图片通过透明度变化实现切换效果
   */
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

  /**
   * 缩放动画变体
   * 图片通过缩放和透明度变化实现切换效果
   */
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

  /**
   * 根据过渡类型选择对应的动画变体
   * @returns 对应的动画变体配置
   */
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

  /**
   * 滑动配置
   * swipeConfidenceThreshold: 滑动置信度阈值，超过此值才触发切换
   * swipePower: 计算滑动力度（偏移量 × 速度）
   */
  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  /**
   * 设置当前索引并触发回调函数
   * @param index - 新的图片索引
   */
  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index)
    onSlideChange?.(index)
  }, [onSlideChange])

  /**
   * 翻页逻辑
   * 根据方向计算下一个索引，支持循环播放（到达末尾后回到开头）
   * @param newDirection - 切换方向：1 表示下一张，-1 表示上一张
   */
  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    // 计算新索引：向右切换时索引+1，向左切换时索引-1，支持循环
    const newIndex = newDirection === 1
      ? (currentIndex === imgs.length - 1
          ? 0
          : currentIndex + 1)
      : (currentIndex === 0
          ? imgs.length - 1
          : currentIndex - 1)

    handleIndexChange(newIndex)
  }, [currentIndex, imgs.length, handleIndexChange])

  /**
   * 获取预览图列表
   * 返回当前图片之后的几张图片作为预览（支持循环）
   * @returns 预览图数组，包含索引和图片地址
   */
  const getPreviewImages = useCallback(() => {
    if (!showPreview || imgs.length <= 1)
      return []

    const previews = []
    // 从当前索引的下一个开始，循环获取指定数量的预览图
    for (let i = 1; i <= previewCount; i++) {
      const index = (currentIndex + i) % imgs.length
      previews.push({ index, src: imgs[index] })
    }
    return previews
  }, [currentIndex, imgs, previewCount, showPreview])

  /**
   * 键盘导航功能
   * 监听键盘事件，使用方向键控制轮播图切换
   * - 左方向键：上一张
   * - 右方向键：下一张
   */
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

  /**
   * 自动播放功能
   * 根据设置的间隔时间自动切换到下一张图片
   * 当暂停或间隔时间为0时，不启动自动播放
   */
  useEffect(() => {
    if (autoPlayInterval <= 0 || isPaused || imgs.length <= 1)
      return

    const timer = setInterval(() => {
      paginate(1)
    }, autoPlayInterval)

    return () => clearInterval(timer)
  }, [autoPlayInterval, isPaused, paginate, imgs.length])

  /**
   * 直接跳转到指定索引
   * 根据目标索引与当前索引的关系设置切换方向
   * @param index - 目标图片索引
   */
  const goToIndex = useCallback((index: number) => {
    // 验证索引有效性，如果无效或与当前索引相同则直接返回
    if (index < 0 || index >= imgs.length || index === currentIndex)
      return

    // 根据目标索引与当前索引的关系设置方向
    setDirection(index > currentIndex
      ? 1
      : -1)
    handleIndexChange(index)
  }, [currentIndex, handleIndexChange, imgs.length])

  /**
   * 暴露组件方法给父组件
   * 通过 ref 可以调用这些方法控制轮播图
   */
  useImperativeHandle(ref, () => ({
    goToIndex,
    next: () => paginate(1),
    prev: () => paginate(-1),
  }), [goToIndex, paginate])

  /**
   * 构建容器样式
   * 根据配置决定使用宽高比还是固定高度
   */
  const containerStyle: React.CSSProperties = {
    ...style,
  }

  /**
   * 处理高度和宽高比
   * 优先级：宽高比 > 固定高度 > 自动高度
   */
  if (aspectRatio) {
    /**
     * 使用宽高比模式
     * 通过 padding-bottom 技巧实现响应式宽高比（padding 百分比基于宽度计算）
     * 内容区域将根据容器宽度自动调整高度
     */
    containerStyle.position = 'relative'
    containerStyle.width = '100%'
    containerStyle.paddingBottom = `${(1 / aspectRatio) * 100}%`
    containerStyle.height = 0
    containerStyle.overflow = 'hidden'
  }
  else if (!enableAutoHeight) {
    /**
     * 使用固定高度模式
     * 直接设置容器高度为指定像素值
     */
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
        {/*
          AnimatePresence 用于管理组件的进入和退出动画
          initial={false} 表示首次渲染时不播放进入动画
          custom={direction} 传递方向参数给动画变体
        */}
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
            // 启用水平拖拽（仅在 enableSwipe 为 true 时）
            drag={ enableSwipe
              ? 'x'
              : false }
            // 限制拖拽范围（不允许超出边界）
            dragConstraints={ { left: 0, right: 0 } }
            // 拖拽弹性系数（1 表示完全弹性）
            dragElastic={ 1 }
            // 拖拽结束时的处理逻辑
            onDragEnd={ (_e, { offset, velocity }) => {
              if (!enableSwipe)
                return

              // 计算滑动力度，只有超过阈值才触发切换
              const swipe = swipePower(offset.x, velocity.x)
              // 向左滑动（负值）且力度足够大，切换到下一张
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              }
              // 向右滑动（正值）且力度足够大，切换到上一张
              else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            } }
            className="absolute inset-0"
          >
            {/* 当前显示的图片 */}
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
            {/* 自定义内容覆盖层（可选） */}
            { children && (
              <div className="absolute inset-0">
                { children }
              </div>
            ) }
          </motion.div>
        </AnimatePresence>

        {/* 导航箭头：左右切换按钮 */}
        { showArrows && imgs.length > 1 && (
          <>
            {/* 左侧箭头：切换到上一张 */}
            <button
              onClick={ () => paginate(-1) }
              className="absolute left-4 top-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xs transition-all -translate-y-1/2 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            {/* 右侧箭头：切换到下一张 */}
            <button
              onClick={ () => paginate(1) }
              className="absolute right-4 top-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xs transition-all -translate-y-1/2 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) }

        {/* 导航指示器：显示当前位置和总数量，可点击跳转 */}
        { showDots && imgs.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex gap-2 -translate-x-1/2">
            { imgs.map((_, index) => (
              <button
                key={ index }
                onClick={ () => {
                  // 根据目标索引与当前索引的关系设置切换方向
                  setDirection(index > currentIndex
                    ? 1
                    : -1)
                  handleIndexChange(index)
                } }
                className={ cn(
                  // 根据指示器类型应用不同的样式
                  indicatorType === 'dot'
                    ? 'h-2 w-2 rounded-full transition-all duration-300 hover:scale-125'
                    : 'h-1 w-8 rounded-xs transition-all',
                  // 当前激活的指示器使用高亮样式
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

      {/* 预览图区域：显示后续几张图片的缩略图 */}
      { showPreview && imgs.length > 1 && (
        <div
          className={ cn(
            'flex gap-4 overflow-hidden',
            // 根据预览图位置应用不同的布局样式
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
              // 预览图进入动画：淡入 + 缩放
              initial={ { opacity: 0, scale: 0.9 } }
              animate={ { opacity: 1, scale: 1 } }
              // 延迟动画，创建依次出现的效果
              transition={ { delay: index * 0.1 } }
              className="group relative cursor-pointer"
              onClick={ () => {
                // 点击预览图时切换到对应的图片
                setDirection(1)
                handleIndexChange(preview.index)
              } }
            >
              {/* 预览图容器，悬停时有缩放效果 */}
              <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105">
                <img
                  src={ preview.src }
                  alt={ `Preview ${preview.index + 1}` }
                  className="h-full w-full"
                  style={ {
                    objectFit,
                    // 根据预览图位置设置不同的尺寸
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
 * 轮播图组件属性类型定义
 */
export type CarouselProps = {
  /**
   * 图片数组
   * 传入图片 URL 数组，组件会自动渲染轮播图
   */
  imgs?: string[]
  /**
   * 图片高度（像素）
   * 仅在未设置 aspectRatio 且 enableAutoHeight 为 false 时生效
   * @default 400
   */
  imgHeight?: number
  /**
   * 自动播放间隔（毫秒）
   * 设置为 0 或负数可禁用自动播放
   * @default 5000
   */
  autoPlayInterval?: number
  /**
   * 初始显示的图片索引（从 0 开始）
   * @default 0
   */
  initialIndex?: number
  /**
   * 是否显示左右导航箭头
   * @default true
   */
  showArrows?: boolean
  /**
   * 是否显示底部导航指示器（小圆点或线条）
   * @default true
   */
  showDots?: boolean
  /**
   * 是否显示预览图
   * 预览图会显示当前图片之后的几张图片缩略图
   * @default false
   */
  showPreview?: boolean
  /**
   * 预览图数量
   * 仅在 showPreview 为 true 时生效
   * @default 3
   */
  previewCount?: number
  /**
   * 预览图位置
   * - 'right': 显示在右侧（垂直排列）
   * - 'bottom': 显示在底部（水平排列）
   * @default 'right'
   */
  previewPosition?: 'right' | 'bottom'
  /**
   * 过渡动画类型
   * - 'slide': 滑动切换（默认）
   * - 'fade': 淡入淡出
   * - 'zoom': 缩放切换
   * @default 'slide'
   */
  transitionType?: 'slide' | 'fade' | 'zoom'
  /**
   * 动画持续时间（秒）
   * 控制切换动画的播放时长
   * @default 0.5
   */
  animationDuration?: number
  /**
   * 指示器类型
   * - 'dot': 圆点样式
   * - 'line': 线条样式
   * @default 'dot'
   */
  indicatorType?: 'dot' | 'line'
  /**
   * 是否启用滑动切换
   * 启用后可以通过触摸或鼠标拖拽切换图片
   * @default true
   */
  enableSwipe?: boolean
  /**
   * 是否启用键盘导航
   * 启用后可以使用方向键（← →）切换图片
   * @default true
   */
  enableKeyboardNav?: boolean
  /**
   * 是否自动调整高度
   * 启用后容器高度会根据内容自动调整
   * @default false
   */
  enableAutoHeight?: boolean
  /**
   * 鼠标悬停时是否暂停自动播放
   * 提升用户体验，悬停查看时不会自动切换
   * @default true
   */
  pauseOnHover?: boolean
  /**
   * 图片适配方式
   * - 'cover': 覆盖整个容器，可能裁剪图片
   * - 'contain': 完整显示图片，可能留白
   * - 'fill': 拉伸填充容器，可能变形
   * @default 'cover'
   */
  objectFit?: 'cover' | 'contain' | 'fill'
  /**
   * 图片宽高比（宽度/高度）
   * 设置后将自动维持该比例，容器高度会根据宽度自动计算
   * 例如：16:9 的比例为 16/9 ≈ 1.78，4:3 的比例为 4/3 ≈ 1.33
   * 优先级高于 imgHeight
   */
  aspectRatio?: number
  /**
   * 轮播图切换回调函数
   * 当图片切换时会触发此回调，参数为新图片的索引
   * @param index - 新图片的索引（从 0 开始）
   */
  onSlideChange?: (index: number) => void
  /**
   * 自定义内容
   * 可以传入 React 节点作为覆盖层，显示在图片上方
   * 常用于添加文字说明、按钮等交互元素
   */
  children?: React.ReactNode
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
