import { useCallback, useEffect, useRef } from 'react'
import { TRANSITION_DURATION } from './constants'

export interface UsePageNavigationOptions {
  showPreview: boolean
  previewWidth: number
  gap: number
  currentIndex: number
  trackRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
}

export interface UsePageNavigationReturn {
  calculateTranslateX: (index: number, containerWidth: number) => number
  applyTransform: (index: number, withTransition?: boolean) => void
  getContainerWidth: () => number
  isAnimatingRef: React.RefObject<boolean>
}

/**
 * 页面导航相关的逻辑 hook
 * 负责位置计算和 transform 应用
 */
export function usePageNavigation(options: UsePageNavigationOptions): UsePageNavigationReturn {
  const { showPreview, previewWidth, gap, currentIndex, trackRef, containerRef } = options
  const isFirstRender = useRef(true)
  const isAnimatingRef = useRef(false)
  const transitionTimerRef = useRef<number | null>(null)
  const transitionDurationMs = Number.parseFloat(TRANSITION_DURATION) * 1000 || 300

  /** 获取容器宽度 */
  const getContainerWidth = useCallback(() => {
    return containerRef.current?.offsetWidth || 0
  }, [])

  /** 计算指定索引的 translateX 偏移量，保证当前页居中，左右两侧显示预览 */
  const calculateTranslateX = useCallback((index: number, containerWidth: number) => {
    if (!showPreview) {
      return index * (containerWidth + gap)
    }

    /** 页面宽度 = 容器宽度 - 左右两侧预览宽度 */
    const pageWidth = containerWidth - 2 * previewWidth

    /**
     * track的每一页起始位置 - 左侧留白 = 最终偏移
     * 使用时会加负号，所以第一页(index=0)时: -(0 - 100) = 100px
     */
    return index * (pageWidth + gap) - previewWidth
  }, [showPreview, previewWidth, gap])

  /** 应用 transform 变换到 track 元素 */
  const applyTransform = useCallback((index: number, withTransition = true) => {
    if (!trackRef.current)
      return

    const containerWidth = getContainerWidth()
    const translateX = calculateTranslateX(index, containerWidth)

    if (withTransition) {
      trackRef.current.style.transition = `transform ${TRANSITION_DURATION} ease-in-out`
      isAnimatingRef.current = true
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current)
      }
      transitionTimerRef.current = window.setTimeout(() => {
        isAnimatingRef.current = false
        transitionTimerRef.current = null
      }, transitionDurationMs)
    }
    else {
      trackRef.current.style.transition = 'none'
      isAnimatingRef.current = false
    }

    trackRef.current.style.transform = `translateX(${-translateX}px)`
  }, [getContainerWidth, calculateTranslateX, trackRef, transitionDurationMs])

  /** 同步当前索引到 UI，避免与拖拽动画冲突 */
  useEffect(() => {
    if (trackRef.current && containerRef.current) {
      applyTransform(currentIndex, !isFirstRender.current)
    }
    isFirstRender.current = false
  }, [currentIndex, applyTransform, trackRef])

  return {
    calculateTranslateX,
    applyTransform,
    getContainerWidth,
    isAnimatingRef,
  }
}
