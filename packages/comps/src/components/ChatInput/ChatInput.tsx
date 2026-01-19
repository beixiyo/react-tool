'use client'

import type { LiveWaveAudioProps } from '../LiveWaveAudio'
import type { ChatInputProps, PromptCategory } from './types'
import { formatDuration } from '@jl-org/tool'
import { motion } from 'motion/react'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { LiveWaveAudio, VoiceRecorderPanel } from '../LiveWaveAudio'
import { AutoCompletePanel, BottomBar, ChatInputArea, HistoryPanel, PromptPanel, UploadedFilePreview, VoiceControlButton } from './components'

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
    disableInput,
    disableVoice,
    enablePromptTemplates = true,
    enableHistory = true,
    enableHelper = true,
    enableAutoComplete = true,
    customTemplates,
    maxHistoryCount = 50,
    enableUploader = true,
    uploadedFiles = [],
    enableVoiceRecorder = false,
    onVoiceModeChange,
    voiceModes,
    containerClassName,
    className,
    style,
    onChange,
    onSubmit,
    onTemplateSelect,
    onHistorySelect,
    onFocus,
    onBlur,
    onFilesChange,
    onFileRemove,
    onVoiceRecordingFinish,
    onVoiceRecorderError,
    onAudioDataChange,
    asrConfig: propsAsrConfig,
    onVoiceSubmit,
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

  /** 记录开始语音转文本时的输入值，用于追加而不是覆盖 */
  const textBeforeVoiceRef = useRef('')

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
    voiceRecording,
    recordingDuration,
    voiceError,
    isPlayingVoice,
    isVoicePanelVisible,
    voiceMode,
    setVoiceMode,
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
    voiceModes,
    onVoiceModeChange,
    asrConfig: propsAsrConfig,
    onTranscriptResult: (text) => {
      /** 将语音识别的结果追加到开始语音转文本时的输入值后面 */
      handleChangeVal(textBeforeVoiceRef.current + text)
    },
    onAudioDataChange,
    actualValue,
    handleChangeVal,
    textBeforeRecordRef: textBeforeVoiceRef,
  })

  /** 包装 handleVoiceButtonClick，在开始语音转文本时记录当前输入值 */
  const handleVoiceButtonClickWrapper = useCallback(() => {
    /** 如果当前是 text 模式且即将开始录音，记录当前输入值 */
    if (voiceMode === 'text' && voiceStatus !== 'recording') {
      textBeforeVoiceRef.current = actualValue
    }
    handleVoiceButtonClick()
  }, [voiceMode, voiceStatus, actualValue, handleVoiceButtonClick])

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

  /**
   * 计算 LiveWaveAudio 组件的 state
   * - text 模式下录音时也使用 'recording' 状态显示真实波形（仅用于动画，不保存录音）
   * - audio 模式下录音时使用 'recording' 状态显示真实波形
   * - processing 时使用 'idle' 状态
   * - 其他情况使用 'stop' 状态
   */
  const getWaveformState = (): LiveWaveAudioProps['state'] => {
    if (voiceStatus === 'recording') {
      return 'recording'
    }
    if (voiceStatus === 'processing') {
      return 'idle'
    }
    return 'stop'
  }

  const isInputLockedByVoice = (!disableVoice) && (voiceStatus === 'recording' || voiceStatus === 'processing')
  const voiceDurationLabel = useMemo(() => formatDuration(recordingDuration), [recordingDuration])
  const voiceControlDisabled = disabled || loading || !!disableVoice
  const voiceControlNode = enableVoiceRecorder
    ? (
        <VoiceControlButton
          status={ voiceStatus }
          durationLabel={ voiceDurationLabel }
          disabled={ voiceControlDisabled }
          onClick={ handleVoiceButtonClickWrapper }
          voiceMode={ voiceMode }
          onVoiceModeChange={ setVoiceMode }
          availableModes={ voiceModes }
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
        'transition-all duration-100 shrink-0',
        isFocused
          ? 'border-borderStrong'
          : 'border-border',
        containerClassName,
      ) }
      style={ style }
    >
      { enableUploader && <UploadedFilePreview uploadedFiles={ uploadedFiles } onFileRemove={ onFileRemove } /> }

      {/* 主输入区域 */ }
      <div
        className={ cn(
          'relative h-32',
          enableUploader && !disabled && 'cursor-text',
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
            disabled={ disabled || !!disableInput || isInputLockedByVoice }
            bottomBarHeight={ bottomBarHeight }
          />

          { enableVoiceRecorder && !disableVoice && (
            <VoiceRecorderPanel
              visible={ isVoicePanelVisible }
              status={ voiceStatus }
              hasRecording={ Boolean(voiceRecording) }
              durationLabel={ voiceDurationLabel }
              voiceMode={ voiceMode }
              waveform={ <LiveWaveAudio
                ref={ LiveWaveAudioRef }
                state={ getWaveformState() }
                height={ 96 }
                className="h-24 w-full rounded-2xl bg-background/60 dark:bg-backgroundMuted/40"
                onError={ handleWaveformError }
                onStreamReady={ handleStreamReady }
                onStreamEnd={ handleStreamEnd }
                onRecordingFinish={ handleRecordingFinish }
              /> }
              isPlaying={ isPlayingVoice }
              errorMessage={ isVoicePanelVisible
                ? voiceError
                : undefined }
              onClose={ handleVoicePanelClose }
              onStop={ handleStopRecording }
              onReRecord={ handleReRecord }
              onPlayToggle={ handleVoicePlayToggle }
              onDownload={ handleVoiceDownload }
              onSubmit={ () => {
                if (voiceRecording && onVoiceSubmit) {
                  onVoiceSubmit(voiceRecording)
                }
              } }
            />
          ) }

          {/* 底部控制区域 */ }
          <BottomBar
            bottomBarHeight={ bottomBarHeight }
            enablePromptTemplates={ enablePromptTemplates }
            enableHistory={ enableHistory }
            enableUploader={ enableUploader }
            enableHelper={ enableHelper }
            loading={ loading }
            disabled={ disabled || isInputLockedByVoice }
            actualValue={ actualValue }
            showPromptPanel={ showPromptPanel }
            showHistoryPanel={ showHistoryPanel }
            textareaRef={ textareaRef }
            chatInputAreaRef={ chatInputAreaRef }
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
