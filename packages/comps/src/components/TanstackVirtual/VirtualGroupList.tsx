'use client'

import { memo } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'
import { TanstackVirtualList } from './TanstackVirtualList'
import type { VirtualGroupListProps, VirtualGroupRow, VirtualSizeTransitionOptions } from './types'
import { useVirtualGroup } from './useVirtualGroup'

/**
 * 分组虚拟列表（基于 TanstackVirtualList 的扁平化行模型）
 *
 * 把多个分组拍平成一个异构行数组（组头 / 项 / 收起预览 / loading），
 * 共用一个滚动条与一个虚拟化实例，因此：
 * - 折叠/展开 = 行模型增删，不破坏整页单滚动条的体验
 * - 每组独立无限加载：组内最后一个已加载行进入可视区时触发该组 loadMore
 * - 收起态预览（如 StackedCards）作为普通行渲染，点击可展开
 *
 * 开启 collapseAnimation 后，收放期间整组 item 行留在行模型里、由同一个进度
 * 驱动尺寸，virtualizer 的几何逐帧跟随动画（详见 TanstackVirtualListProps.sizeTransition）
 *
 * 项的内容与样式完全由 renderItem / itemClassName 注入，组件不掺杂业务
 */
function InnerVirtualGroupList<T>(props: VirtualGroupListProps<T>) {
  const {
    sections,
    renderItem,
    getItemKey,
    expanded,
    defaultExpanded,
    onExpandedChange,
    collapsedPreviewClickable = true,
    estimateSize = 64,
    overscan = 5,
    layoutAnimation,
    collapseAnimation,
    useCachedMeasurements = false,
    showLoading = true,
    itemClassName,
    headerClassName,
    previewClassName,
    renderLoader,
    scrollRef,
    contentClassName,
    className,
    ...rest
  } = props

  const { rows, toggleSection, settleGroup, handleVisibleRangeChange } = useVirtualGroup({
    sections,
    expanded,
    defaultExpanded,
    onExpandedChange,
    getItemKey,
    showLoading,
    animateCollapse: Boolean(collapseAnimation),
  })

  /** 渲染期被 TanstackVirtualList 同步调用，保持普通闭包（理由见其内部注释） */
  const rowClassName = (row: VirtualGroupRow<T>) => {
    if (row.type !== 'item') return undefined

    return typeof itemClassName === 'function'
      ? itemClassName(row.item, row.ctx)
      : itemClassName
  }

  const renderRow = (row: VirtualGroupRow<T>) => {
    switch (row.type) {
      case 'header': {
        const collapsible = row.section.collapsible !== false

        return (
          <div
            className={ cn(collapsible && 'cursor-pointer', headerClassName) }
            onClick={ collapsible
              ? () => toggleSection(row.section.key)
              : undefined }
          >
            { typeof row.section.header === 'function'
              ? row.section.header(row.expanded)
              : row.section.header }
          </div>
        )
      }

      case 'item':
        return renderItem(row.item, row.ctx)

      case 'preview': {
        /** 正在缩到 0 的预览行不再响应点击，免得动画中途又被切回去 */
        const clickable = collapsedPreviewClickable && !row.transition

        return (
          <div
            className={ cn(clickable && 'cursor-pointer', previewClassName) }
            onClick={ clickable
              ? () => toggleSection(row.section.key)
              : undefined }
          >
            { row.section.collapsedPreview }
          </div>
        )
      }

      case 'loader':
        return renderLoader
          ? renderLoader(row.section)
          : (
            <div className="flex items-center justify-center py-3">
              <LoadingIcon size={ 24 } />
            </div>
          )
    }
  }

  const sizeTransition: VirtualSizeTransitionOptions<VirtualGroupRow<T>> | undefined = collapseAnimation
    ? {
      getSpec: (row) =>
        (row.type === 'item' || row.type === 'preview') && row.transition
          ? row.transition
          : undefined,
      onSettled: settleGroup,
      transition: collapseAnimation.transition,
      maxDistance: collapseAnimation.maxDistance,
    }
    : undefined

  return (
    <TanstackVirtualList
      data={ rows }
      className={ className }
      contentClassName={ contentClassName }
      scrollRef={ scrollRef }
      getItemKey={ (row) => row.key }
      estimateSize={ estimateSize }
      overscan={ overscan }
      layoutAnimation={ layoutAnimation
        ? {
          ...layoutAnimation,
          getLayoutId: (row) =>
            row.type === 'item'
              ? layoutAnimation.getItemLayoutId?.(row.item, row.ctx)
              : undefined,
        }
        : undefined }
      sizeTransition={ sizeTransition }
      useCachedMeasurements={ useCachedMeasurements }
      itemClassName={ rowClassName }
      onVisibleRangeChange={ handleVisibleRangeChange }
      { ...rest }
    >
      { renderRow }
    </TanstackVirtualList>
  )
}

InnerVirtualGroupList.displayName = 'VirtualGroupList'

export const VirtualGroupList = memo(InnerVirtualGroupList) as typeof InnerVirtualGroupList
