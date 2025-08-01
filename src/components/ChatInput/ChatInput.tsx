'use client'

import type { AutoCompleteSuggestion, ChatInputProps, InputHistory, PromptCategory, PromptTemplate } from './types'
import { Button } from '@/components/Button'
import { LazyImg } from '@/components/LazyImg'
import { RmBtn } from '@/components/RmBtn'
import { Switch } from '@/components/Switch'
import { Textarea } from '@/components/Textarea'
import { Tooltip } from '@/components/Tooltip'
import { Uploader } from '@/components/Uploader'
import { useClickOutside, useShortCutKey } from '@/hooks'
import { cn } from '@/utils'
import { motion } from 'framer-motion'
import { ArrowUpFromDot, Command, HelpCircle, History, Paperclip, Sparkles } from 'lucide-react'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AutoCompletePanel, HistoryPanel, PromptPanel } from './components'
import { PROMPT_CATEGORIES } from './constants'
import {
  useAutoComplete,
  useInputHistory,
  usePromptTemplates,
} from './hooks'

/**
 * ChatInput 统一组件
 * 支持提示词模板、输入历史、自动补全、文件上传等功能
 */
export const ChatInput = memo<ChatInputProps>((
  {
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
  },
) => {
  const { t } = useTranslation()

  /** 状态管理 */
  const [isFocused, setIsFocused] = useState(false)
  const bottomBarHeight = 40

  const [internalVal, setInternalVal] = useState<string>('')
  const isControlMode = value !== undefined
  const actualValue = isControlMode
    ? value
    : internalVal
  const handleChangeVal = useCallback(
    (val: string) => {
      isControlMode
        ? onChange?.(val)
        : setInternalVal(val)
    },
    [isControlMode, onChange],
  )

  const [showPromptPanel, setShowPromptPanel] = useState(false)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [showAutoComplete, setShowAutoComplete] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>()
  const [promptHighlightIndex, setPromptHighlightIndex] = useState(0)
  const [historyHighlightIndex, setHistoryHighlightIndex] = useState(0)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  /** 用于整个输入区域的引用，作为拖拽区域 */
  const chatInputAreaRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const stableTemplate = customTemplates || useMemo(
    () => [],
    [],
  )

  /** 处理文件上传 */
  const handleFilesChange = useCallback((files: { base64: string }[]) => {
    onFilesChange?.(files.map(item => item.base64))
  }, [onFilesChange])

  /** 自定义 Hooks */
  // #region
  const {
    templates,
    searchTemplates,
    incrementUsage,
    getTemplatesByCategory,
  } = usePromptTemplates(stableTemplate)

  const {
    histories,
    addHistory,
    deleteHistory,
    clearAllHistory,
    searchHistory,
    getPreviousHistory,
    getNextHistory,
    resetHistoryNavigation,
  } = useInputHistory(maxHistoryCount)

  const {
    suggestions,
    generateSuggestions,
    selectPrevious: selectPreviousSuggestion,
    selectNext: selectNextSuggestion,
    getSelectedSuggestion,
    clearSuggestions,
  } = useAutoComplete(templates, histories, enableAutoComplete)

  /** 处理输入变化 */
  const handleInputChange = useCallback(
    (value: string) => {
      handleChangeVal(value)

      /** 重置历史记录导航 */
      resetHistoryNavigation()

      /** 生成自动补全建议 */
      if (enableAutoComplete && value.trim()) {
        setSearchQuery(value)
        generateSuggestions(value)
        setShowAutoComplete(true)
      }
      else {
        setShowAutoComplete(false)
        clearSuggestions()
      }
    },
    [clearSuggestions, enableAutoComplete, generateSuggestions, handleChangeVal, resetHistoryNavigation],
  )

  /** 处理提交 */
  const handleSubmit = useCallback(() => {
    if (!actualValue.trim() || loading || disabled)
      return

    /** 添加到历史记录 */
    if (enableHistory) {
      addHistory(actualValue.trim())
    }

    onSubmit?.(actualValue.trim())

    /** 清空输入 */
    handleChangeVal('')

    /** 关闭所有面板 */
    setShowPromptPanel(false)
    setShowHistoryPanel(false)
    setShowAutoComplete(false)
  }, [addHistory, disabled, enableHistory, handleChangeVal, loading, onSubmit, actualValue])

  /** 处理模板选择 */
  const handleTemplateSelect = useCallback((template: PromptTemplate) => {
    handleChangeVal(template.content)
    onTemplateSelect?.(template)

    /** 增加使用次数 */
    incrementUsage(template.id)

    /** 关闭面板并聚焦输入框 */
    setShowPromptPanel(false)
    textareaRef.current?.focus()
  }, [handleChangeVal, incrementUsage, onTemplateSelect])

  /** 处理历史记录选择 */
  const handleHistorySelect = useCallback((history: InputHistory) => {
    handleChangeVal(history.content)
    onHistorySelect?.(history)

    /** 关闭面板并聚焦输入框 */
    setShowHistoryPanel(false)
    textareaRef.current?.focus()
  }, [handleChangeVal, onHistorySelect])

  /** 处理自动补全选择 */
  const handleAutoCompleteSelect = useCallback((suggestion: AutoCompleteSuggestion) => {
    if (suggestion.type === 'template' && suggestion.source) {
      handleTemplateSelect(suggestion.source as PromptTemplate)
    }
    else if (suggestion.type === 'history' && suggestion.source) {
      handleHistorySelect(suggestion.source as InputHistory)
    }
    setShowAutoComplete(false)
  }, [handleHistorySelect, handleTemplateSelect])
  // #endregion

  /** 快捷键配置 */
  // #region
  useShortCutKey({
    key: '/',
    ctrl: true,
    fn: (e) => {
      if (enablePromptTemplates) {
        setShowPromptPanel(true)
        setShowHistoryPanel(false)
        setShowAutoComplete(false)
        setSearchQuery('') // 重置搜索查询
        setPromptHighlightIndex(0) // 重置高亮索引
      }
    },
  })

  useShortCutKey({
    key: 'h',
    ctrl: true,
    fn: (e) => {
      if (enableHistory) {
        setShowHistoryPanel(true)
        setShowPromptPanel(false)
        setShowAutoComplete(false)
        setSearchQuery('') // 重置搜索查询
        setHistoryHighlightIndex(0) // 重置高亮索引
      }
    },
  })

  useShortCutKey({
    el: textareaRef.current!,
    key: 'Enter',
    ctrl: true,
    fn: e => handleSubmit(),
  })
  // #endregion

  const clickOutsideOptions = useMemo(() => ({
    enabled: showPromptPanel || showHistoryPanel || showAutoComplete,
    trigger: 'mousedown' as const,
    additionalSelectors: [
      '[data-panel="prompt"]',
      '[data-panel="history"]',
      '[data-panel="autocomplete"]',
    ],
  }), [showPromptPanel, showHistoryPanel, showAutoComplete])

  useClickOutside(
    [containerRef],
    () => {
      setShowPromptPanel(false)
      setShowHistoryPanel(false)
      setShowAutoComplete(false)
    },
    clickOutsideOptions,
  )

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
      {/* 上传文件预览 */ }
      { showUploader && uploadedFiles && uploadedFiles.length > 0 && (
        <div className="absolute left-2 z-20 w-full flex flex-wrap bg-transparent -top-16">
          { uploadedFiles.map((src, idx) => (
            <div
              key={ `uploaded-file-${idx}-${src.slice(0, 10)}` }
              className="relative mb-2 mr-2 inline-block size-14 overflow-hidden rounded shadow dark:border-gray-700 dark:bg-dark"
            >
              <LazyImg
                lazy={ false }
                src={ src }
                alt="preview"
              />
              <RmBtn
                onClick={ () => onFileRemove?.(idx) }
                iconSize={ 12 }
                className="size-4"
              />
            </div>
          )) }
        </div>
      ) }

      {/* 主输入区域 */ }
      <div
        ref={ chatInputAreaRef }
        className={ cn(
          'relative h-32 shadow-[0px_2px_8px_rgba(0,0,0,0.15)] dark:shadow-[0px_2px_8px_rgba(0,0,0,0.5)]',
          'border-slate-300 dark:border-slate-700 border rounded-2xl overflow-hidden',
          showUploader && !disabled && 'cursor-text',
          className,
        ) }
      >
        <Textarea
          ref={ textareaRef }
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
          placeholder={ placeholder || t('chat.chatInput.placeholder') }
          disabled={ disabled }
          className="border-none"
          style={ {
            height: `calc(100% - ${bottomBarHeight}px)`,
          } }
        />

        {/* 底部控制区域 */ }
        <div
          className="w-full flex items-center gap-4 bg-white px-3 pb-2 dark:bg-slate-900"
          style={ {
            height: bottomBarHeight,
          } }
        >
          {/* 快捷键提示 - 悬浮显示 */ }
          <Tooltip
            content={
              <div className="flex items-center gap-4 p-2">
                <span className="flex items-center gap-1">
                  <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + /</div>
                  <Sparkles size={ 12 } />
                  { t('chat.chatInput.shortcuts.templates') }
                </span>
                <span className="flex items-center gap-1">
                  <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + H</div>
                  <History size={ 12 } />
                  { t('chat.chatInput.shortcuts.history') }
                </span>
                <span className="flex items-center gap-1">
                  <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + Enter</div>
                  <ArrowUpFromDot size={ 12 } />
                  { t('chat.chatInput.shortcuts.send') }
                </span>
              </div>
            }
          >
            <button
              className={ cn(
                'rounded-lg transition-all duration-200 cursor-help',
                'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105',
                'translate-y-.5 dark:bg-gray-800 bg-white',
              ) }
            >
              <HelpCircle size={ 22 } strokeWidth={ 1.5 } />
            </button>
          </Tooltip>

          {/* 功能按钮 */ }
          <div className="ml-auto flex items-center gap-2">
            { enablePromptTemplates && (
              <Tooltip content={ <div className="flex items-center gap-2">
                <Command size={ 12 } />
                <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + /</div>
                { t('chat.chatInput.buttons.promptTemplates') }
              </div> }>
                <button
                  onClick={ () => {
                    setShowPromptPanel(!showPromptPanel)
                    if (!showPromptPanel) {
                      setShowHistoryPanel(false)
                      setShowAutoComplete(false)
                    }
                  } }
                  className={ cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
                    'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105',
                    showPromptPanel && 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105',
                  ) }
                >
                  <Sparkles size={ 18 } />
                </button>
              </Tooltip>
            ) }

            { enableHistory && (
              <Tooltip content={ <div className="flex items-center gap-2">
                <Command size={ 12 } />
                <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + H</div>
                { t('chat.chatInput.buttons.inputHistory') }
              </div> }>
                <button
                  onClick={ () => {
                    setShowHistoryPanel(!showHistoryPanel)
                    if (!showHistoryPanel) {
                      setShowPromptPanel(false)
                      setShowAutoComplete(false)
                    }
                  } }
                  className={ cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
                    'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105',
                    showHistoryPanel && 'text-green-500 bg-green-50 dark:bg-green-900/20 scale-105',
                  ) }
                >
                  <History size={ 18 } />
                </button>
              </Tooltip>
            ) }

            {/* 快速模式开关 */ }
            { showQuickMode && (
              <label className="flex items-center gap-2">
                <Switch
                  size="sm"
                  checked={ quickMode }
                  onChange={ onQuickModeChange }
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{ t('chat.chatInput.buttons.quickMode') }</span>
              </label>
            ) }

            { showUploader && (
              <Tooltip content={ t('chat.chatInput.buttons.uploadFile') }>
                <Uploader
                  onChange={ handleFilesChange }
                  onRemove={ onFileRemove }
                  pasteEls={ [textareaRef] }
                  dragAreaEl={ chatInputAreaRef }
                  renderChildrenWithDragArea
                  multiple
                  accept="image/*"
                  placeholder=""
                >
                  <button
                    className={ cn(
                      'p-2 rounded-lg transition-all duration-200',
                      'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
                      'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105',
                    ) }
                  >
                    <Paperclip size={ 18 } />
                  </button>
                </Uploader>
              </Tooltip>
            ) }

            {/* 发送按钮 */ }
            <Button
              loading={ loading }
              disabled={ disabled || !actualValue.trim() }
              variant="primary"
              size="sm"
              className="flex-shrink-0"
              rightIcon={ <ArrowUpFromDot size={ 17 } /> }
              rounded="full"
              onClick={ handleSubmit }
            >
            </Button>
          </div>
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
        ? getTemplatesByCategory(selectedCategory)
        : searchTemplates(searchQuery) }
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
      histories={ searchHistory(searchQuery) }
      onHistorySelect={ handleHistorySelect }
      onHistoryDelete={ deleteHistory }
      onClearAll={ clearAllHistory }
      onClose={ () => setShowHistoryPanel(false) }
      onHighlightChange={ setHistoryHighlightIndex }
    />

    {/* 自动补全面板 */ }
    <AutoCompletePanel
      visible={ showAutoComplete && !showPromptPanel && !showHistoryPanel }
      suggestions={ suggestions }
      selectedIndex={ suggestions.findIndex(s => s === getSelectedSuggestion()) }
      inputElement={ textareaRef.current }
      followCursor
      onSuggestionSelect={ handleAutoCompleteSelect }
      onClose={ () => setShowAutoComplete(false) }
      onSelectionChange={ (index) => {
        if (index >= 0 && index < suggestions.length) {
          selectNextSuggestion()
        }
        else {
          selectPreviousSuggestion()
        }
      } }
    />
  </>)
})

ChatInput.displayName = 'ChatInput'
