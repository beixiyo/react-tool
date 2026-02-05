'use client'

import type { PreviewImgProps } from './types'
import { useShortCutKey } from 'hooks'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { CloseBtn } from '../CloseBtn'
import { ImgThumbnails } from '../ImgThumbnails'
import { Mask } from '../Mask'
import { ControlButtons } from './ControlButtons'
import { PreviewImage } from './PreviewImage'

/**
 * 图片预览组件
 *
 * 支持单张或多张图片预览，多图时顶部显示轮播图切换
 *
 * @example
 * ```tsx
 * // 单张图片
 * <PreviewImg
 *   src="https://example.com/image.jpg"
 *   onClose={() => setOpen(false)}
 * />
 *
 * // 多张图片
 * <PreviewImg
 *   src={['img1.jpg', 'img2.jpg', 'img3.jpg']}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export const PreviewImg = memo<PreviewImgProps>(({
  style,
  className,
  src,
  onClose,
  initialIndex = 0,
  orientation = 'vertical',
  showThumbnails = true,
  maskClosable = true,
}) => {
  /** 统一处理为数组格式 */
  const images = useMemo(() => {
    return Array.isArray(src)
      ? src
      : [src]
  }, [src])

  /** 当前显示的图片索引 */
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  /** 当前显示的图片URL */
  const currentSrc = images[currentIndex] || images[0] || ''

  /** 图片操作状态 */
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  /** 当图片切换时，重置操作状态 */
  useEffect(() => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  /** 重置状态 */
  const handleReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [])

  /** 处理旋转 */
  const handleRotate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
  }, [rotation])

  /** 处理图片切换 */
  const handleImageChange = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  /** 切换到上一张图片 */
  const handlePrevImage = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
    }
  }, [images.length])

  /** 切换到下一张图片 */
  const handleNextImage = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }
  }, [images.length])

  /** 键盘事件处理 */
  // Escape 键关闭预览
  useShortCutKey({
    key: 'Escape',
    fn: () => onClose(),
  })

  /** 左箭头键切换到上一张 */
  useShortCutKey({
    key: 'ArrowLeft',
    fn: (e) => {
      e.preventDefault()
      handlePrevImage()
    },
  })

  /** 右箭头键切换到下一张 */
  useShortCutKey({
    key: 'ArrowRight',
    fn: (e) => {
      e.preventDefault()
      handleNextImage()
    },
  })

  /** 上箭头键切换到上一张 */
  useShortCutKey({
    key: 'ArrowUp',
    fn: (e) => {
      e.preventDefault()
      handlePrevImage()
    },
  })

  /** 下箭头键切换到下一张 */
  useShortCutKey({
    key: 'ArrowDown',
    fn: (e) => {
      e.preventDefault()
      handleNextImage()
    },
  })

  /** 阻止事件冒泡 */
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  const handleMaskClick = useCallback((e: React.MouseEvent) => {
    if (!maskClosable) {
      stopPropagation(e)
      return
    }
    if (e.target === e.currentTarget)
      onClose()
  }, [maskClosable, onClose, stopPropagation])

  /** 阻止 body 滚动 */
  useEffect(() => {
    const lastOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = lastOverflow
    }
  }, [])

  const content = (
    <Mask
      style={ style }
      className={ cn(
        'fixed z-50',
        className,
      ) }
      onClick={ handleMaskClick }
      onMouseDown={ stopPropagation }
      onMouseMove={ stopPropagation }
      onMouseUp={ stopPropagation }
      onMouseLeave={ stopPropagation }
      onMouseEnter={ stopPropagation }
      onMouseOver={ stopPropagation }
      onMouseOut={ stopPropagation }
    >
      {/* 主预览图 */ }
      <PreviewImage
        src={ currentSrc }
        isDragging={ isDragging }
        scale={ scale }
        rotation={ rotation }
        position={ position }
        onScaleChange={ setScale }
        onPositionChange={ setPosition }
        onDraggingChange={ setIsDragging }
        topOffset={ 0 }
      />

      {/* 底部缩略图（多图时显示） */ }
      { showThumbnails && images.length > 1 && (
        <ImgThumbnails
          images={ images }
          currentIndex={ currentIndex }
          onImageChange={ handleImageChange }
          orientation={ orientation }
          className={ cn(
            'fixed z-[60] pointer-events-auto',
            orientation === 'vertical'
              ? 'right-4 top-1/2 -translate-y-1/2'
              : 'bottom-10 left-1/2 -translate-x-1/2',
          ) }
        />
      ) }

      {/* 控制按钮组 */ }
      <ControlButtons
        onRotate={ handleRotate }
        onReset={ handleReset }
      />

      {/* 关闭按钮 */ }
      <CloseBtn
        onClick={ onClose }
        mode="fixed"
        size="xl"
        variant="filled"
      />
    </Mask>
  )

  /** 使用 Portal 渲染到 body，避免 fixed 定位失效 */
  return createPortal(content, document.body)
})

PreviewImg.displayName = 'PreviewImg'

/** 导出类型 */
export type { PreviewImgProps } from './types'
