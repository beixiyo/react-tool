import { useCallback, useRef } from 'react'

/**
 * ScrollCarousel 拖拽手势逻辑
 *
 * 支持鼠标和触摸拖拽，智能识别水平/垂直滑动方向，
 * 拖拽过程中实时跟随手指，松手后根据速度和位移判断是否切换
 */
export function useDrag(options: UseDragOptions): UseDragReturn {
  const {
    trackRef,
    threshold,
    getCardWidth,
    getMaxScrollLeft,
    getCurrentScrollLeft,
    onDragMove,
    onDragEnd,
  } = options

  const state = useRef<DragState>({
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    isDragging: false,
    isHorizontal: false,
    isVertical: false,
    startTime: 0,
  })

  const getClientX = (e: React.MouseEvent | React.TouchEvent) =>
    'touches' in e
      ? e.touches[0].clientX
      : e.clientX

  const getClientY = (e: React.MouseEvent | React.TouchEvent) =>
    'touches' in e
      ? e.touches[0].clientY
      : e.clientY

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const s = state.current
    s.isDragging = true
    s.startX = getClientX(e)
    s.startY = getClientY(e)
    s.startScrollLeft = getCurrentScrollLeft()
    s.isHorizontal = false
    s.isVertical = false
    s.startTime = Date.now()

    /** 拖拽期间取消过渡动画 */
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }, [trackRef, getCurrentScrollLeft])

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const s = state.current
    if (!s.isDragging)
      return

    const currentX = getClientX(e)
    const currentY = getClientY(e)
    const deltaX = currentX - s.startX
    const deltaY = currentY - s.startY

    /** 方向检测：首次移动超过 5px 时确定方向 */
    if (!s.isHorizontal && !s.isVertical) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5)
        return
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        s.isVertical = true
        s.isDragging = false
        return
      }
      s.isHorizontal = true
    }

    /** 水平拖拽时阻止默认滚动 */
    if ('touches' in e) {
      e.preventDefault()
    }

    const maxScroll = getMaxScrollLeft()
    let newScrollLeft = s.startScrollLeft - deltaX

    /** 边界阻尼：超出范围时添加橡皮筋感 */
    if (newScrollLeft < 0) {
      newScrollLeft = newScrollLeft * 0.3
    }
    else if (newScrollLeft > maxScroll) {
      newScrollLeft = maxScroll + (newScrollLeft - maxScroll) * 0.3
    }

    onDragMove(newScrollLeft)
  }, [trackRef, getMaxScrollLeft, onDragMove])

  const handleDragEnd = useCallback(() => {
    const s = state.current
    if (!s.isDragging && !s.isHorizontal)
      return
    s.isDragging = false

    if (s.isVertical) {
      s.isVertical = false
      return
    }

    const cardWidth = getCardWidth()
    const elapsed = Date.now() - s.startTime
    const currentScrollLeft = getCurrentScrollLeft()
    const delta = currentScrollLeft - s.startScrollLeft

    /**
     * 快速滑动检测：时间 < 300ms 且位移 > 30px
     * 快速滑动时降低切换阈值，让轻扫就能触发切换
     */
    const isFlick = elapsed < 300 && Math.abs(delta) > 30
    const effectiveThreshold = isFlick
      ? cardWidth * 0.05
      : cardWidth * threshold

    let direction: -1 | 0 | 1 = 0
    if (delta > effectiveThreshold)
      direction = 1
    else if (delta < -effectiveThreshold)
      direction = -1

    s.isHorizontal = false
    onDragEnd(direction)
  }, [threshold, getCardWidth, getCurrentScrollLeft, onDragEnd])

  /** 触摸捕获阶段阻止默认滚动 */
  const handleTouchMoveCapture = useCallback((e: React.TouchEvent) => {
    if (state.current.isHorizontal) {
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

type DragState = {
  startX: number
  startY: number
  startScrollLeft: number
  isDragging: boolean
  isHorizontal: boolean
  isVertical: boolean
  startTime: number
}

export type UseDragOptions = {
  trackRef: React.RefObject<HTMLDivElement | null>
  threshold: number
  getCardWidth: () => number
  getMaxScrollLeft: () => number
  getCurrentScrollLeft: () => number
  onDragMove: (scrollLeft: number) => void
  onDragEnd: (direction: -1 | 0 | 1) => void
}

export type UseDragReturn = {
  handleDragStart: (e: React.MouseEvent | React.TouchEvent) => void
  handleDragMove: (e: React.MouseEvent | React.TouchEvent) => void
  handleDragEnd: () => void
  handleTouchMoveCapture: (e: React.TouchEvent) => void
}
