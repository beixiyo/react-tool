'use client'

import { debounce } from '@jl-org/tool'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface PreviewImageProps {
  /**
   * 图片URL
   */
  src: string
  /**
   * 是否正在拖动
   */
  isDragging: boolean
  /**
   * 缩放值
   */
  scale: number
  /**
   * 旋转角度
   */
  rotation: number
  /**
   * 位置偏移
   */
  position: { x: number, y: number }
  /**
   * 缩放值变化回调
   */
  onScaleChange: (scale: number) => void
  /**
   * 位置变化回调
   */
  onPositionChange: (position: { x: number, y: number }) => void
  /**
   * 拖动状态变化回调
   */
  onDraggingChange: (isDragging: boolean) => void
  /**
   * 顶部预留高度（用于多图轮播时避免遮挡）
   */
  topOffset?: number
}

/**
 * 预览图片组件
 * 处理图片的缩放、旋转、拖动等交互
 */
export const PreviewImage = memo<PreviewImageProps>(({
  src,
  isDragging,
  scale,
  rotation,
  position,
  onScaleChange,
  onPositionChange,
  onDraggingChange,
  topOffset = 0,
}) => {
  const containerRef = useRef<HTMLImageElement>(null)

  /** 用于动画的值 */
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  const userScale = useMotionValue(1) // 用户操作的缩放值
  const initialScale = useMotionValue(0) // 初始动画的缩放值（从0到1）

  /** 图片是否已加载完成（用于控制初始动画） */
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  /** 使用 ref 来跟踪 isImageLoaded 状态，用于 useTransform */
  const isImageLoadedRef = useRef(false)
  useEffect(() => {
    isImageLoadedRef.current = isImageLoaded
  }, [isImageLoaded])

  /** 使用 ref 来跟踪是否正在用户交互（拖动或滚轮缩放） */
  const isUserInteractingRef = useRef(false)

  /** 使用 state 来跟踪交互状态，确保样式更新 */
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  /** 重置交互标志的 debounced 函数 */
  const resetInteractionFlag = useCallback(
    debounce(() => {
      isUserInteractingRef.current = false
      setIsUserInteracting(false)
    }, 150),
    [],
  )

  /** 根据交互状态计算样式 */
  const imgStyle = useMemo<React.CSSProperties>(() => {
    return {
      transition: isUserInteracting
        ? 'none'
        : '.2s transform',
    }
  }, [isUserInteracting])

  /** 组合初始动画和用户操作的 scale */
  const finalScale = useTransform(
    [initialScale, userScale],
    ([init, user]) => {
      /** 如果图片还没加载完成，使用初始动画的 scale */
      if (!isImageLoadedRef.current) {
        return init
      }
      /** 图片加载完成后，使用用户操作的 scale */
      return user
    },
  )

  /** 同步 motion values */
  useEffect(() => {
    x.set(position.x)
    y.set(position.y)
    rotate.set(rotation)
    userScale.set(scale)
  }, [position.x, position.y, rotation, scale, x, y, rotate, userScale])

  /** 处理滚轮缩放 */
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isUserInteractingRef.current = true
    setIsUserInteracting(true)

    const delta = e.deltaY > 0
      ? -0.1
      : 0.1
    const newScale = Math.max(0.1, Math.min(5, scale + delta))
    onScaleChange(newScale)
    userScale.set(newScale)

    /** 使用 debounce 延迟重置交互标志，确保滚轮连续操作时不会恢复动画 */
    resetInteractionFlag()
  }, [scale, userScale, onScaleChange, resetInteractionFlag])

  /** 处理拖动 */
  const handleDragStart = useCallback(() => {
    isUserInteractingRef.current = true
    setIsUserInteracting(true)
    onDraggingChange(true)
  }, [onDraggingChange])

  const handleDragEnd = useCallback(() => {
    onDraggingChange(false)
    /** 拖动结束后立即重置交互标志，因为拖动已经完成 */
    isUserInteractingRef.current = false
    setIsUserInteracting(false)
  }, [onDraggingChange])

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging)
      return

    const newPosition = {
      x: position.x + e.movementX,
      y: position.y + e.movementY,
    }
    onPositionChange(newPosition)
    x.set(newPosition.x)
    y.set(newPosition.y)
  }, [isDragging, position, x, y, onPositionChange])

  /** 添加事件监听 */
  useEffect(() => {
    const container = containerRef.current
    if (!container)
      return

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleDragStart)
    container.addEventListener('mousemove', handleDrag)
    container.addEventListener('mouseup', handleDragEnd)
    container.addEventListener('mouseleave', handleDragEnd)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mousedown', handleDragStart)
      container.removeEventListener('mousemove', handleDrag)
      container.removeEventListener('mouseup', handleDragEnd)
      container.removeEventListener('mouseleave', handleDragEnd)
    }
  }, [handleWheel, handleDragStart, handleDrag, handleDragEnd])

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  /** 图片加载完成处理 */
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true)
  }, [])

  /** 当 src 改变时，重置加载状态并触发初始动画 */
  useEffect(() => {
    setIsImageLoaded(false)
    initialScale.set(0)
    /** 使用 animate 函数触发从 0 到 1 的缩放动画 */
    animate(initialScale, 1, {
      duration: 0.3,
      ease: 'easeOut',
    })
  }, [src, initialScale])

  return (
    <motion.img
      ref={ containerRef }
      key={ src }
      initial={ { opacity: 0 } }
      animate={ { opacity: 1 } }
      exit={ { opacity: 0, scale: 0 } }
      transition={ { duration: 0.3 } }
      onClick={ stopPropagation }
      onLoad={ handleImageLoad }
      style={ {
        x,
        y,
        rotate,
        scale: finalScale, // 使用组合后的 scale（初始动画 + 用户操作）
        marginTop: topOffset,
        cursor: isDragging
          ? 'grabbing'
          : 'grab',
        ...imgStyle,
      } }
      src={ src }
      draggable={ false }
      alt="Preview"
      className="relative max-h-[90vh] max-w-[calc(100vw-120px)] object-contain"
    />
  )
})

PreviewImage.displayName = 'PreviewImage'
