'use client'

/** 展开和收拢共用一个坐标容器；卡片按 id 常驻，退出仅由真实任务移除触发 */
import { AnimatePresence, motion, useTransform } from 'motion/react'
import { memo, useLayoutEffect } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { isBottomPlacement, TASK_BANNER_DEFAULT_COLLAPSE_THRESHOLD, TASK_BANNER_DEFAULT_STACKED_CARDS } from './constants'
import type { TaskBannerBarProps } from './TaskBannerBar'
import { TaskBannerStackCard } from './TaskBannerStackCard'
import type { TaskBannerCollapseConfig, TaskBannerItemData } from './types'
import { useTaskBannerLayout } from './useTaskBannerLayout'

const INNER_INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [role="button"], [contenteditable="true"]'

/** 保留完整列表的真实 DOM，叠层只改变姿态和可交互性 */
export const TaskBannerList = memo<TaskBannerListProps>((props) => {
  const { items, placement, collapsed, config, containerClassName, expand, onRetry, onAction, onClose } = props
  const t = useT()

  const customRender = items.length >= (config?.threshold ?? TASK_BANNER_DEFAULT_COLLAPSE_THRESHOLD)
    ? config?.render
    : undefined
  const options = customRender
    ? undefined
    : config?.stackedCards

  const layers = Math.min(items.length, config?.stackedCards?.layers ?? 3)
  const { rootRef, elements, geometry, progress, duration, measure } = useTaskBannerLayout({
    collapsed,
    count: items.length,
    layoutKey: `${items.map((item) => item.id).join(',')}:${containerClassName ?? ''}:${!!customRender}`,
  })

  const topSize = geometry.sizes.get(items[0]?.id) ?? { width: 0, height: 0 }
  const customSize = geometry.sizes.get(-1)

  /** 退出中的卡片仍占用横向坐标系，最后一条退场时不能因容器归零而横跳 */
  const width = Math.max(0, ...[...geometry.sizes.values()].map((size) => size.width))
  let expandedHeight = 0
  const positions = items.map((item) => {
    const y = expandedHeight
    expandedHeight += (geometry.sizes.get(item.id)?.height ?? 0) + geometry.gap
    return y
  })
  expandedHeight = Math.max(0, expandedHeight - geometry.gap)

  const collapsedHeight = customSize?.height ?? (topSize.height + Math.max(0, layers - 1) * (options?.offsetY ?? TASK_BANNER_DEFAULT_STACKED_CARDS.offsetY))
  const height = useTransform(() => expandedHeight + (collapsedHeight - expandedHeight) * progress.get())
  const customVisibility = useTransform(() =>
    progress.get() === 1
      ? 'visible'
      : 'hidden'
  )
  const builtInTrigger = collapsed && !customRender

  useLayoutEffect(() => {
    /** 下层变 inert、末端按钮将退场时，只回收本栈内部焦点，不抢外部输入 */
    const root = rootRef.current
    if (builtInTrigger && root?.parentElement?.contains(document.activeElement)) root.focus()
  }, [builtInTrigger, rootRef])

  return (
    <motion.div
      ref={ rootRef }
      role={ builtInTrigger
        ? 'button'
        : undefined }
      tabIndex={ builtInTrigger
        ? 0
        : undefined }
      aria-expanded={ builtInTrigger
        ? false
        : undefined }
      aria-label={ builtInTrigger
        ? t('taskBanner.expand')
        : undefined }
      onClick={ (event) => {
        if (!builtInTrigger) return
        const inner = (event.target as HTMLElement).closest(INNER_INTERACTIVE_SELECTOR)
        if (inner && inner !== event.currentTarget) return
        expand()
      } }
      onKeyDown={ (event) => {
        if (!builtInTrigger || event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          expand()
        }
      } }
      className={ cn(
        'relative shrink-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info',
        collapsed && 'pointer-events-auto cursor-pointer select-none',
        !customRender && config?.className,
        options?.className,
      ) }
      style={ {
        ...options?.style,
        width,
        height,
        display: items.length === 0 && geometry.sizes.size === 0
          ? 'none'
          : undefined,
      } }
    >
      <AnimatePresence onExitComplete={ measure }>
        { items.map((item, index) => (
          <TaskBannerStackCard
            key={ item.id }
            item={ item }
            placement={ placement }
            index={ index }
            count={ items.length }
            collapsed={ collapsed }
            customCollapsed={ !!customRender }
            progress={ progress }
            duration={ duration }
            size={ geometry.sizes.get(item.id) ?? { width: 0, height: 0 } }
            topSize={ topSize }
            expandedY={ positions[index] }
            containerWidth={ width }
            layers={ layers }
            options={ options }
            showCount={ !!config && !customRender && config.showCount !== false && items.length > 1 }
            countClassName={ config?.countClassName }
            measureRef={ (element) => {
              if (element) elements.current.set(item.id, element)
              else elements.current.delete(item.id)
            } }
            onRetry={ onRetry }
            onAction={ onAction }
            onClose={ onClose }
          />
        )) }
      </AnimatePresence>
      { customRender && (
        <motion.div
          ref={ (element) => {
            if (element) elements.current.set(-1, element)
            else elements.current.delete(-1)
          } }
          className="pointer-events-auto absolute w-max"
          inert={ !collapsed }
          style={ {
            visibility: customVisibility,
            top: isBottomPlacement(placement)
              ? undefined
              : 0,
            bottom: isBottomPlacement(placement)
              ? 0
              : undefined,
            left: placement.endsWith('right')
              ? undefined
              : placement.endsWith('left')
              ? 0
              : '50%',
            right: placement.endsWith('right')
              ? 0
              : undefined,
            x: placement.endsWith('left') || placement.endsWith('right')
              ? 0
              : '-50%',
          } }
        >
          { customRender({
            items: items.slice(0, layers),
            count: items.length,
            layers: Math.max(1, layers) as 1 | 2 | 3,
            placement,
            expand,
            retry: onRetry,
            close: onClose,
          }) }
        </motion.div>
      ) }
    </motion.div>
  )
})

TaskBannerList.displayName = 'TaskBannerList'

type TaskBannerListProps = Omit<TaskBannerBarProps, 'item'> & {
  items: TaskBannerItemData[]
  collapsed: boolean
  config?: TaskBannerCollapseConfig
  containerClassName?: string
  expand: () => void
}
