'use client'

import { deepMerge, formatDuration } from '@jl-org/tool'
import { useComposedRef, useLatestCallback, useStable } from 'hooks'
import { motion } from 'motion/react'
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import type { LiveWaveAudioProps } from '../LiveWaveAudio'
import { LiveWaveAudio, normalizeAudioLevel, VoiceRecorderPanel } from '../LiveWaveAudio'
import { Message } from '../Message'
import type { UploaderRef } from '../Uploader'
import { Uploader } from '../Uploader'
import { AutoCompletePanel, BottomBar, ChatInputArea, HistoryPanel, PromptPanel, VoiceControlButton } from './components'
import { PROMPT_CATEGORIES } from './constants'
import type { ChatInputMotionConfig, ChatInputProps, ChatInputVoiceController, PromptCategory, VoiceControlStatus } from './types'

import { useChatInputEnterKey } from './controllers'
import { resolveChatInputFeatures } from './features/panels'
import { useShortcutActions } from './features/shortcuts'
import { useAutoComplete, useInputHistory, useInteractionHandlers, usePanelManager, usePromptTemplates, useValueManager, useVoiceRecorder } from './hooks'
import { resolveChatInputShortcuts } from './shortcuts'

const DEFAULT_MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
} satisfies Required<ChatInputMotionConfig>

/**
 * ChatInput 统一组件
 * 支持提示词模板、输入历史、自动补全、文件上传等功能
 */
const InnerChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>((props, ref) => {
  const {
    value,
    placeholder,
    disabled = false,
    loading = false,
    allowEmptySubmit = false,
    shortcuts,
    features,
    disableInput,
    disableVoice,
    enablePromptTemplates,
    enableHistory,
    enableHelper = true,
    enableAutoComplete,
    customTemplates,
    maxHistoryCount = 50,
    enableUploader = true,
    uploadedFiles = [],
    accept = 'image/*',
    maxCount,
    maxSize,
    maxPixels,
    enableVoiceRecorder = false,
    enableBottomBar = true,
    inputClassName,
    inputContainerClassName,
    onVoiceModeChange,
    voiceModes,
    topContent,
    renderActions,
    renderVoicePanel,
    renderVoiceControl,
    autoResize = true,
    minRows = 1,
    maxRows = 8,
    containerClassName,
    className,
    motionConfig,
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
    voiceControllerRef,
    onVoiceStatusChange,
  } = props

  /** 状态管理 */
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>()
  const [promptHighlightIndex, setPromptHighlightIndex] = useState(0)
  const [historyHighlightIndex, setHistoryHighlightIndex] = useState(0)

  /** Refs */
  const containerRef = useRef<HTMLDivElement>(null)
  const { elementRef: textareaRef, setRef: setTextareaRef } = useComposedRef<HTMLTextAreaElement>({ ref })
  const chatInputAreaRef = useRef<HTMLDivElement>(null)
  /** 拖拽区域：覆盖「预览栏 + 输入区」整块，避免拖到预览栏无法识别 */
  const dragAreaRef = useRef<HTMLDivElement>(null)
  const uploaderRef = useRef<UploaderRef>(null)

  /** 点击底部回形针 → 触发上提的单实例 Uploader 选文件 */
  const handleUploaderClick = useLatestCallback(() => uploaderRef.current?.click())

  /** 自定义 Hooks */
  const { actualValue, handleChangeVal } = useValueManager(value, onChange)

  /** 记录开始语音转文本时的输入值，用于追加而不是覆盖 */
  const textBeforeVoiceRef = useRef('')

  const t = useT()
  const stableShortcuts = useStable(shortcuts)
  const resolvedShortcuts = useMemo(() => resolveChatInputShortcuts(stableShortcuts), [stableShortcuts])
  const stableFeatures = useStable(features)
  const stableTemplates = useStable(customTemplates)
  const stableMotionConfig = useStable(motionConfig)
  const resolvedMotionConfig = useMemo(() => deepMerge<Required<ChatInputMotionConfig>>(DEFAULT_MOTION_CONFIG, stableMotionConfig ?? {}), [stableMotionConfig])

  const resolvedFeatures = useMemo(() =>
    resolveChatInputFeatures({
      features: stableFeatures,
      enablePromptTemplates,
      enableHistory,
      enableAutoComplete,
      customTemplates: stableTemplates,
      maxHistoryCount,
    }), [
    stableFeatures,
    enablePromptTemplates,
    enableHistory,
    enableAutoComplete,
    stableTemplates,
    maxHistoryCount,
  ])

  /** 文件变更：转成 base64 列表交给外部 */
  const handleFilesChange = useLatestCallback((files: { base64: string }[]) => onFilesChange?.(files.map((item) => item.base64)))
  /** 数组级去重：已在列表中的图片（base64 相同）直接过滤掉，交给 Uploader 的 shouldFilterOut */
  const filterDuplicate = useLatestCallback((_file: File, base64: string) => uploadedFiles.includes(base64))
  /** 被去重过滤掉的图片：提示用户 */
  const handleFiltered = useLatestCallback((files: { base64: string }[]) => Message.warning(t('chatInput.upload.duplicateRemoved', { count: files.length })))

  /** 超限提示 */
  const handleExceedCount = useLatestCallback(() => Message.warning(t('chatInput.upload.exceedCount', { count: maxCount ?? 0 })))
  const handleExceedSize = useLatestCallback(() => Message.warning(t('chatInput.upload.exceedSize')))
  const handleExceedPixels = useLatestCallback(() => Message.warning(t('chatInput.upload.exceedPixels')))

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

  const promptTemplatesHook = usePromptTemplates({
    enabled: resolvedFeatures.promptTemplates.enabled,
    templates: resolvedFeatures.promptTemplates.templates,
    includeDefaults: resolvedFeatures.promptTemplates.includeDefaults,
    adapter: resolvedFeatures.promptTemplates.adapter,
  })
  const inputHistoryHook = useInputHistory({
    enabled: resolvedFeatures.history.enabled,
    maxCount: resolvedFeatures.history.maxCount,
    items: resolvedFeatures.history.items,
    adapter: resolvedFeatures.history.adapter,
  })
  const autoCompleteHook = useAutoComplete({
    enabled: resolvedFeatures.autocomplete.enabled,
    templates: promptTemplatesHook.templates,
    histories: inputHistoryHook.histories,
    adapter: resolvedFeatures.autocomplete.adapter,
  })

  const {
    handleInputChange,
    handleSubmit,
    handleTemplateSelect,
    handleHistorySelect,
    handleAutoCompleteSelect,
  } = useInteractionHandlers({
    loading,
    disabled,
    allowEmptySubmit,
    enableHistory: resolvedFeatures.history.enabled,
    enableAutoComplete: resolvedFeatures.autocomplete.enabled,
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
  const handleVoiceButtonClickWrapper = useLatestCallback(() => {
    /** 如果当前是 text 模式且即将开始录音，记录当前输入值 */
    if (voiceMode === 'text' && voiceStatus !== 'recording') {
      textBeforeVoiceRef.current = actualValue
    }
    return handleVoiceButtonClick()
  })

  /**
   * 语音录制的命令式句柄
   *
   * 内置语音按钮只有「切换」一种语义，够本组件自己用；但外部触发（全局快捷键、
   * 宿主进程指令）需要明确的开始 / 结束 / 取消，靠切换会在状态不同步时反向操作。
   * 三个方法都复用内部同一套流程，不另开第二套状态
   */
  /**
   * 语音状态外播
   *
   * 宿主自绘录音界面时（如把控件放进 `renderActions`）必须知道当前处于哪一档，
   * 而这套状态在组件内部，只靠 `renderVoicePanel` 的 ctx 拿不到组件外
   */
  const emitVoiceStatus = useLatestCallback((next: VoiceControlStatus) => onVoiceStatusChange?.(next))
  useEffect(() => {
    emitVoiceStatus(voiceStatus)
  }, [voiceStatus, emitVoiceStatus])

  useImperativeHandle(voiceControllerRef, (): ChatInputVoiceController => ({
    getStatus: () => voiceStatus,
    start: async () => {
      if (voiceStatus !== 'idle') return
      await handleVoiceButtonClickWrapper()
    },
    stop: async () => {
      if (voiceStatus !== 'recording') return
      await handleStopRecording()
    },
    cancel: () => handleVoicePanelClose(),
  }), [voiceStatus, handleVoiceButtonClickWrapper, handleStopRecording, handleVoicePanelClose])

  useShortcutActions({
    shortcuts: resolvedShortcuts,
    promptEnabled: resolvedFeatures.promptTemplates.enabled,
    historyEnabled: resolvedFeatures.history.enabled,
    openPrompt: () => {
      setShowPromptPanel(true)
      setShowHistoryPanel(false)
      setShowAutoComplete(false)
      setSearchQuery('')
      setPromptHighlightIndex(0)
    },
    openHistory: () => {
      setShowHistoryPanel(true)
      setShowPromptPanel(false)
      setShowAutoComplete(false)
      setSearchQuery('')
      setHistoryHighlightIndex(0)
    },
  })

  const autoCompleteVisible = resolvedFeatures.autocomplete.enabled
    && showAutoComplete
    && !showPromptPanel
    && !showHistoryPanel
  const selectedAutoCompleteSuggestion = autoCompleteHook.getSelectedSuggestion()
  const handlePressEnter = useChatInputEnterKey({
    textareaRef,
    value: actualValue,
    shortcuts: resolvedShortcuts,
    autoCompleteVisible,
    selectedSuggestion: selectedAutoCompleteSuggestion,
    onChange: handleChangeVal,
    onSubmit: handleSubmit,
    onAutoCompleteSelect: handleAutoCompleteSelect,
  })

  const handleVoiceDownload = useLatestCallback(() => {
    const recorder = LiveWaveAudioRef.current?.getRecorder()
    if (recorder) {
      recorder.download()
    }
  })

  /** 频域缓冲复用：自绘面板可能按帧采样，每次新建数组会持续制造垃圾 */
  const audioLevelBufferRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  const readVoiceAudioLevel = useLatestCallback(() => {
    const recorder = LiveWaveAudioRef.current?.getRecorder()
    if (!recorder?.analyser) return 0

    if (audioLevelBufferRef.current?.length !== recorder.analyser.frequencyBinCount) {
      audioLevelBufferRef.current = new Uint8Array(recorder.analyser.frequencyBinCount)
    }

    return normalizeAudioLevel(recorder.getByteFrequencyData(audioLevelBufferRef.current))
  })

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
  const customVoiceControlNode = enableVoiceRecorder
    ? renderVoiceControl?.({
      status: voiceStatus,
      disabled: voiceControlDisabled,
      panelVisible: isVoicePanelVisible,
      onClick: handleVoiceButtonClickWrapper,
      voiceMode,
      onVoiceModeChange: setVoiceMode,
      availableModes: voiceModes,
      DefaultVoiceControl: VoiceControlButton,
    })
    : undefined

  const voiceControlNode = enableVoiceRecorder
    ? customVoiceControlNode !== undefined
      ? customVoiceControlNode
      : (
        <VoiceControlButton
          status={ voiceStatus }
          disabled={ voiceControlDisabled }
          onClick={ handleVoiceButtonClickWrapper }
          voiceMode={ voiceMode }
          onVoiceModeChange={ setVoiceMode }
          availableModes={ voiceModes }
        />
      )
    : null

  /** 主输入区域：文本框 + 语音面板 + 底部栏；启用上传时由下方单实例 Uploader 包裹 */
  const inputArea = (
    <div
      ref={ chatInputAreaRef }
      className={ cn(
        'relative flex flex-col rounded-3xl',
        /** 非自动高度时维持固定高度，由 textarea flex-1 撑满 */
        !autoResize && 'h-32',
        enableUploader && !disabled && 'cursor-text',
        className,
      ) }
    >
      { topContent }

      <ChatInputArea
        textareaRef={ setTextareaRef }
        value={ actualValue }
        autoResize={ autoResize }
        minRows={ minRows }
        maxRows={ maxRows }
        onChange={ handleInputChange }
        onFocus={ () => {
          setIsFocused(true)
          onFocus?.()
        } }
        onBlur={ () => {
          setIsFocused(false)
          onBlur?.()
        } }
        onPressEnter={ handlePressEnter }
        placeholder={ placeholder }
        disabled={ disabled || !!disableInput || isInputLockedByVoice }
        inputClassName={ inputClassName }
        inputContainerClassName={ inputContainerClassName }
      />

      { enableVoiceRecorder && !disableVoice && (
        <VoiceRecorderPanel
          renderPanel={ renderVoicePanel }
          getAudioLevel={ readVoiceAudioLevel }
          visible={ isVoicePanelVisible }
          status={ voiceStatus }
          hasRecording={ Boolean(voiceRecording) }
          durationLabel={ voiceDurationLabel }
          voiceMode={ voiceMode }
          waveform={ 
            <LiveWaveAudio
              ref={ LiveWaveAudioRef }
              state={ getWaveformState() }
              height={ 96 }
              className="h-24 w-full rounded-2xl bg-background/60 dark:bg-backgroundMuted/40"
              onError={ handleWaveformError }
              onStreamEnd={ handleStreamEnd }
              onRecordingFinish={ handleRecordingFinish }
            />
           }
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

      {
        /*
         * 底部控制区域
         *
         * 可整行关掉：表单里的多行输入不需要发送按钮，而这行是固定高度，
         * 留着就是一条空白。关掉后语音控件由宿主自己安排位置
         */
      }
      { enableBottomBar && (
        <BottomBar
          enablePromptTemplates={ resolvedFeatures.promptTemplates.enabled }
          enableHistory={ resolvedFeatures.history.enabled }
          enableUploader={ enableUploader }
          enableHelper={ enableHelper }
          loading={ loading }
          disabled={ disabled || isInputLockedByVoice }
          allowEmptySubmit={ allowEmptySubmit }
          shortcuts={ resolvedShortcuts }
          actualValue={ actualValue }
          showPromptPanel={ showPromptPanel }
          showHistoryPanel={ showHistoryPanel }
          textareaRef={ textareaRef }
          chatInputAreaRef={ chatInputAreaRef }
          onFilesChange={ handleFilesChange }
          onFileRemove={ onFileRemove }
          onSubmit={ () =>
            handleSubmit({
              images: uploadedFiles,
              voice: voiceRecording || undefined,
            }) }
          onShowPromptPanelToggle={ handleShowPromptPanelToggle }
          onShowHistoryPanelToggle={ handleShowHistoryPanelToggle }
          onUploaderClick={ handleUploaderClick }
          voiceControl={ voiceControlNode }
          renderActions={ renderActions }
        />
      ) }
    </div>
  )

  return (
    <>
      <motion.div
        ref={ containerRef }
        initial={ resolvedMotionConfig.initial }
        animate={ resolvedMotionConfig.animate }
        exit={ resolvedMotionConfig.exit }
        transition={ resolvedMotionConfig.transition }
        className={ cn(
          'relative w-full mx-auto bg-background border overflow-hidden rounded-3xl hover:border-border2',
          'transition-all duration-100 shrink-0',
          /** 聚焦仅做细微变色 border → border2，与 Textarea 一致，保持素雅（不用对比强烈的 border3） */
          isFocused
            ? 'border-border2'
            : 'border-border',
          containerClassName,
        ) }
        style={ style }
      >
        { enableUploader
          ? (
            <Uploader
              ref={ uploaderRef }
              mode="card"
              multiple
              accept={ accept }
              distinct
              previewImgs={ uploadedFiles }
              maxCount={ maxCount }
              maxSize={ maxSize }
              maxPixels={ maxPixels }
              onChange={ handleFilesChange }
              onRemove={ onFileRemove }
              shouldFilterOut={ filterDuplicate }
              onFiltered={ handleFiltered }
              onExceedCount={ handleExceedCount }
              onExceedSize={ handleExceedSize }
              onExceedPixels={ handleExceedPixels }
              pasteEls={ [textareaRef] }
              dragAreaEl={ dragAreaRef }
              renderUploadArea={ ({ renderPreviewList }) => (
                /** 拖拽区域覆盖「预览栏 + 输入区」整块；relative 供拖拽高亮覆盖层定位 */
                <div ref={ dragAreaRef } className="relative flex flex-col">
                  { /* 顶部一排预览（仅有图时渲染），由 Uploader 的 PreviewList 接管 */ }
                  { uploadedFiles.length > 0 && renderPreviewList({
                    className: 'flex-nowrap gap-2 px-3 pt-3 pb-1 mt-0 scrollbar-thin scrollbar-thumb-border3',
                    previewConfig: { width: 56, height: 56, renderAddTrigger: () => null },
                  }) }
                  { inputArea }
                </div>
              ) }
            />
          )
          : inputArea }
      </motion.div>

      { !isVoicePanelVisible && voiceError && (
        <div className="mt-3 rounded-xl border border-danger/40 bg-dangerBg/20 px-3 py-2 text-xs text-danger">
          { voiceError }
        </div>
      ) }

      { /* 提示词面板 */ }
      <PromptPanel
        visible={ resolvedFeatures.promptTemplates.enabled && showPromptPanel }
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

      { /* 历史记录面板 */ }
      <HistoryPanel
        visible={ resolvedFeatures.history.enabled && showHistoryPanel }
        searchQuery={ searchQuery }
        highlightedIndex={ historyHighlightIndex }
        histories={ inputHistoryHook.searchHistory(searchQuery) }
        onHistorySelect={ handleHistorySelect }
        onHistoryDelete={ inputHistoryHook.deleteHistory }
        onClearAll={ inputHistoryHook.clearAllHistory }
        onClose={ () => setShowHistoryPanel(false) }
        onHighlightChange={ setHistoryHighlightIndex }
      />

      { /* 自动补全面板 */ }
      <AutoCompletePanel
        visible={ autoCompleteVisible }
        suggestions={ autoCompleteHook.suggestions }
        selectedIndex={ autoCompleteHook.suggestions.findIndex((s) => s === autoCompleteHook.getSelectedSuggestion()) }
        inputElement={ textareaRef.current }
        followCursor
        onSuggestionSelect={ handleAutoCompleteSelect }
        onClose={ () => setShowAutoComplete(false) }
        onSelectionChange={ autoCompleteHook.setSelectedIndex }
      />
    </>
  )
})

export const ChatInput = memo(InnerChatInput)
ChatInput.displayName = 'ChatInput'
