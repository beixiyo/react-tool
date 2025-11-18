'use client'

import type { ChatInputProps, PromptCategory } from './types'
import { motion } from 'framer-motion'
import { memo, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { LiveWaveAudio } from '..'
import { formatDuration } from '../../utils'
import { AutoCompletePanel, BottomBar, ChatInputArea, HistoryPanel, PromptPanel, UploadedFilePreview, VoiceControlButton, VoiceRecorderPanel } from './components'
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
  useVoiceRecorder,
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
    enableVoiceRecorder = false,
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
    onVoiceRecordingFinish,
    onVoiceRecorderError,
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

  const {
    LiveWaveAudioRef,
    voiceStatus,
    recordingDuration,
    voiceRecording,
    voiceError,
    isPlayingVoice,
    isVoicePanelVisible,
    handleVoiceButtonClick,
    handleVoicePanelClose,
    handleStopRecording,
    handleReRecord,
    handleVoicePlayToggle,
    handleWaveformError,
    handleRecordingFinish,
    handleStreamReady,
    handleStreamEnd,
  } = useVoiceRecorder({
    enableVoiceRecorder,
    onVoiceRecordingFinish,
    onVoiceRecorderError,
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

  const handleVoiceDownload = () => {
    const recorder = LiveWaveAudioRef.current?.getRecorder()
    if (recorder) {
      recorder.download()
    }
  }

  const isInputLockedByVoice = voiceStatus === 'recording' || voiceStatus === 'processing'
  const voiceDurationLabel = useMemo(() => formatDuration(recordingDuration), [recordingDuration])
  const voiceControlDisabled = disabled || loading
  const voiceControlNode = enableVoiceRecorder
    ? (
        <VoiceControlButton
          status={ voiceStatus }
          durationLabel={ voiceDurationLabel }
          disabled={ voiceControlDisabled }
          onClick={ handleVoiceButtonClick }
        />
      )
    : null

  return (<>
    <motion.div
      ref={ containerRef }
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      exit={ { opacity: 0, y: -20 } }
      transition={ { duration: 0.3 } }
      className={ cn(
        'relative w-full mx-auto bg-background border overflow-hidden rounded-3xl hover:border-borderStrong',
        'transition-all duration-100',
        isFocused
          ? 'border-borderStrong'
          : 'border-border',
        containerClassName,
      ) }
      style={ style }
    >
      { showUploader && <UploadedFilePreview uploadedFiles={ uploadedFiles } onFileRemove={ onFileRemove } /> }

      {/* 主输入区域 */ }
      <div
        className={ cn(
          'relative h-32',
          showUploader && !disabled && 'cursor-text',
          className,
        ) }
      >
        <div
          ref={ chatInputAreaRef }
          className={ cn(
            'relative h-full w-full rounded-3xl',
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
            disabled={ disabled || isInputLockedByVoice }
            bottomBarHeight={ bottomBarHeight }
          />

          { enableVoiceRecorder && isInputLockedByVoice && (
            <div
              className="pointer-events-none absolute left-0 right-0 top-0 z-10 rounded-3xl bg-background/70 backdrop-blur-sm transition-opacity duration-200 dark:bg-background/40"
              style={ { bottom: bottomBarHeight } }
            />
          ) }

          { enableVoiceRecorder && (
            <VoiceRecorderPanel
              visible={ isVoicePanelVisible }
              status={ voiceStatus }
              durationLabel={ voiceDurationLabel }
              waveform={
                <LiveWaveAudio
                  ref={ LiveWaveAudioRef }
                  processing={ voiceStatus === 'processing' }
                  enableRecording
                  height={ 96 }
                  className="h-24 w-full rounded-2xl bg-background/60 dark:bg-backgroundMuted/40"
                  onError={ handleWaveformError }
                  onStreamReady={ handleStreamReady }
                  onStreamEnd={ handleStreamEnd }
                  onRecordingFinish={ handleRecordingFinish }
                />
              }
              isPlaying={ isPlayingVoice }
              hasRecording={ Boolean(voiceRecording) }
              errorMessage={ isVoicePanelVisible
                ? voiceError
                : undefined }
              onClose={ handleVoicePanelClose }
              onStop={ handleStopRecording }
              onReRecord={ handleReRecord }
              onPlayToggle={ handleVoicePlayToggle }
              onDownload={ handleVoiceDownload }
              onSubmit={ () => handleSubmit({
                voice: voiceRecording || undefined,
              }) }
            />
          ) }

          {/* 底部控制区域 */ }
          <BottomBar
            bottomBarHeight={ bottomBarHeight }
            enablePromptTemplates={ enablePromptTemplates }
            enableHistory={ enableHistory }
            showQuickMode={ showQuickMode }
            showUploader={ showUploader }
            quickMode={ quickMode }
            loading={ loading }
            disabled={ disabled || isInputLockedByVoice }
            actualValue={ actualValue }
            showPromptPanel={ showPromptPanel }
            showHistoryPanel={ showHistoryPanel }
            textareaRef={ textareaRef }
            chatInputAreaRef={ chatInputAreaRef }
            onQuickModeChange={ onQuickModeChange }
            onFilesChange={ handleFilesChange }
            onFileRemove={ onFileRemove }
            onSubmit={ () => handleSubmit({
              images: uploadedFiles,
              voice: voiceRecording || undefined,
            }) }
            onShowPromptPanelToggle={ handleShowPromptPanelToggle }
            onShowHistoryPanelToggle={ handleShowHistoryPanelToggle }
            voiceControl={ voiceControlNode }
          />
        </div>
      </div>
    </motion.div>

    { !isVoicePanelVisible && voiceError && (
      <div className="mt-3 rounded-xl border border-danger/40 bg-dangerBg/20 px-3 py-2 text-xs text-danger">
        { voiceError }
      </div>
    ) }

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
