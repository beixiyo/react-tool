'use client'

import { deepMerge, formatDuration } from '@jl-org/tool'
import { useComposedRef, useConst, useLatestCallback, useStable } from 'hooks'
import { motion } from 'motion/react'
import { forwardRef, memo, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import type { LiveWaveAudioProps } from '../LiveWaveAudio'
import { createAudioLevelReader, LiveWaveAudio, VoiceRecorderPanel } from '../LiveWaveAudio'
import { Message } from '../Message'
import type { UploaderRef } from '../Uploader'
import { Uploader } from '../Uploader'
import { AutoCompletePanel, BottomBar, ChatInputArea, HistoryPanel, PromptPanel, VoiceControlButton } from './components'
import { PROMPT_CATEGORIES } from './constants'
import type { BottomBarActionProps, ChatInputMotionConfig, ChatInputProps, ChatInputVoiceController, PromptCategory, VoiceControlButtonProps } from './types'

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
    enableHelper = true,
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
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>()
  const [promptHighlightIndex, setPromptHighlightIndex] = useState(0)
  const [historyHighlightIndex, setHistoryHighlightIndex] = useState(0)

  /** Refs */
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null)
  const { elementRef: textareaRef, setRef: setTextareaRef } = useComposedRef<HTMLTextAreaElement>({ ref })
  const chatInputAreaRef = useRef<HTMLDivElement>(null)
  /** 拖拽区域：覆盖「预览栏 + 输入区」整块，避免拖到预览栏无法识别 */
  const dragAreaRef = useRef<HTMLDivElement>(null)
  const uploaderRef = useRef<UploaderRef>(null)

  const setContainerRef = useLatestCallback((element: HTMLDivElement | null) => {
    containerRef.current = element
    setContainerElement(element)
  })

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
  const stableMotionConfig = useStable(motionConfig)
  const resolvedMotionConfig = useMemo(() => deepMerge<Required<ChatInputMotionConfig>>(DEFAULT_MOTION_CONFIG, stableMotionConfig ?? {}), [stableMotionConfig])

  const resolvedFeatures = useMemo(() => resolveChatInputFeatures(stableFeatures), [stableFeatures])

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

  const handlePanelEscape = useLatestCallback(() => {
    closeAllPanels()
    textareaRef.current?.focus()
  })

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

  const { handleInputChange, handleSubmit, handleTemplateSelect, handleHistorySelect, handleAutoCompleteSelect } = useInteractionHandlers({
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
    isVoiceStarting,
    isVoicePanelVisible,
    isExternalCaptureActive,
    getVoiceStatus,
    getVoiceAudioLevel,
    voiceMode,
    setVoiceMode,
    handleVoiceButtonClick,
    handleVoicePanelClose,
    cancelRecording,
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
    onVoiceStatusChange,
    asrConfig: propsAsrConfig,
    onTranscriptResult: (text) => {
      /**
       * 按输入框当前光标插入识别结果，选中内容照输入法的规矩被替换
       *
       * 不能再写成「录音前的快照 + 转写」：录音期间输入框已经不再禁用
       * （见下方 {@link isInputLockedByVoice}），用快照覆盖会把这段时间打的字整段丢掉
       */
      const textarea = textareaRef.current
      const start = clampCaret(textarea?.selectionStart, actualValue)
      const end = Math.max(start, clampCaret(textarea?.selectionEnd, actualValue))
      handleChangeVal(actualValue.slice(0, start) + text + actualValue.slice(end))
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
   * 宿主进程指令）需要明确的开始 / 结束 / 取消，靠切换会在状态不同步时反向操作
   * 三个方法都复用内部同一套流程，不另开第二套状态
   */
  useImperativeHandle(
    voiceControllerRef,
    (): ChatInputVoiceController => ({
      getStatus: getVoiceStatus,
      start: async () => {
        await handleVoiceButtonClickWrapper()
      },
      stop: async () => {
        await handleStopRecording()
      },
      /**
       * 与面板右上角的 ✕（`handleVoicePanelClose`）分开：那里是「关掉这个面板」，
       * 这里是「取消这一轮」，宿主挂了 `onCancelRecord` 时本轮音频要交还给它
       */
      cancel: async () => cancelRecording(),
    }),
    [getVoiceStatus, handleVoiceButtonClickWrapper, handleStopRecording, cancelRecording],
  )

  /**
   * 录音 / 转写期间的操作锁
   *
   * 只锁「会打断这一轮的入口」——上传、发送、模板与历史面板，**不锁打字**：
   * 语音是补充输入而不是接管输入框，用户完全可以一边说一边回去改前面写下的句子，
   * 转写文本按落点光标插回去（宿主侧 `useVoiceTextInsertion`，内置识别见上面的
   * `onTranscriptResult`）
   *
   * 锁住 textarea 的代价不止是不能打字：`disabled` 元素会被浏览器摘掉焦点，
   * activeElement 掉回 body，主进程的落点判定因此看不到「光标本来在哪个输入框里」
   */
  const isInputLockedByVoice = !disableVoice && (voiceStatus === 'recording' || voiceStatus === 'processing')

  useShortcutActions({
    shortcuts: resolvedShortcuts,
    promptEnabled: resolvedFeatures.promptTemplates.enabled,
    historyEnabled: resolvedFeatures.history.enabled,
    disabled: disabled || isInputLockedByVoice,
    target: containerElement,
    openPrompt: () => {
      setShowPromptPanel(true)
      setShowHistoryPanel(false)
      setShowAutoComplete(false)
      setPromptHighlightIndex(0)
    },
    openHistory: () => {
      setShowHistoryPanel(true)
      setShowPromptPanel(false)
      setShowAutoComplete(false)
      setHistoryHighlightIndex(0)
    },
  })

  const autoCompleteVisible = resolvedFeatures.autocomplete.enabled
    && showAutoComplete
    && !showPromptPanel
    && !showHistoryPanel
    && !disabled
    && !isInputLockedByVoice
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

  /** 读取器持有频域缓冲，`useConst` 保证它跨渲染是同一个，不然复用就白搭 */
  const readBuiltInAudioLevel = useConst(() => createAudioLevelReader(() => LiveWaveAudioRef.current?.getRecorder() ?? null))
  const readVoiceAudioLevel = useLatestCallback(() => (isExternalCaptureActive
    ? getVoiceAudioLevel()
    : readBuiltInAudioLevel())
  )

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

  const voiceDurationLabel = useMemo(() => formatDuration(recordingDuration), [recordingDuration])
  const voiceControlDisabled = disabled || loading || !!disableVoice || isVoiceStarting
  const renderVoiceControlNode = useMemo(
    () => (actionProps: BottomBarActionProps) => {
      if (!enableVoiceRecorder) {
        return null
      }

      const voiceControlProps: VoiceControlButtonProps = {
        ...actionProps,
        status: voiceStatus,
        disabled: voiceControlDisabled,
        durationLabel: voiceDurationLabel,
        errorMessage: voiceError,
        onClick: handleVoiceButtonClickWrapper,
        voiceMode,
        onVoiceModeChange: setVoiceMode,
        availableModes: voiceModes,
      }
      const customVoiceControl = renderVoiceControl?.({
        panelVisible: isVoicePanelVisible,
        props: voiceControlProps,
        DefaultVoiceControl: VoiceControlButton,
      })

      return customVoiceControl !== undefined
        ? customVoiceControl
        : <VoiceControlButton { ...voiceControlProps } />
    },
    [
      enableVoiceRecorder,
      handleVoiceButtonClickWrapper,
      isVoicePanelVisible,
      renderVoiceControl,
      voiceControlDisabled,
      voiceDurationLabel,
      voiceError,
      voiceMode,
      voiceModes,
      voiceStatus,
    ],
  )

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
        disabled={ disabled || !!disableInput }
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
          waveform={ isExternalCaptureActive ? null : (
            <LiveWaveAudio
              ref={ LiveWaveAudioRef }
              state={ getWaveformState() }
              height={ 96 }
              className="h-24 w-full rounded-2xl bg-background2/60"
              onError={ handleWaveformError }
              onStreamEnd={ handleStreamEnd }
              onRecordingFinish={ handleRecordingFinish }
            />
          ) }
          isPlaying={ isPlayingVoice }
          errorMessage={ renderVoicePanel
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
          voiceControl={ enableVoiceRecorder
            ? renderVoiceControlNode
            : undefined }
          renderActions={ renderActions }
        />
      ) }
    </div>
  )

  return (
    <>
      <motion.div
        ref={ setContainerRef }
        initial={ resolvedMotionConfig.initial }
        animate={ resolvedMotionConfig.animate }
        exit={ resolvedMotionConfig.exit }
        transition={ resolvedMotionConfig.transition }
        className={ cn(
          /**
           * `isolate` 是给 `renderVoicePanel` 那层用的：录音光效需要沉到负 z
           * （压在文字与按钮之下、底色之上），而负 z 只在层叠上下文内部生效
           * 没有它光效会穿到本容器的 `bg-background` 后面，整个看不见
           */
          'relative isolate mx-auto w-full overflow-hidden rounded-3xl border bg-background hover:border-border2',
          'shrink-0 transition-all duration-100',
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
              disabled={ disabled || isInputLockedByVoice }
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
                  { uploadedFiles.length > 0
                    && renderPreviewList({
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

      { /* 提示词面板 */ }
      <PromptPanel
        visible={ resolvedFeatures.promptTemplates.enabled && showPromptPanel && !disabled && !isInputLockedByVoice }
        loading={ promptTemplatesHook.loading }
        selectedCategory={ selectedCategory }
        highlightedIndex={ promptHighlightIndex }
        templates={ promptTemplatesHook.templates }
        categories={ PROMPT_CATEGORIES }
        onTemplateSelect={ handleTemplateSelect }
        onCategorySelect={ setSelectedCategory }
        onClose={ handlePanelEscape }
        onHighlightChange={ setPromptHighlightIndex }
      />

      { /* 历史记录面板 */ }
      <HistoryPanel
        visible={ resolvedFeatures.history.enabled && showHistoryPanel && !disabled && !isInputLockedByVoice }
        loading={ inputHistoryHook.loading }
        highlightedIndex={ historyHighlightIndex }
        histories={ inputHistoryHook.histories }
        onHistorySelect={ handleHistorySelect }
        onHistoryDelete={ inputHistoryHook.deleteHistory }
        onClearAll={ inputHistoryHook.clearAllHistory }
        onClose={ handlePanelEscape }
        onHighlightChange={ setHistoryHighlightIndex }
      />

      { /* 自动补全面板 */ }
      <AutoCompletePanel
        visible={ autoCompleteVisible }
        suggestions={ autoCompleteHook.suggestions }
        selectedIndex={ autoCompleteHook.selectedIndex }
        loading={ autoCompleteHook.loading }
        inputElement={ textareaRef.current }
        followCursor
        onSuggestionSelect={ handleAutoCompleteSelect }
        onClose={ handlePanelEscape }
        onSelectionChange={ autoCompleteHook.setSelectedIndex }
      />
    </>
  )
})

/**
 * 把 DOM 光标读数收口到当前受控值的范围内
 *
 * 读的是 DOM，受控值可能刚被外部整段改写而 DOM 还没跟上；越界的下标会切出错位的文本
 * 没有输入框（未挂载）时按文末处理，退回追加语义
 */
function clampCaret(caret: number | null | undefined, value: string): number {
  if (caret == null) return value.length

  return Math.min(Math.max(caret, 0), value.length)
}

export const ChatInput = memo(InnerChatInput)
ChatInput.displayName = 'ChatInput'
