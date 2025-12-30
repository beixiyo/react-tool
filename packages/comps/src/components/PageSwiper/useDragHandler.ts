import type { UsePageNavigationReturn } from './usePageNavigation'
import { useCallback, useRef } from 'react'

export interface UseDragHandlerOptions {
  currentIndex: number
  childrenLength: number
  threshold: number
  trackRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  applyTransform: UsePageNavigationReturn['applyTransform']
  calculateTranslateX: UsePageNavigationReturn['calculateTranslateX']
  getContainerWidth: UsePageNavigationReturn['getContainerWidth']
  onIndexChange: (index: number) => void
}

export interface UseDragHandlerReturn {
  handleDragStart: (e: React.MouseEvent | React.TouchEvent) => void
  handleDragMove: (e: React.MouseEvent | React.TouchEvent) => void
  handleDragEnd: () => void
  handleTouchMoveCapture: (e: React.TouchEvent) => void
}

interface DragState {
  startX: number
  startY: number
  isDragging: boolean
  draggedDistance: number
  isHorizontalSwipe: boolean
  isVerticalSwipe: boolean
}

/**
 * 拖拽处理相关的逻辑 hook
 * 负责处理鼠标和触摸拖拽事件
 */
export function useDragHandler(options: UseDragHandlerOptions): UseDragHandlerReturn {
  const {
    currentIndex,
    childrenLength,
    threshold,
    trackRef,
    applyTransform,
    calculateTranslateX,
    getContainerWidth,
    onIndexChange,
  } = options

  const dragState = useRef<DragState>({
    startX: 0,
    startY: 0,
    isDragging: false,
    draggedDistance: 0,
    isHorizontalSwipe: false,
    isVerticalSwipe: false,
  })

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (childrenLength <= 1)
      return

    dragState.current.isDragging = true
    dragState.current.startX = 'touches' in e
      ? e.touches[0].clientX
      : e.clientX
    dragState.current.startY = 'touches' in e
      ? e.touches[0].clientY
      : e.clientY
    dragState.current.draggedDistance = 0
    dragState.current.isHorizontalSwipe = false
    dragState.current.isVerticalSwipe = false

    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }, [childrenLength, trackRef])

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.current.isDragging || !trackRef.current)
      return

    const currentX = 'touches' in e
      ? e.touches[0].clientX
      : e.clientX
    const currentY = 'touches' in e
      ? e.touches[0].clientY
      : e.clientY

    const deltaX = currentX - dragState.current.startX
    const deltaY = currentY - dragState.current.startY

    /** 检测是否为垂直滑动：垂直位移大于水平位移 */
    if (!dragState.current.isHorizontalSwipe && !dragState.current.isVerticalSwipe) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        dragState.current.isVerticalSwipe = true
      }
      else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        dragState.current.isHorizontalSwipe = true
      }
    }

    /** 如果检测到垂直滑动，禁用本次左右滑动，恢复到原始位置 */
    if (dragState.current.isVerticalSwipe) {
      applyTransform(currentIndex, true)
      dragState.current.draggedDistance = 0
      return
    }

    /** 如果检测到水平滑动，阻止默认滚动行为 */
    if (dragState.current.isHorizontalSwipe && 'touches' in e) {
      e.preventDefault()
    }

    dragState.current.draggedDistance = deltaX

    const containerWidth = getContainerWidth()
    const baseTranslate = -calculateTranslateX(currentIndex, containerWidth)
    trackRef.current.style.transform = `translateX(${baseTranslate + deltaX}px)`
  }, [currentIndex, getContainerWidth, calculateTranslateX, applyTransform, trackRef])

  const handleDragEnd = useCallback(() => {
    if (!dragState.current.isDragging)
      return
    dragState.current.isDragging = false

    const containerWidth = getContainerWidth()
    const thresholdValue = containerWidth * threshold

    let newIndex = currentIndex

    /** 如果检测到是垂直滑动，不触发页面切换 */
    if (dragState.current.isVerticalSwipe) {
      dragState.current.isVerticalSwipe = false
      applyTransform(currentIndex, true)
      dragState.current.isHorizontalSwipe = false
      return
    }

    if (dragState.current.draggedDistance < -thresholdValue && currentIndex < childrenLength - 1) {
      newIndex = currentIndex + 1
    }
    else if (dragState.current.draggedDistance > thresholdValue && currentIndex > 0) {
      newIndex = currentIndex - 1
    }

    applyTransform(newIndex, true)

    if (newIndex !== currentIndex) {
      onIndexChange(newIndex)
    }

    /** 重置水平滑动状态 */
    dragState.current.isHorizontalSwipe = false
  }, [currentIndex, childrenLength, threshold, getContainerWidth, applyTransform, onIndexChange])

  const handleTouchMoveCapture = useCallback((e: React.TouchEvent) => {
    /** 如果正在水平滑动，阻止默认滚动行为 */
    if (dragState.current.isHorizontalSwipe) {
      e.preventDefault()
    }
  }, [])

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleTouchMoveCapture,
  }
}
