'use client'

import { ArrowUpDown, BookOpen, Clock, CornerDownLeft, History, Search, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { INTERNAL_DATA_ATTR } from '../../../constants/dataAttributes'
import { useT } from '../../../i18n'
import { usePanelKeyboardNavigation } from '../hooks'
import type { HistoryPanelProps } from '../types'
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

export const HistoryPanel = memo<HistoryPanelProps>(
  ({ visible, loading = false, highlightedIndex, histories, className, onHistorySelect, onHistoryDelete, onClearAll, onClose, onHighlightChange }) => {
    const t = useT()
    const panelRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const reactId = useId()
    const titleId = `${reactId}-title`
    const listId = `${reactId}-list`

    const filteredHistories = useMemo(() => {
      const query = searchQuery.trim().toLocaleLowerCase()
      return query
        ? histories.filter((history) => history.content.toLocaleLowerCase().includes(query))
        : histories
    }, [histories, searchQuery])

    useEffect(() => {
      if (visible) searchInputRef.current?.focus()
      else setSearchQuery('')
    }, [visible])

    useEffect(() => {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }, [highlightedIndex])

    useEffect(() => {
      if (filteredHistories.length > 0 && highlightedIndex >= filteredHistories.length) onHighlightChange(filteredHistories.length - 1)
    }, [filteredHistories.length, highlightedIndex, onHighlightChange])

    usePanelKeyboardNavigation({
      active: visible,
      targetRef: panelRef,
      itemCount: filteredHistories.length,
      highlightedIndex,
      onHighlightChange,
      onConfirm: (index) => onHistorySelect(filteredHistories[index]),
      onClose,
    })

    return (
      <AnimatePresence>
        { visible && (
          <motion.div
            key="history-panel"
            className="pointer-events-none fixed inset-x-0 top-20 z-dropdown flex justify-center px-4"
            variants={ PANEL_MOTION_VARIANTS }
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div
              ref={ panelRef }
              { ...{ [INTERNAL_DATA_ATTR.chatInput.panel]: 'history' } }
              className={ cn(
                'pointer-events-auto flex max-h-[min(31rem,calc(100vh-6rem))] w-full max-w-xl flex-col',
                PANEL_SURFACE_CLS,
                className,
              ) }
              aria-labelledby={ titleId }
            >
              <div className={ PANEL_HEADER_CLS }>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <History className="size-4 shrink-0 text-brand" />
                    <h3 id={ titleId } className="truncate text-sm font-semibold text-text">
                      { t('chatInput.historyPanel.title') }
                    </h3>
                    <span className="shrink-0 text-xs text-text2">{ t('chatInput.historyPanel.recordCount', { count: histories.length }) }</span>
                  </div>
                  { histories.length > 0 && (
                    <button
                      type="button"
                      className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs text-danger transition-colors hover:bg-dangerBg focus-visible:ring-1 focus-visible:ring-danger/30 focus-visible:outline-none"
                      onClick={ onClearAll }
                    >
                      <Trash2 className="size-3.5" />
                      { t('chatInput.historyPanel.clearAll') }
                    </button>
                  ) }
                </div>

                <PanelSearchInput
                  ref={ searchInputRef }
                  value={ searchQuery }
                  placeholder={ t('chatInput.historyPanel.searchPlaceholder') }
                  clearLabel={ t('chatInput.buttons.clearSearch') }
                  controls={ listId }
                  activeDescendant={ filteredHistories[highlightedIndex]
                    ? `${reactId}-item-${filteredHistories[highlightedIndex].id}`
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
              </div>

              <div id={ listId } className="min-h-0 flex-1 overflow-y-auto p-1.5" role="listbox">
                { loading ? <PanelState loading icon={ History } title={ t('chatInput.historyPanel.loading') } /> : filteredHistories.length > 0
                  ? (
                    filteredHistories.map((history, index) => (
                      <div key={ history.id } className="group flex items-start gap-1">
                        <button
                          ref={ (element) => {
                            itemRefs.current[index] = element
                          } }
                          id={ `${reactId}-item-${history.id}` }
                          type="button"
                          role="option"
                          aria-selected={ highlightedIndex === index }
                          className={ cn(PANEL_ITEM_CLS, 'min-w-0 flex-1', highlightedIndex === index && PANEL_ITEM_ACTIVE_CLS) }
                          onMouseEnter={ () => onHighlightChange(index) }
                          onClick={ () => onHistorySelect(history) }
                        >
                          <span className="line-clamp-2 text-sm leading-5 text-text">{ history.content }</span>
                          <span className="mt-1.5 flex items-center gap-3 text-xs text-text2">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3.5" />
                              { formatRelativeTime(history.timestamp, t) }
                            </span>
                            { history.templateId && (
                              <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-brand/10 px-1.5 py-0.5 text-brand">
                                <BookOpen className="size-3.5 shrink-0" />
                                <span className="truncate">{ t('chatInput.historyPanel.labels.template') }</span>
                              </span>
                            ) }
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={ t('chatInput.historyPanel.deleteHistory') }
                          className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-text2 opacity-70 transition-colors group-hover:opacity-100 hover:bg-dangerBg hover:text-danger focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-danger/30 focus-visible:outline-none"
                          onClick={ () => onHistoryDelete(history.id) }
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))
                  )
                  : (
                    <PanelState
                      icon={ searchQuery
                        ? Search
                        : History }
                      title={ searchQuery
                        ? t('chatInput.historyPanel.emptyState.noResults')
                        : t('chatInput.historyPanel.emptyState.noHistory') }
                      description={ searchQuery
                        ? t('chatInput.historyPanel.emptyState.noResultsDesc')
                        : t('chatInput.historyPanel.emptyState.noHistoryDesc') }
                    />
                  ) }
              </div>

              <div className={ cn(PANEL_FOOTER_CLS, 'flex flex-wrap items-center justify-between gap-2') }>
                <span className="flex items-center gap-3">
                  <PanelShortcut icon={ ArrowUpDown } keys="↑↓" label={ t('chatInput.historyPanel.shortcuts.select') } />
                  <PanelShortcut icon={ CornerDownLeft } keys="Enter" label={ t('chatInput.historyPanel.shortcuts.confirm') } />
                </span>
                <PanelShortcut icon={ X } keys="Esc" label={ t('chatInput.historyPanel.shortcuts.cancel') } />
              </div>
            </div>
          </motion.div>
        ) }
      </AnimatePresence>
    )
  },
)

HistoryPanel.displayName = 'HistoryPanel'

function formatRelativeTime(timestamp: number, t: (key: string, options?: Record<string, unknown>) => string) {
  const diff = Date.now() - timestamp

  if (diff < 60_000) return t('chatInput.historyPanel.labels.justNow')
  if (diff < 3_600_000) return t('chatInput.historyPanel.labels.minutesAgo', { count: Math.floor(diff / 60_000) })
  if (diff < 86_400_000) return t('chatInput.historyPanel.labels.hoursAgo', { count: Math.floor(diff / 3_600_000) })
  if (diff < 604_800_000) return t('chatInput.historyPanel.labels.daysAgo', { count: Math.floor(diff / 86_400_000) })

  return new Date(timestamp).toLocaleDateString()
}
