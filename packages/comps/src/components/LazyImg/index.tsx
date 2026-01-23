'use client'

import type { LazyImgProps } from './types'
import { motion } from 'motion/react'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { PreviewImg } from '../PreviewImg'
import { ob, observerMap } from './constants'
import {
  applyLoadAnimation,
  isImageElementComplete,
  isImageLoaded,
  markImageAsLoaded,
  resetImageStyles,
  skipAnimation,
} from './utils'

export const LazyImg = memo<LazyImgProps>((
  {
    style,
    imgStyle,
    className,
    imgClassName,
    children,

    lazy = true,
    src,
    loadingSrc = new URL('@/assets/svg/loadingSvg.svg', import.meta.url).href,
    errorSrc = 'https://tse4-mm.cn.bing.net/th/id/OIP-C.DP6b1UUJQbIaD8dHSskvggHaGX?w=213&h=183&c=7&r=0&o=5&dpr=1.1&pid=1.7',

    errorText = 'The picture was stolen by aliens',
    loadingText = '',
    keepAspect = true,
    previewable = true,
    showThumbnails = true,
    previewImages,
    onClick,

    ...rest
  },
) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  // --- 状态管理 ---
  const [showLoading, setShowLoading] = useState(true) // 初始总是显示 loading
  const [showError, setShowError] = useState(false)
  const [showImg, setShowImg] = useState(false) // 初始不显示实际图片

  // --- 事件处理 ---
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgEl = event.target as HTMLImageElement
    const imageSrc = imgEl.src

    setShowLoading(false)
    setShowError(false)
    setShowImg(true)

    /** 检查图片是否已经加载过（首次加载才播放动画） */
    const isFirstLoad = !isImageLoaded(imageSrc)

    if (isFirstLoad) {
      /** 首次加载：播放 blur 动画 */
      markImageAsLoaded(imageSrc)
      applyLoadAnimation(imgEl)
    }
    else {
      /** 已加载过：直接显示，不播放动画 */
      skipAnimation(imgEl)
    }

    rest.onLoad?.(event)
  }

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // console.error('handleError triggered for:', (event.target as HTMLImageElement).src)
    /**
     * 如果是 lazy 模式，加载失败也需要 unobserve
     */
    if (lazy && imgRef.current) {
      ob.unobserve(imgRef.current)
      observerMap.delete(imgRef.current)
    }
    setShowLoading(false)
    setShowError(true)
    setShowImg(false)
    imgRef.current!.style.display = 'none'

    rest.onError?.(event)
  }

  // --- 副作用 ---
  useEffect(() => {
    const imgElement = imgRef.current
    if (!imgElement)
      return

    // 1. 处理无效 src
    if (!src) {
      setShowError(true)
      setShowLoading(false)
      setShowImg(false)
      return // 无 src，直接显示错误，无需观察或设置 src
    }

    /** 检查图片是否已经在缓存中或浏览器已加载完成 */
    const isImageCached = isImageLoaded(src)
    const isImageComplete = isImageElementComplete(imgElement, src)

    if (isImageCached || isImageComplete) {
      /** 图片已加载过：直接显示，跳过 loading 状态和动画 */
      if (!isImageCached) {
        markImageAsLoaded(src)
      }
      setShowLoading(false)
      setShowError(false)
      setShowImg(true)
      if (imgElement.src !== src) {
        imgElement.src = src
      }
      skipAnimation(imgElement)
      return
    }

    /**
     * 重置状态以应对 src 或 lazy 的变化（仅首次加载）
     */
    setShowLoading(true)
    setShowError(false)
    setShowImg(false)

    /** 清理可能存在的旧样式 */
    resetImageStyles(imgElement)

    // 2. 处理非懒加载情况
    if (!lazy) {
      /** 直接设置 src，让 <img> 的 onLoad/onError 处理 */
      imgElement.src = src
      /**
       * 注意：这里不需要手动调用 handleLoad/handleError，
       * 它们会由 img 元素的事件触发
       */
    }
    // 3. 处理懒加载情况 (启动观察)
    else {
      imgElement.removeAttribute('src')

      observerMap.set(imgElement, { src })
      ob.observe(imgElement)
    }

    // --- 清理函数 ---
    return () => {
      if (imgElement) {
        ob.unobserve(imgElement)
        observerMap.delete(imgElement)
      }
    }
  }, [src, lazy])

  // --- 渲染逻辑 ---
  return (<>
    <motion.div
      className={ cn(
        'lazy-img-container size-full relative overflow-hidden select-none',
        className,
      ) }
      layout={ rest.layout }
      layoutId={ rest.layoutId }
      style={ style }
    >
      {/* 内层容器用于保持宽高比和定位 */ }
      <div
        className={ cn(
          'flex justify-center items-center w-full h-full relative overflow-hidden',
          { 'aspect-padding': keepAspect },
        ) }
        style={ {
          ...(keepAspect && {
            paddingBottom: keepAspect
              ? '100%'
              : undefined,
            height: keepAspect
              ? 0
              : '100%',
          }),
        } }
      >
        {/* Loading Placeholder */ }
        { showLoading && (
          <div className="absolute inset-0 z-5 flex flex-col items-center justify-center">
            <img
              src={ loadingSrc }
              alt="Loading..."
              decoding="async"
              className={ cn(
                'w-10 h-10 opacity-50',
              ) }
              style={ imgStyle }
              { ...rest }
            />
            { loadingText && (
              <span className="mt-1 text-xs text-gray-400">{ loadingText }</span>
            ) }
          </div>
        ) }

        {/* Error Placeholder */ }
        { showError && (
          <div className="absolute inset-0 z-5 flex flex-col items-center justify-center text-center">
            <img
              src={ errorSrc }
              alt="Error"
              decoding="async"
              className={ cn(
                'w-12 h-12',
              ) }
              style={ imgStyle }
              { ...rest }
            />
            { errorText && (
              <span className="mt-1 px-2 text-xs text-red-400">{ errorText }</span>
            ) }
          </div>
        ) }

        {/* Actual Image */ }
        <img
          ref={ imgRef }
          alt={ rest.alt || 'Lazy loaded image' }
          decoding="async"
          className={ cn(
            'absolute top-0 left-0 object-cover w-full h-full transition-transform duration-300',
            { 'hover:scale-105': showImg },
            { 'cursor-zoom-in': previewable && showImg },
            imgClassName,
          ) }
          style={ imgStyle }
          onClick={ (e) => {
            onClick?.(e)
            if (previewable && showImg)
              setPreviewVisible(true)
          } }
          onLoad={ handleLoad }
          onError={ handleError }
          { ...rest }
        />

        {/* Optional Children Overlay */ }
        { children }
      </div>
    </motion.div>

    {/* Preview Component */ }
    { previewVisible && (
      <PreviewImg
        src={ previewImages && previewImages.length > 0
          ? previewImages
          : src }
        initialIndex={ previewImages
          ? previewImages.indexOf(src)
          : 0 }
        showThumbnails={ showThumbnails }
        onClose={ () => setPreviewVisible(false) }
      />
    ) }
  </>)
})

LazyImg.displayName = 'LazyImg'

export type { LazyImgProps } from './types'
