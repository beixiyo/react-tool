'use client'

import { useFloatingPosition } from 'hooks'
import { ArrowUpDown, Hash, History, Search, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ComponentType } from 'react'
import { memo, useEffect, useRef, useState } from 'react'
import type { CursorPosition } from 'utils'
import { cn, trackCursorCoord } from 'utils'
import { INTERNAL_DATA_ATTR } from '../../../constants/dataAttributes'
import { useT } from '../../../i18n'
import { usePanelKeyboardNavigation } from '../hooks'
import type { AutoCompletePanelProps, AutoCompleteSuggestion } from '../types'
import { PANEL_FOOTER_CLS, PANEL_ITEM_ACTIVE_CLS, PANEL_ITEM_CLS, PANEL_MOTION_VARIANTS, PANEL_SURFACE_CLS, PanelShortcut, PanelState } from './PanelPrimitives'

const SUGGESTION_ICONS: Record<AutoCompleteSuggestion['type'], ComponentType<{ className?: string }>> = {
  template: Sparkles,
  history: History,
  keyword: Hash,
}

export const AutoCompletePanel = memo<AutoCompletePanelProps>(
  ({ visible, suggestions, selectedIndex, loading = false, className, inputElement, followCursor = true, onSuggestionSelect, onClose, onSelectionChange }) => {
    const t = useT()
    const panelRef = useRef<HTMLDivElement>(null)
    const virtualReferenceRef = useRef<HTMLElement>(null)
    const inputRef = useRef<HTMLElement | null>(inputElement ?? null)
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
    const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0, height: 0 })
    const shouldShow = visible && (loading || suggestions.length > 0)

    inputRef.current = inputElement ?? null

    useEffect(() =>
      trackCursorCoord(
        visible && followCursor
          ? inputElement
          : null,
        setCursorPosition,
      ), [followCursor, inputElement, visible])

    const virtualReference = cursorPosition.x || cursorPosition.y
      ? new DOMRect(cursorPosition.x, cursorPosition.y, 0, cursorPosition.height)
      : null

    const { style } = useFloatingPosition(virtualReferenceRef, panelRef, {
      enabled: visible && !!virtualReference,
      placement: 'bottom-start',
      offset: 6,
      boundaryPadding: 8,
      flip: true,
      shift: true,
      autoUpdate: true,
      scrollCapture: true,
      virtualReferenceRect: virtualReference,
    })

    useEffect(() => {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
    }, [selectedIndex])

    usePanelKeyboardNavigation({
      active: shouldShow,
      targetRef: inputRef,
      itemCount: suggestions.length,
      highlightedIndex: selectedIndex,
      confirmKey: 'Tab',
      wrap: true,
      onHighlightChange: (index) => onSelectionChange?.(index),
      onConfirm: (index) => onSuggestionSelect(suggestions[index]),
      onClose,
    })

    return (
      <AnimatePresence>
        { shouldShow && (
          <motion.div
            key="autocomplete-panel"
            ref={ panelRef }
            { ...{ [INTERNAL_DATA_ATTR.chatInput.panel]: 'autocomplete' } }
            className={ cn('fixed z-dropdown w-96 max-w-[calc(100vw-1rem)]', PANEL_SURFACE_CLS, className) }
            style={ style }
            aria-label={ t('chatInput.autoCompletePanel.title') }
            variants={ PANEL_MOTION_VARIANTS }
            initial="initial"
            animate="animate"
            exit="exit"
          >
            { loading
              ? <PanelState loading icon={ Search } title={ t('chatInput.autoCompletePanel.loading') } />
              : (
                <div className="max-h-64 overflow-y-auto p-1.5" role="listbox">
                  { suggestions.map((suggestion, index) => {
                    const Icon = SUGGESTION_ICONS[suggestion.type]
                    const description = getTemplateDescription(suggestion)

                    return (
                      <button
                        key={ `${suggestion.type}-${suggestion.text}-${index}` }
                        ref={ (element) => {
                          itemRefs.current[index] = element
                        } }
                        type="button"
                        role="option"
                        aria-selected={ selectedIndex === index }
                        className={ cn(PANEL_ITEM_CLS, 'flex items-start gap-2.5', selectedIndex === index && PANEL_ITEM_ACTIVE_CLS) }
                        onMouseEnter={ () => onSelectionChange?.(index) }
                        onClick={ () => onSuggestionSelect(suggestion) }
                      >
                        <Icon
                          className={ cn(
                            'mt-0.5 size-4 shrink-0',
                            selectedIndex === index
                              ? 'text-brand'
                              : 'text-text2',
                          ) }
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm text-text">{ suggestion.text }</span>
                            <span className="shrink-0 rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                              { t(`chatInput.autoCompletePanel.labels.${suggestion.type}`) }
                            </span>
                          </span>
                          { description && <span className="mt-0.5 block truncate text-xs text-text2">{ description }</span> }
                        </span>
                      </button>
                    )
                  }) }
                </div>
              ) }

            { !loading && suggestions.length > 0 && (
              <div className={ cn(PANEL_FOOTER_CLS, 'flex items-center justify-between gap-3') }>
                <PanelShortcut icon={ ArrowUpDown } keys="↑↓" label={ t('chatInput.autoCompletePanel.navigate') } />
                <span className="flex items-center gap-3">
                  <PanelShortcut icon={ Sparkles } keys="Tab" label={ t('chatInput.autoCompletePanel.select') } />
                  <span>{ t('chatInput.autoCompletePanel.suggestionCount', { count: suggestions.length }) }</span>
                </span>
              </div>
            ) }
          </motion.div>
        ) }
      </AnimatePresence>
    )
  },
)

AutoCompletePanel.displayName = 'AutoCompletePanel'

function getTemplateDescription(suggestion: AutoCompleteSuggestion) {
  if (suggestion.type !== 'template' || !suggestion.source || !('category' in suggestion.source)) return undefined

  return suggestion.source.description
}
