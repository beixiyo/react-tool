'use client'

import type { Dir } from './ControlPoint'
import { clamp, getWinHeight, getWinWidth } from '@jl-org/tool'
import { useLatestRef, useResizeObserver } from 'hooks'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { ControlPoint } from './ControlPoint'
import { RotationHandle } from './RotationHandle'

/**
 * Moveable 组件
 *
 * 一个可拖动、调整大小和旋转的容器组件。
 *
 * @example
 * // 正确用法
 * <div className="relative size-full">
 *   <Moveable>
 *     <div>可拖动内容</div>
 *   </Moveable>
 * </div>
 *
 * // 错误用法 - 不要添加额外的包装元素
 * <div className="relative size-full">
 *   <div> // 这个额外的 div 会导致边界计算错误
 *     <Moveable>
 *       <div>可拖动内容</div>
 *     </Moveable>
 *   </div>
 * </div>
 *
 * @important
 * 1. Moveable 组件必须直接放在 relative 定位的容器中
 * 2. 不要添加额外的包装元素，这会导致边界计算错误
 * 3. 父容器应该设置合适的尺寸（如 size-full）
 *
 * @why
 * Moveable 组件使用父容器的尺寸来计算拖动边界。如果添加额外的包装元素，
 * 会导致边界计算错误，影响拖动、缩放和旋转功能。
 */
export const Moveable = memo(forwardRef<MoveableRef, MoveableProps>(({
  children,
  initialPosition,
  className,
  style,

  onPositionChange,
  onResize,
  onRotate,
  onTransformEnd,
  onTransformStateChange,

  minWidth = 50,
  minHeight = 50,
  viewport = 'parent',
  maxWidth = Infinity,
  maxHeight = Infinity,
  canDragOutside = true,
  lockAspectRatio = false,
  disabled = false,
  canDrag = true,
  canRotate = true,
  canResize = true,
  showBorder = false,
  color = 'rgb(var(--systemGreen) / 1)',

  ...rest
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLElement>(null)

  const [position, setPosition] = useState<MoveablePosition>({
    x: initialPosition?.x ?? 0,
    y: initialPosition?.y ?? 0,
    width: 0,
    height: 0,
    rotation: initialPosition?.rotation ?? 0,
    scaleX: 1,
    scaleY: 1,
  })

  /** 始终持有最新的 position，供 window 监听回调读取，避免把 position 放进 effect 依赖导致拖拽全程反复解绑/绑定 */
  const positionRef = useLatestRef(position)

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  const [resizeHandle, setResizeHandle] = useState<Dir>('')
  const [hitPosition, setHitPosition] = useState<HitPosition>('')

  /** 初始大小 */
  const initSize = useRef({ width: 0, height: 0 })
  /** 拖动开始的位置 */
  const dragStart = useRef({ x: 0, y: 0 })
  /** 拖动开始时上次的 position */
  const lastPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })
  /** 父元素的矩形位置 */
  const parentRect = useRef({ x: 0, y: 0, width: 0, height: 0 })

  /** 命令式 API：向后兼容，仅在外部传入 ref 时生效，不改变非受控默认行为 */
  useImperativeHandle(ref, () => ({
    getPosition: () => positionRef.current,
    setPosition: next => setPosition(prev => ({ ...prev, ...next })),
    reset: () => setPosition(prev => ({
      ...prev,
      x: initialPosition?.x ?? 0,
      y: initialPosition?.y ?? 0,
      rotation: initialPosition?.rotation ?? 0,
      width: initSize.current.width,
      height: initSize.current.height,
      scaleX: 1,
      scaleY: 1,
    })),
  }), [positionRef, initialPosition?.x, initialPosition?.y, initialPosition?.rotation])

  /***************************************************
   *                    Handlers
   ***************************************************/
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (disabled || !canDrag)
      return
    setIsDragging(true)

    dragStart.current = { x: e.clientX, y: e.clientY }
    lastPosition.current = {
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height,
    }
  }, [disabled, position, canDrag])

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: Dir) => {
    if (disabled || !canResize)
      return

    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)

    dragStart.current = { x: e.clientX, y: e.clientY }
    lastPosition.current = {
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height,
    }
  }, [disabled, position, canResize])

  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    if (disabled || !canRotate)
      return

    e.stopPropagation()
    setIsRotating(true)
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect)
      return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    dragStart.current = {
      x: Math.atan2(e.clientY - centerY, e.clientX - centerX),
      y: position.rotation,
    }
  }, [disabled, position.rotation, canRotate])

  /**
   * 限制位置大小，如果超出父元素 parentRect 范围则返回 false
   */
  const checkBound = useCallback((e: MouseEvent) => {
    const deltaX = e.clientX - dragStart.current.x
    const deltaY = e.clientY - dragStart.current.y

    let isOverBound = false
    let newX = lastPosition.current.x + deltaX
    let newY = lastPosition.current.y + deltaY

    if (!canDragOutside) {
      if (newX < 0) {
        newX = 0
        isOverBound = true
        setHitPosition('left')
      }
      if (newY < 0) {
        newY = 0
        isOverBound = true
        setHitPosition('top')
      }
      if (newX > parentRect.current.width - positionRef.current.width) {
        isOverBound = true
        newX = parentRect.current.width - positionRef.current.width
        setHitPosition('right')
      }
      if (newY > parentRect.current.height - positionRef.current.height) {
        isOverBound = true
        newY = parentRect.current.height - positionRef.current.height
        setHitPosition('bottom')
      }
    }

    !isOverBound && setHitPosition('')

    return { x: newX, y: newY }
  }, [canDragOutside, positionRef])

  /***************************************************
   *                    Effects
   ***************************************************/
  useLayoutEffect(
    () => {
      if (!containerRef.current?.children[0]) {
        return
      }

      parentRef.current = viewport === 'parent'
        ? containerRef.current!.parentElement!
        : document.body

      const el = containerRef.current.children[0] as HTMLElement
      const childRectClient = el.getBoundingClientRect()
      const width = clamp(childRectClient.width, minWidth, maxWidth)
      const height = clamp(childRectClient.height, minHeight, maxHeight)

      initSize.current = { width, height }
      setPosition(prev => ({
        ...prev,
        width,
        height,
      }))
      onResize?.(width, height, 1, 1)

      requestAnimationFrame(() => {
        Object.assign(el.style, {
          width: '100%',
          height: '100%',
        })
      })
    },
    [],
  )

  useResizeObserver(
    [containerRef, parentRef],
    () => {
      if (viewport === 'parent') {
        const parentEl = containerRef.current!.parentElement
        if (!parentEl)
          return

        const parentRectClient = parentEl.getBoundingClientRect()
        parentRect.current = {
          x: parentRectClient.left,
          y: parentRectClient.top,
          width: parentRectClient.width,
          height: parentRectClient.height,
        }
      }
      else {
        parentRect.current = {
          x: 0,
          y: 0,
          width: getWinWidth(),
          height: getWinHeight(),
        }
      }
    },
  )

  /** 监听操作状态变化，通知外部组件 */
  useEffect(() => {
    const isTransforming = isDragging || isResizing || isRotating
    onTransformStateChange?.(isTransforming)
  }, [isDragging, isResizing, isRotating, onTransformStateChange])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const { x, y } = checkBound(e)

        onPositionChange?.(x, y)
        setPosition(prev => ({
          ...prev,
          x,
          y,
        }))
      }
      else if (isResizing) {
        const deltaX = e.clientX - dragStart.current.x
        const deltaY = e.clientY - dragStart.current.y
        let newWidth = lastPosition.current.width
        let newHeight = lastPosition.current.height
        let newX = lastPosition.current.x
        let newY = lastPosition.current.y

        switch (resizeHandle) {
          case 'nw':
            newWidth = lastPosition.current.width - deltaX
            newHeight = lastPosition.current.height - deltaY
            newX = lastPosition.current.x + deltaX
            newY = lastPosition.current.y + deltaY
            break
          case 'ne':
            newWidth = lastPosition.current.width + deltaX
            newHeight = lastPosition.current.height - deltaY
            newY = lastPosition.current.y + deltaY
            break
          case 'se':
            newWidth = lastPosition.current.width + deltaX
            newHeight = lastPosition.current.height + deltaY
            break
          case 'sw':
            newWidth = lastPosition.current.width - deltaX
            newHeight = lastPosition.current.height + deltaY
            newX = lastPosition.current.x + deltaX
            break
          case 'n':
            newHeight = lastPosition.current.height - deltaY
            newY = lastPosition.current.y + deltaY
            break
          case 's':
            newHeight = lastPosition.current.height + deltaY
            break
          case 'w':
            newWidth = lastPosition.current.width - deltaX
            newX = lastPosition.current.x + deltaX
            break
          case 'e':
            newWidth = lastPosition.current.width + deltaX
            break
        }

        /** 应用宽高约束 */
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

        if (lockAspectRatio) {
          const aspect = lastPosition.current.width / lastPosition.current.height
          if (resizeHandle.includes('w') || resizeHandle === 'e') {
            newHeight = newWidth / aspect
            if (newHeight < minHeight) {
              newHeight = minHeight
              newWidth = newHeight * aspect
            }
            else if (newHeight > maxHeight) {
              newHeight = maxHeight
              newWidth = newHeight * aspect
            }
          }
          else if (resizeHandle === 'n' || resizeHandle === 's') {
            newWidth = newHeight * aspect
            if (newWidth < minWidth) {
              newWidth = minWidth
              newHeight = newWidth / aspect
            }
            else if (newWidth > maxWidth) {
              newWidth = maxWidth
              newHeight = newWidth / aspect
            }
          }
        }

        /** 根据缩放方向调整位置 */
        if (resizeHandle.includes('w') || resizeHandle === 'w') {
          newX = lastPosition.current.x + (lastPosition.current.width - newWidth)
        }
        if (resizeHandle.includes('n') || resizeHandle === 'n') {
          newY = lastPosition.current.y + (lastPosition.current.height - newHeight)
        }

        /** 计算 scaleX 和 scaleY（基于初始尺寸） */
        const scaleX = newWidth / initSize.current.width
        const scaleY = newHeight / initSize.current.height

        setPosition(prev => ({
          ...prev,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          scaleX,
          scaleY,
        }))
        onResize?.(newWidth, newHeight, scaleX, scaleY)
      }
      else if (isRotating) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect)
          return

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
        const newRotation = dragStart.current.y + (angle - dragStart.current.x) * (180 / Math.PI)

        setPosition(prev => ({
          ...prev,
          rotation: newRotation,
        }))
        onRotate?.(newRotation)
      }
    }

    const handleMouseUp = () => {
      if (isDragging || isResizing || isRotating) {
        onTransformEnd?.(positionRef.current)
      }
      setIsDragging(false)
      setIsResizing(false)
      setIsRotating(false)
      setResizeHandle('')
    }

    const parentEl = containerRef.current!.parentElement
    if (!parentEl)
      return

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseleave', handleMouseUp)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseUp)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    isDragging,
    isResizing,
    isRotating,
    positionRef,

    onPositionChange,
    onResize,
    onRotate,
    onTransformEnd,
    checkBound,

    minWidth,
    maxWidth,
    minHeight,
    maxHeight,

    canDragOutside,
    lockAspectRatio,
    resizeHandle,
    canDrag,
    canResize,
    canRotate,
  ])

  /***************************************************
   *                    styles
   ***************************************************/
  const containerStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg)`,
    width: position.width,
    height: position.height,
    userSelect: 'none',
  }

  const cursorStyle = disabled
    ? { cursor: 'not-allowed' }
    : canDrag
      ? { cursor: 'move' }
      : {}

  const getResizeCursor = (handle: Dir) => {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'nwse-resize'
      case 'ne':
      case 'sw':
        return 'nesw-resize'
      case 'n':
      case 's':
        return 'ns-resize'
      case 'w':
      case 'e':
        return 'ew-resize'
      default:
        return 'move'
    }
  }

  return (
    <div
      ref={ containerRef }
      className={ cn(
        'moveable-container size-full absolute select-none rounded-md',
        {
          'border': showBorder && !disabled,
          'border-l-red-6! border-l-2': hitPosition === 'left',
          'border-r-red-6! border-r-2': hitPosition === 'right',
          'border-t-red-6! border-t-2': hitPosition === 'top',
          'border-b-red-6! border-b-2': hitPosition === 'bottom',
          'cursor-move': canDrag && !disabled,
        },
        className,
      ) }
      style={ {
        ...containerStyle,
        ...cursorStyle,
        ...style,
        borderColor: showBorder && !disabled
          ? color
          : 'transparent',
      } }
      onMouseDown={ handleDragStart }
      { ...rest }
    >
      { children }

      { canResize && !disabled && (
        <>
          {/* 角落控制点 */}
          <ControlPoint
            position="nw"
            onMouseDown={ handleResizeStart }
            style={ { ...cursorStyle, cursor: getResizeCursor('nw') } }
            color={ color }
          />
          <ControlPoint
            position="ne"
            onMouseDown={ handleResizeStart }
            style={ { ...cursorStyle, cursor: getResizeCursor('ne') } }
            color={ color }
          />
          <ControlPoint
            position="se"
            onMouseDown={ handleResizeStart }
            style={ { ...cursorStyle, cursor: getResizeCursor('se') } }
            color={ color }
          />
          <ControlPoint
            position="sw"
            onMouseDown={ handleResizeStart }
            style={ { ...cursorStyle, cursor: getResizeCursor('sw') } }
            color={ color }
          />

          {/* 边缘中点控制点 */}
          <ControlPoint
            position="n"
            onMouseDown={ handleResizeStart }
            style={ { ...cursorStyle, cursor: getResizeCursor('n') } }
            color={ color }
          />
          <ControlPoint
            position="s"
            onMouseDown={ handleResizeStart }
            style={ { ...cursorStyle, cursor: getResizeCursor('s') } }
            color={ color }
          />
          <ControlPoint
            position="w"
            onMouseDown={ handleResizeStart }
            style={ { ...cursorStyle, cursor: getResizeCursor('w') } }
            color={ color }
          />
          <ControlPoint
            position="e"
            onMouseDown={ handleResizeStart }
            style={ { ...cursorStyle, cursor: getResizeCursor('e') } }
            color={ color }
          />
        </>
      ) }
      { canRotate && !disabled && <RotationHandle onMouseDown={ handleRotateStart } style={ cursorStyle } color={ color } /> }
    </div>
  )
}))

Moveable.displayName = 'Moveable'

export interface MoveablePosition {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}

type HitPosition = 'left' | 'right' | 'top' | 'bottom' | ''

/**
 * Moveable 命令式句柄，通过 ref 获取
 */
export interface MoveableRef {
  /** 读取当前的变换状态（位置 / 尺寸 / 旋转 / 缩放） */
  getPosition: () => MoveablePosition
  /** 程序化设置变换状态，仅传入需要覆盖的字段 */
  setPosition: (next: Partial<MoveablePosition>) => void
  /** 重置到初始位置（保留首次测量得到的宽高） */
  reset: () => void
}

export type MoveableProps = {
  initialPosition?: Partial<Omit<MoveablePosition, 'width' | 'height' | 'scaleX' | 'scaleY'>>

  onPositionChange?: (x: number, y: number) => void
  onResize?: (width: number, height: number, scaleX: number, scaleY: number) => void
  onRotate?: (rotation: number) => void
  onTransformEnd?: (position: MoveablePosition) => void

  /**
   * 操作状态变化回调
   * @param isTransforming 是否正在进行变换操作（拖拽/缩放/旋转）
   */
  onTransformStateChange?: (isTransforming: boolean) => void

  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  /**
   * 用谁地大小当作父元素，默认父元素
   * @default 'parent'
   */
  viewport?: 'parent' | 'window'

  /**
   * 能否拖动到父元素之外
   */
  canDragOutside?: boolean
  lockAspectRatio?: boolean
  disabled?: boolean

  /**
   * 是否允许拖动
   * @default true
   */
  canDrag?: boolean

  /**
   * 是否允许旋转
   * @default true
   */
  canRotate?: boolean

  /**
   * 是否允许调整大小
   * @default true
   */
  canResize?: boolean

  /**
   * 是否显示边框
   * @default false
   */
  showBorder?: boolean

  /**
   * 主题颜色
   * @default 'rgb(var(--systemGreen) / 1)'
   */
  color?: string
}
& Omit<
  React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>,
  'onResize'
>
