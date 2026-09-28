'use client'

import { ArrowUpDown, Clock, CornerDownLeft, Hash, Search, Sparkles, Star, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { INTERNAL_DATA_ATTR } from '../../../constants/dataAttributes'
import { useT } from '../../../i18n'
import { usePanelKeyboardNavigation } from '../hooks'
import type { PromptPanelProps } from '../types'
import {
  PANEL_FOOTER_CLS,
  PANEL_HEADER_CLS,
  PANEL_ITEM_ACTIVE_CLS,
  PANEL_ITEM_CLS,
  PANEL_MOTION_VARIANTS,
  PANEL_SURFACE_CLS,
  PanelSearchInput,
  PanelShortcut,
  PanelState,
} from './PanelPrimitives'

export const PromptPanel = memo<PromptPanelProps>(
  ({
    visible,
    loading = false,
    selectedCategory,
    highlightedIndex,
    templates,
    categories,
    className,
    onTemplateSelect,
    onCategorySelect,
    onClose,
    onHighlightChange,
  }) => {
    const t = useT()
    const panelRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const reactId = useId()
    const titleId = `${reactId}-title`
    const listId = `${reactId}-list`

    const filteredTemplates = useMemo(() => {
      const query = searchQuery.trim().toLocaleLowerCase()

      return templates.filter((template) => {
        if (selectedCategory && template.category !== selectedCategory) return false
        if (!query) return true

        return (
          template.title.toLocaleLowerCase().includes(query)
          || template.content.toLocaleLowerCase().includes(query)
          || template.description?.toLocaleLowerCase().includes(query)
          || template.tags?.some((tag) => tag.toLocaleLowerCase().includes(query))
        )
      })
    }, [searchQuery, selectedCategory, templates])

    useEffect(() => {
      if (visible) searchInputRef.current?.focus()
      else setSearchQuery('')
    }, [visible])

    useEffect(() => {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }, [highlightedIndex])

    useEffect(() => {
      if (filteredTemplates.length > 0 && highlightedIndex >= filteredTemplates.length) onHighlightChange(filteredTemplates.length - 1)
    }, [filteredTemplates.length, highlightedIndex, onHighlightChange])

    usePanelKeyboardNavigation({
      active: visible,
      targetRef: panelRef,
      itemCount: filteredTemplates.length,
      highlightedIndex,
      onHighlightChange,
      onConfirm: (index) => onTemplateSelect(filteredTemplates[index]),
      onClose,
    })

    return (
      <AnimatePresence>
        { visible && (
          <motion.div
            key="prompt-panel"
            className="pointer-events-none fixed inset-x-0 top-20 z-dropdown flex justify-center px-4"
            variants={ PANEL_MOTION_VARIANTS }
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div
              ref={ panelRef }
              { ...{ [INTERNAL_DATA_ATTR.chatInput.panel]: 'prompt' } }
              className={ cn(
                'pointer-events-auto flex max-h-[min(34rem,calc(100vh-6rem))] w-full max-w-xl flex-col',
                PANEL_SURFACE_CLS,
                className,
              ) }
              aria-labelledby={ titleId }
            >
              <div className={ PANEL_HEADER_CLS }>
                <div className="mb-3 flex min-w-0 items-center gap-2">
                  <Sparkles className="size-4 shrink-0 text-brand" />
                  <h3 id={ titleId } className="truncate text-sm font-semibold text-text">
                    { t('chatInput.promptPanel.title') }
                  </h3>
                  <span className="shrink-0 text-xs text-text2">{ t('chatInput.promptPanel.templateCount', { count: templates.length }) }</span>
                </div>

                <PanelSearchInput
                  ref={ searchInputRef }
                  value={ searchQuery }
                  placeholder={ t('chatInput.promptPanel.searchPlaceholder') }
                  clearLabel={ t('chatInput.buttons.clearSearch') }
                  controls={ listId }
                  activeDescendant={ filteredTemplates[highlightedIndex]
                    ? `${reactId}-item-${filteredTemplates[highlightedIndex].id}`
                    : undefined }
                  onChange={ (value) => {
                    setSearchQuery(value)
                    onHighlightChange(0)
                  } }
                  onClear={ () => {
                    setSearchQuery('')
                    onHighlightChange(0)
                    searchInputRef.current?.focus()
                  } }
                />

                <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    aria-pressed={ !selectedCategory }
                    className={ categoryButtonClass(!selectedCategory) }
                    onClick={ () => {
                      onCategorySelect(undefined)
                      onHighlightChange(0)
                    } }
                  >
                    { t('chatInput.promptPanel.allCategories') }
                  </button>
                  { categories.map((category) => (
                    <button
                      key={ category.key }
                      type="button"
                      aria-pressed={ selectedCategory === category.key }
                      className={ categoryButtonClass(selectedCategory === category.key) }
                      onClick={ () => {
                        onCategorySelect(category.key)
                        onHighlightChange(0)
                      } }
                    >
                      <span className="flex size-3.5 items-center justify-center [&>*]:size-full">{ category.icon }</span>
                      { t(`chatInput.categories.${category.key}`) }
                    </button>
                  )) }
                </div>
              </div>

              <div id={ listId } className="min-h-0 flex-1 overflow-y-auto p-1.5" role="listbox">
                { loading ? <PanelState loading icon={ Sparkles } title={ t('chatInput.promptPanel.loading') } /> : filteredTemplates.length > 0
                  ? (
                    filteredTemplates.map((template, index) => (
                      <button
                        key={ template.id }
                        ref={ (element) => {
                          itemRefs.current[index] = element
                        } }
                        id={ `${reactId}-item-${template.id}` }
                        type="button"
                        role="option"
                        aria-selected={ highlightedIndex === index }
                        className={ cn(PANEL_ITEM_CLS, 'mb-0.5 block', highlightedIndex === index && PANEL_ITEM_ACTIVE_CLS) }
                        onMouseEnter={ () => onHighlightChange(index) }
                        onClick={ () => onTemplateSelect(template) }
                      >
                        <span className="flex items-center gap-2">
                          { template.icon
                            ? (
                              <span
                                className={ cn(
                                  'flex size-4 shrink-0 items-center justify-center [&>*]:size-full',
                                  highlightedIndex === index
                                    ? 'text-brand'
                                    : 'text-text2',
                                ) }
                              >
                                { template.icon }
                              </span>
                            )
                            : (
                              <Sparkles
                                className={ cn(
                                  'size-4 shrink-0',
                                  highlightedIndex === index
                                    ? 'text-brand'
                                    : 'text-text2',
                                ) }
                              />
                            ) }
                          <span className="truncate text-sm font-medium text-text">{ template.title }</span>
                          { template.isCustom && (
                            <span className="shrink-0 rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                              { t('chatInput.promptPanel.labels.custom') }
                            </span>
                          ) }
                        </span>

                        { template.description && <span className="mt-1 line-clamp-2 block text-xs leading-5 text-text2">{ template.description }</span> }

                        { (template.usageCount || template.createdAt || template.tags?.length) && (
                          <span className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-text2">
                            { !!template.usageCount && (
                              <span className="inline-flex items-center gap-1">
                                <Star className="size-3.5" />
                                { template.usageCount }
                              </span>
                            ) }
                            { !!template.createdAt && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3.5" />
                                { new Date(template.createdAt).toLocaleDateString() }
                              </span>
                            ) }
                            { template.tags?.slice(0, 2).map((tag) => (
                              <span key={ tag } className="inline-flex max-w-28 items-center gap-1 rounded-md bg-brand/10 px-1.5 py-0.5 text-brand">
                                <Hash className="size-3 shrink-0" />
                                <span className="truncate">{ tag }</span>
                              </span>
                            )) }
                          </span>
                        ) }
                      </button>
                    ))
                  )
                  : (
                    <PanelState
                      icon={ searchQuery
                        ? Search
                        : Sparkles }
                      title={ searchQuery
                        ? t('chatInput.promptPanel.emptyState.noResults')
                        : t('chatInput.promptPanel.emptyState.noTemplates') }
                      description={ searchQuery
                        ? t('chatInput.promptPanel.emptyState.noResultsDesc')
                        : t('chatInput.promptPanel.emptyState.noTemplatesDesc') }
                    />
                  ) }
              </div>

              <div className={ cn(PANEL_FOOTER_CLS, 'flex flex-wrap items-center justify-between gap-2') }>
                <span className="flex items-center gap-3">
                  <PanelShortcut icon={ ArrowUpDown } keys="↑↓" label={ t('chatInput.promptPanel.shortcuts.select') } />
                  <PanelShortcut icon={ CornerDownLeft } keys="Enter" label={ t('chatInput.promptPanel.shortcuts.confirm') } />
                </span>
                <PanelShortcut icon={ X } keys="Esc" label={ t('chatInput.promptPanel.shortcuts.cancel') } />
              </div>
            </div>
          </motion.div>
        ) }
      </AnimatePresence>
    )
  },
)

PromptPanel.displayName = 'PromptPanel'

function categoryButtonClass(active: boolean) {
  return cn(
    'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-border2 focus-visible:outline-none',
    active
      ? 'bg-brand/10 text-brand'
      : 'text-text2 hover:bg-background2 hover:text-text',
  )
}
