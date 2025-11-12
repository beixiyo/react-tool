'use client'

import type { ChatInputProps, PromptCategory } from './types'
import { motion } from 'framer-motion'
import { memo, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { AutoCompletePanel, BottomBar, ChatInputArea, HistoryPanel, PromptPanel, UploadedFilePreview } from './components'
import { PROMPT_CATEGORIES } from './constants'
import {
  useAutoComplete,
  useFileHandling,
  useInputHistory,
  useInteractionHandlers,
  usePanelManager,
  usePromptTemplates,
  useShortcuts,
  useValueManager,
} from './hooks'

/**
 * ChatInput 统一组件
 * 支持提示词模板、输入历史、自动补全、文件上传等功能
 */
export const ChatInput = memo<ChatInputProps>((props) => {
  const {
    value,
    placeholder,
    disabled = false,
    loading = false,
    enablePromptTemplates = true,
    enableHistory = true,
    enableAutoComplete = true,
    customTemplates,
    maxHistoryCount = 50,
    showUploader = true,
    showQuickMode = true,
    quickMode = false,
    uploadedFiles = [],
    containerClassName,
    className,
    style,
    onChange,
    onSubmit,
    onTemplateSelect,
    onHistorySelect,
    onQuickModeChange,
    onFocus,
    onBlur,
    onFilesChange,
    onFileRemove,
  } = props

  /** 状态管理 */
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>()
  const [promptHighlightIndex, setPromptHighlightIndex] = useState(0)
  const [historyHighlightIndex, setHistoryHighlightIndex] = useState(0)
  const bottomBarHeight = 40

  /** Refs */
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatInputAreaRef = useRef<HTMLDivElement>(null)

  /** 稳定化的模板引用 */
  const stableTemplates = useMemo(() => customTemplates || [], [customTemplates])

  /** 自定义 Hooks */
  const { actualValue, handleChangeVal } = useValueManager(value, onChange)
  const { handleFilesChange } = useFileHandling(onFilesChange)

  const {
    showPromptPanel,
    setShowPromptPanel,
    showHistoryPanel,
    setShowHistoryPanel,
    showAutoComplete,
    setShowAutoComplete,
    closeAllPanels,
    handleShowPromptPanelToggle,
    handleShowHistoryPanelToggle,
  } = usePanelManager(containerRef)

  const promptTemplatesHook = usePromptTemplates(stableTemplates)
  const inputHistoryHook = useInputHistory(maxHistoryCount)
  const autoCompleteHook = useAutoComplete(promptTemplatesHook.templates, inputHistoryHook.histories, enableAutoComplete)

  const {
    handleInputChange,
    handleSubmit,
    handleTemplateSelect,
    handleHistorySelect,
    handleAutoCompleteSelect,
  } = useInteractionHandlers({
    loading,
    disabled,
    enableHistory,
    enableAutoComplete,
    onSubmit,
    onTemplateSelect,
    onHistorySelect,
    actualValue,
    handleChangeVal,
    setShowPromptPanel,
    setShowHistoryPanel,
    setShowAutoComplete,
    closeAllPanels,
    setSearchQuery,
    textareaRef,
    promptTemplatesHook,
    inputHistoryHook,
    autoCompleteHook,
  })

  useShortcuts({
    enablePromptTemplates,
    setShowPromptPanel,
    setPromptHighlightIndex,
    enableHistory,
    setShowHistoryPanel,
    setHistoryHighlightIndex,
    setShowAutoComplete,
    handleSubmit,
    setSearchQuery,
    textareaRef,
  })

  return (<>
    <motion.div
      ref={ containerRef }
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      exit={ { opacity: 0, y: -20 } }
      transition={ { duration: 0.3 } }
      className={ cn(
        'relative w-full mx-auto',
        containerClassName,
      ) }
      style={ style }
    >
      { showUploader && <UploadedFilePreview uploadedFiles={ uploadedFiles } onFileRemove={ onFileRemove } /> }

      {/* 主输入区域 */ }
      <div
        className={ cn(
          'relative h-32 rounded-3xl transition-all duration-300',
          isFocused
            ? 'shadow-card-inset'
            : 'shadow-card',
          showUploader && !disabled && 'cursor-text',
          className,
        ) }
      >
        <div
          ref={ chatInputAreaRef }
          className={ cn(
            'relative h-full w-full rounded-3xl overflow-hidden',
          ) }
        >
          <ChatInputArea
            textareaRef={ textareaRef }
            value={ actualValue }
            onChange={ handleInputChange }
            onFocus={ () => {
              setIsFocused(true)
              onFocus?.()
            } }
            onBlur={ () => {
              setIsFocused(false)
              onBlur?.()
            } }
            onPressEnter={ (e) => {
              /** 阻止事件冒泡，允许普通Enter键换行 */
              e.stopPropagation()
            } }
            placeholder={ placeholder }
            disabled={ disabled }
            bottomBarHeight={ bottomBarHeight }
          />

          {/* 底部控制区域 */ }
          <BottomBar
            bottomBarHeight={ bottomBarHeight }
            enablePromptTemplates={ enablePromptTemplates }
            enableHistory={ enableHistory }
            showQuickMode={ showQuickMode }
            showUploader={ showUploader }
            quickMode={ quickMode }
            loading={ loading }
            disabled={ disabled }
            actualValue={ actualValue }
            showPromptPanel={ showPromptPanel }
            showHistoryPanel={ showHistoryPanel }
            textareaRef={ textareaRef }
            chatInputAreaRef={ chatInputAreaRef }
            onQuickModeChange={ onQuickModeChange }
            onFilesChange={ handleFilesChange }
            onFileRemove={ onFileRemove }
            onSubmit={ handleSubmit }
            onShowPromptPanelToggle={ handleShowPromptPanelToggle }
            onShowHistoryPanelToggle={ handleShowHistoryPanelToggle }
          />
        </div>
      </div>
    </motion.div>

    {/* 提示词面板 */ }
    <PromptPanel
      visible={ showPromptPanel }
      searchQuery={ searchQuery }
      selectedCategory={ selectedCategory }
      highlightedIndex={ promptHighlightIndex }
      templates={ selectedCategory
        ? promptTemplatesHook.getTemplatesByCategory(selectedCategory)
        : promptTemplatesHook.searchTemplates(searchQuery) }
      categories={ PROMPT_CATEGORIES }
      onTemplateSelect={ handleTemplateSelect }
      onCategorySelect={ setSelectedCategory }
      onClose={ () => setShowPromptPanel(false) }
      onHighlightChange={ setPromptHighlightIndex }
    />

    {/* 历史记录面板 */ }
    <HistoryPanel
      visible={ showHistoryPanel }
      searchQuery={ searchQuery }
      highlightedIndex={ historyHighlightIndex }
      histories={ inputHistoryHook.searchHistory(searchQuery) }
      onHistorySelect={ handleHistorySelect }
      onHistoryDelete={ inputHistoryHook.deleteHistory }
      onClearAll={ inputHistoryHook.clearAllHistory }
      onClose={ () => setShowHistoryPanel(false) }
      onHighlightChange={ setHistoryHighlightIndex }
    />

    {/* 自动补全面板 */ }
    <AutoCompletePanel
      visible={ showAutoComplete && !showPromptPanel && !showHistoryPanel }
      suggestions={ autoCompleteHook.suggestions }
      selectedIndex={ autoCompleteHook.suggestions.findIndex(s => s === autoCompleteHook.getSelectedSuggestion()) }
      inputElement={ textareaRef.current }
      followCursor
      onSuggestionSelect={ handleAutoCompleteSelect }
      onClose={ () => setShowAutoComplete(false) }
      onSelectionChange={ (index) => {
        if (index >= 0 && index < autoCompleteHook.suggestions.length) {
          autoCompleteHook.selectNext()
        }
        else {
          autoCompleteHook.selectPrevious()
        }
      } }
    />
  </>)
})

ChatInput.displayName = 'ChatInput'
