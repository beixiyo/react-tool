'use client'

import type {
  DropdownItem,
  DropdownProps,
  DropdownSection as DropdownSectionType,
} from './types'
import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import { isValidElement, memo } from 'react'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { StackedCards } from '../Card'
import { getPreviewMeta, resolveCollapsedContent, resolveSectionMaxHeight } from './helpers'

export const DropdownSection = memo<DropdownSectionProps>(({
  section,
  sectionLayoutId,
  expanded,
  onToggle,

  selectedId,
  onClick,
  renderItem,

  itemClassName,
  sectionHeaderClassName,
  itemTitleClassName,
  itemDescClassName,
  itemActiveClassName,
  itemInactiveClassName,

  sectionMaxHeight,
  collapsedPreview,
  normalizedCollapsedLayers,
  collapsedPreviewClickable,
  collapsedPreviewClassName,
  renderCollapsedItem,
  renderCollapsedContent,
  collapsedStackedCards,
}) => {
  const maxHeight = resolveSectionMaxHeight(section, sectionMaxHeight)

  const defaultRenderItem = (item: DropdownItem) => (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          { item.label && (
            <h3 className={ cn('truncate text-sm font-medium text-text', itemTitleClassName) }>
              { item.label }
            </h3>
          ) }
          { item.timestamp && (
            <span className="text-xs text-text3">
              { new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }) }
            </span>
          ) }
        </div>

        <div className="mt-1 flex items-center gap-2">
          { item.tag && (
            <span
              className={ cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                item.tagColor || 'bg-background2/70 text-text2 border border-border/60',
              ) }
            >
              { item.tag }
            </span>
          ) }
          { item.desc && (
            <p className={ cn('truncate text-sm text-text2', itemDescClassName) }>
              { item.desc }
            </p>
          ) }
        </div>
      </div>
    </div>
  )

  const renderDropdownItem = (item: DropdownItem) => {
    if (item.customContent)
      return item.customContent
    if (renderItem)
      return renderItem(item)
    return defaultRenderItem(item)
  }

  const getItemClassName = (item: DropdownItem) => cn(
    'px-4 py-3 cursor-pointer border-l-4 transition-all duration-300',
    selectedId === item.id
      ? ['bg-brand/10 border-brand', itemActiveClassName]
      : ['border-transparent hover:bg-background2/50 hover:border-border', itemInactiveClassName],
  )

  const rawItems = Array.isArray(section.items)
    ? section.items
    : []

  const previewMeta = getPreviewMeta(rawItems, selectedId, collapsedPreview, normalizedCollapsedLayers)
  const previewItemIds = previewMeta.previewItemIds

  const collapsedItems = Array.isArray(section.items)
    ? (section.collapsedPreviewItems ?? section.items)
    : (section.collapsedPreviewItems ?? [])

  const collapsedMeta = getPreviewMeta(collapsedItems, selectedId, collapsedPreview, normalizedCollapsedLayers)
  const previewItems = collapsedMeta.previewItems

  const overrideContent = resolveCollapsedContent(section, renderCollapsedContent)
  const previewLayersContent = overrideContent.length > 0
    ? overrideContent.slice(0, normalizedCollapsedLayers)
    : (previewItems.length > 0
        ? previewItems.map((previewRow, index) => {
            const isTopLayer = index === 0

            return (
              <motion.div
                key={ previewRow.id }
                layout
                layoutId={ `${sectionLayoutId}-${previewRow.id}` }
                className={ cn(
                  getItemClassName(previewRow),
                  !isTopLayer && 'opacity-0',
                ) }
              >
                { renderCollapsedItem
                  ? renderCollapsedItem(previewRow)
                  : renderDropdownItem(previewRow) }
              </motion.div>
            )
          })
        : [])

  const previewLayers = previewLayersContent.length

  const content = isValidElement(section.items)
    ? section.items
    : rawItems.length > 0
      ? rawItems.map((rowItem) => {
          const isBoundLayer = collapsedPreview && expanded && previewItemIds.has(rowItem.id)
          const layoutId = isBoundLayer
            ? `${sectionLayoutId}-${rowItem.id}`
            : undefined
          const initial = isBoundLayer
            ? false
            : (collapsedPreview
                ? { y: 12, opacity: 0 }
                : { x: -20, opacity: 0 })
          const animate = isBoundLayer
            ? { opacity: 1 }
            : (collapsedPreview
                ? { y: 0, opacity: 1 }
                : { x: 0, opacity: 1 })
          const exit = collapsedPreview
            ? { y: 12, opacity: 0 }
            : { x: -20, opacity: 0 }

          return (
            <motion.div
              key={ rowItem.id }
              layout={ collapsedPreview }
              layoutId={ layoutId }
              initial={ initial }
              animate={ animate }
              exit={ exit }
              transition={ { duration: 0.2 } }
              className={ getItemClassName(rowItem) }
              onClick={ () => onClick?.(rowItem.id) }
            >
              { renderDropdownItem(rowItem) }
            </motion.div>
          )
        })
      : null

  return (
    <div className={ itemClassName }>
      { section.header
        ? (
            <div onClick={ onToggle }>
              { typeof section.header === 'function'
                ? section.header(expanded)
                : section.header }
            </div>
          )
        : (
            <div
              onClick={ onToggle }
              className={ cn(
                'w-full flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-text2 transition-all duration-300 hover:opacity-50',
              ) }
            >
              <span className={ sectionHeaderClassName }>{ section.name }</span>
              <motion.div
                animate={ {
                  rotate: expanded
                    ? 180
                    : 0,
                } }
                transition={ { duration: 0.2 } }
              >
                <ChevronDown className="h-4 w-4 text-text3" />
              </motion.div>
            </div>
          ) }

      { collapsedPreview && (
        <AnimateShow
          show={ !expanded }
          className={ cn('', collapsedPreviewClassName) }
        >
          { previewLayers > 0 && (
            <div
              onClick={ () => {
                if (collapsedPreviewClickable)
                  onToggle()
              } }
              className={ cn(
                collapsedPreviewClickable && 'cursor-pointer',
              ) }
            >
              <StackedCards
                { ...collapsedStackedCards }
                autoHeight
                layers={ previewLayers as 1 | 2 | 3 }
                layersContent={ previewLayersContent }
              />
            </div>
          ) }
        </AnimateShow>
      ) }

      <AnimateShow
        show={ expanded }
        className="overflow-hidden"
        visibilityMode
      >
        { !maxHeight
          ? content
          : isValidElement(section.items)
            ? (
                <div style={ { height: maxHeight } }>
                  { content }
                </div>
              )
            : (
                <div
                  className="overflow-y-auto"
                  style={ { maxHeight } }
                >
                  { content }
                </div>
              ) }
      </AnimateShow>
    </div>
  )
})

DropdownSection.displayName = 'DropdownSection'

export type DropdownSectionProps = {
  section: DropdownSectionType
  sectionLayoutId: string
  expanded: boolean
  onToggle: () => void

  selectedId: DropdownProps['selectedId']
  onClick: DropdownProps['onClick']
  renderItem: DropdownProps['renderItem']

  itemClassName: DropdownProps['itemClassName']
  sectionHeaderClassName: DropdownProps['sectionHeaderClassName']
  itemTitleClassName: DropdownProps['itemTitleClassName']
  itemDescClassName: DropdownProps['itemDescClassName']
  itemActiveClassName: DropdownProps['itemActiveClassName']
  itemInactiveClassName: DropdownProps['itemInactiveClassName']

  sectionMaxHeight: DropdownProps['sectionMaxHeight']
  collapsedPreview: boolean
  normalizedCollapsedLayers: 1 | 2 | 3
  collapsedPreviewClickable: boolean
  collapsedPreviewClassName: DropdownProps['collapsedPreviewClassName']
  renderCollapsedItem: DropdownProps['renderCollapsedItem']
  renderCollapsedContent: DropdownProps['renderCollapsedContent']
  collapsedStackedCards: DropdownProps['collapsedStackedCards']
}
