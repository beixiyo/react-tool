'use client'

import type { MoveableProps } from '../Moveable'
import { onUnmounted } from 'hooks'
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { cn, createZIndexStore } from 'utils'
import { Button } from '../Button'
import { MacTabDot } from '../MacTabDot'
import { Moveable } from '../Moveable'
import { setIframe } from './tool'

const {
  getZIndex,
  increaseZindex,
  decreaseZindex,
} = createZIndexStore()

export const HtmlPreview = memo<HtmlPreviewProps>(({
  html,
  title = 'HTML Preview',
  showControls = true,
  className,
  style,
  draggable = true,
  overflow = 'auto',
  initialPosition,
  canDrag = true,
  canRotate = false,
  canResize = true,
  showBorder = false,
  color = '#3b82f6',
  minWidth = 400,
  minHeight = 260,
  maxWidth = Infinity,
  maxHeight = Infinity,
  lockAspectRatio = false,
  disabled = false,
  onPositionChange,
  onResize,
  onRotate,
  onTransformEnd,
}) => {
  const id = useId()
  const [isExpanded, setIsExpanded] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [zIndex, setZIndex] = useState(increaseZindex())

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  /** 是否正在进行变换操作（拖拽/缩放/旋转） */
  const [isTransforming, setIsTransforming] = useState(false)

  const headerHeight = showControls
    ? 40
    : 0

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1)
  }

  const toggleExpand = () => {
    setIsExpanded(isExpanded => !isExpanded)
    setIframeKey(prev => prev + 1)
  }

  /** 处理点击事件，提升 z-index */
  const handleClick = () => {
    setZIndex(increaseZindex())
  }

  useEffect(() => {
    if (!iframeRef.current)
      return

    const iframe = iframeRef.current
    setIframe(iframe, html, `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
        overflow: ${overflow} !important;
        display: block !important;
        align-items: unset !important;
        justify-content: unset !important;
      }
    `)
  }, [html, iframeKey, overflow])

  onUnmounted(() => {
    decreaseZindex()
  })

  const content = (
    <motion.div
      layoutId={ id }
      ref={ containerRef }
      className={ cn(
        'rounded-2xl h-full border border-gray-200/80 bg-white dark:border-gray-700/80 dark:bg-gray-800 shadow-xl',
        isExpanded
          ? 'fixed inset-4 m-0!'
          : 'relative',
        className,
      ) }
      style={ {
        zIndex: zIndex + 1,
        ...style,
      } }
    >
      { showControls && (
        <div
          className="flex items-center justify-between border-b border-gray-200/60 from-slate-50 to-gray-50 bg-linear-to-r p-4 dark:border-gray-700/60 dark:from-gray-800 dark:to-gray-900"
          style={ { height: headerHeight } }
        >
          <div className="flex items-center gap-3">
            <MacTabDot />
            <h2 className="text-gray-800 dark:text-gray-200">{ title }</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="size-6"
              onClick={ handleRefresh }
              rounded="lg"
              designStyle="neumorphic"
              iconOnly
              leftIcon={ <RefreshCw size={ 14 } /> }
            />
            <Button
              className="size-6"
              onClick={ toggleExpand }
              rounded="lg"
              designStyle="neumorphic"
              iconOnly
              leftIcon={ isExpanded
                ? <Minimize2 size={ 14 } />
                : <Maximize2 size={ 14 } /> }
            />
          </div>
        </div>
      ) }

      <div
        className="relative w-full overflow-hidden"
        style={ {
          height: `calc(100% - ${headerHeight}px)`,
        } }
      >
        <iframe
          key={ iframeKey }
          ref={ iframeRef }
          className="h-full w-full border-none"
          sandbox="allow-scripts allow-same-origin"
          title={ title }
        />
        {/* 透明遮罩层，只在变换操作时显示，用于阻止iframe事件干扰 */ }
        <div
          ref={ overlayRef }
          className="absolute inset-0 z-10"
          style={ {
            pointerEvents: isTransforming
              ? 'auto'
              : 'none',
            display: isTransforming
              ? 'block'
              : 'none',
          } }
        />
      </div>
    </motion.div>
  )

  if (!draggable || isExpanded) {
    return content
  }

  return (
    <Moveable
      style={ { zIndex } }
      viewport="window"
      initialPosition={ initialPosition }
      canDrag={ canDrag }
      canRotate={ canRotate }
      canResize={ canResize }
      showBorder={ showBorder }
      color={ color }
      minWidth={ minWidth }
      minHeight={ minHeight }
      maxWidth={ maxWidth }
      maxHeight={ maxHeight }
      canDragOutside
      lockAspectRatio={ lockAspectRatio }
      disabled={ disabled || isExpanded || !draggable }
      onPositionChange={ onPositionChange }
      onResize={ onResize }
      onRotate={ onRotate }
      onTransformEnd={ onTransformEnd }
      onTransformStateChange={ setIsTransforming }
      onPointerDown={ handleClick }
    >
      { content }
    </Moveable>
  )
})

type MoveableConfig = Pick<
  MoveableProps,
  | 'canDrag'
  | 'canRotate'
  | 'canResize'
  | 'showBorder'
  | 'color'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'lockAspectRatio'
  | 'disabled'
  | 'onPositionChange'
  | 'onResize'
  | 'onRotate'
  | 'onTransformEnd'
>

export type HtmlPreviewProps
  = MoveableConfig & {
    /**
     * HTML内容
     */
    html: string
    /**
     * 预览窗口的标题
     * @default 'HTML Preview'
     */
    title?: string
    /**
     * 内容溢出时的滚动行为
     * @default 'auto'
     */
    overflow?: 'hidden' | 'auto' | 'scroll' | 'visible'
    /**
     * 是否显示控制栏
     * @default true
     */
    showControls?: boolean
    /**
     * 是否可拖动
     * @default true
     */
    draggable?: boolean
    /**
     * 初始位置
     */
    initialPosition?: {
      x?: number
      y?: number
      rotation?: number
    }
  }
  & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
