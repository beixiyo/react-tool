'use client'

/** 一张真实卡片的展开/堆叠姿态；只有装饰底板，不另建一套收拢卡片 */
import type { MotionValue } from 'motion/react'
import { motion, useTransform } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
import { isBottomPlacement, TASK_BANNER_DEFAULT_STACKED_CARDS } from './constants'
import { TaskBannerBar } from './TaskBannerBar'
import type { TaskBannerBarProps } from './TaskBannerBar'
import type { TaskBannerCollapseStackedCardsConfig } from './types'
import type { CardSize } from './useTaskBannerLayout'
import { useTaskBannerCardProgress } from './useTaskBannerLayout'

/** 以自然尺寸为展开终点，以顶卡尺寸为堆叠终点；宽度缩放不触发文案重新换行 */
export const TaskBannerStackCard = memo<StackCardProps>((props) => {
  const {
    item,
    placement,
    onRetry,
    onAction,
    onClose,
    index,
    count,
    collapsed,
    customCollapsed,
    progress,
    duration,
    size,
    topSize,
    expandedY,
    containerWidth,
    layers,
    options,
    showCount,
    countClassName,
    measureRef,
  } = props

  const depth = Math.min(index, layers - 1)
  const bottom = isBottomPlacement(placement)
  const align = placement.endsWith('left')
    ? 0
    : placement.endsWith('right')
    ? 1
    : 0.5
  const xDirection = placement.endsWith('right')
    ? -1
    : 1

  const local = useTaskBannerCardProgress({ progress, index, count, duration })
  const { offsetX, offsetY, scaleStep, opacityStep, variant } = { ...TASK_BANNER_DEFAULT_STACKED_CARDS, ...options }
  const layerScale = Math.max(0, 1 - scaleStep * depth)
  const expandedX = (containerWidth - size.width) * align
  const stackedX = (containerWidth - topSize.width) * align + (topSize.width - size.width) / 2 + xDirection * depth * offsetX
  const targetScale = size.width
    ? topSize.width / size.width * layerScale
    : 1

  /** 补偿中心缩放缩掉的半高，使露边仍精确等于 offsetY，而不是被缩放吃掉 */
  const stackedY = depth * offsetY + topSize.height * (1 - layerScale) / 2
  const x = useTransform(() => expandedX + (stackedX - expandedX) * local.get())
  const y = useTransform(() =>
    (bottom
      ? -1
      : 1) * (expandedY + (stackedY - expandedY) * local.get())
  )
  const scaleX = useTransform(() => 1 + (targetScale - 1) * local.get())
  const scaleY = useTransform(() => 1 + (layerScale - 1) * local.get())
  const height = useTransform(() => size.height + (topSize.height - size.height) * local.get())

  const opacity = useTransform(() =>
    1 + ((index >= layers
        ? 0
        : Math.max(0, 1 - depth * opacityStep)) - 1) * local.get()
  )
  const contentOpacity = useTransform(() => 1 - local.get())
  const visibility = useTransform(() =>
    (index >= layers || customCollapsed) && progress.get() === 1
      ? 'hidden'
      : 'visible'
  )

  return (
    <motion.div
      className="absolute w-max"
      aria-hidden={ collapsed && (index > 0 || customCollapsed) || undefined }
      inert={ collapsed && (index > 0 || customCollapsed) }
      style={ {
        top: bottom
          ? undefined
          : 0,
        bottom: bottom
          ? 0
          : undefined,
        left: 0,
        x,
        y,
        scaleX,
        scaleY,
        height,
        opacity,
        visibility,
        zIndex: (options?.zIndexBase ?? 0) + count - index,
        pointerEvents: collapsed && index > 0
          ? 'none'
          : 'auto',
      } }
      exit={ { opacity: 0, transition: { duration: 0.2 } } }
    >
      { index > 0 && (
        <motion.div
          aria-hidden
          className={ cn(
            'pointer-events-none absolute inset-0 rounded-3xl',
            variant === 'border' && 'border border-border bg-background2',
            /** 露边层不再叠加模糊阴影；浅色用白底细线，暗色额外提亮底色以区分层次。 */
            variant === 'shadow' && 'bg-button3 ring-1 ring-inset ring-border',
            variant === 'shadow' && (depth === 1
              ? 'dark:bg-background3'
              : 'dark:bg-background4'),
            variant === 'background' && (depth === 1
              ? 'bg-background3'
              : 'bg-background4'),
            options?.layerClassName,
            options?.layerClassNames?.[depth],
          ) }
          style={ { opacity: local } }
        />
      ) }
      <motion.div
        ref={ measureRef }
        className={ cn('relative w-max', index === 0 && options?.topLayerClassName, options?.contentClassName) }
        style={ { opacity: contentOpacity } }
      >
        <TaskBannerBar
          item={ item }
          placement={ placement }
          onRetry={ onRetry }
          onAction={ onAction }
          onClose={ onClose }
          managedLayout
          stackCount={ index === 0 && showCount
            ? count
            : undefined }
          stackProgress={ progress }
          countClassName={ countClassName }
        />
      </motion.div>
    </motion.div>
  )
})

TaskBannerStackCard.displayName = 'TaskBannerStackCard'

type StackCardProps = TaskBannerBarProps & {
  index: number
  count: number
  collapsed: boolean
  customCollapsed: boolean
  progress: MotionValue<number>
  duration: number
  size: CardSize
  topSize: CardSize
  expandedY: number
  containerWidth: number
  layers: number
  options?: TaskBannerCollapseStackedCardsConfig
  showCount: boolean
  measureRef: (element: HTMLDivElement | null) => void
}
