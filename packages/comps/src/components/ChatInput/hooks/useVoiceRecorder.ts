import { SpeakToTxt } from '@jl-org/tool'
import { useLatestCallback, useLatestRef } from 'hooks'
import type { SyntheticEvent } from 'react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useT } from '../../../i18n'
import type { RecordingControls } from '../..'
import type {
  CustomASRCallbacks,
  CustomASRCapture,
  CustomASRCaptureCancelContext,
  CustomASRCaptureContext,
  TextInsertController,
  UseVoiceRecorderOptions,
  VoiceControlStatus,
  VoiceMode,
  VoiceRecordingResult,
} from '../types'

/**
 * 管理 ChatInput 语音录制流程的 Hook
 */
export function useVoiceRecorder(options: UseVoiceRecorderOptions) {
  const {
    enableVoiceRecorder = false,
    onVoiceRecordingFinish,
    onVoiceRecorderError,
    onTranscriptResult,
    onAudioDataChange,
    voiceModes,
    onVoiceModeChange,
    asrConfig,
    actualValue = '',
    handleChangeVal,
    textBeforeRecordRef,
  } = options

  const t = useT()
  const onTranscriptResultEffect = useLatestCallback((text: string) => onTranscriptResult?.(text))
  const onAudioDataChangeEffect = useLatestCallback((audioData: VoiceRecordingResult | null) => onAudioDataChange?.(audioData))
  const actualValueRef = useLatestRef(actualValue)

  /** 创建文本插入控制器；可选择只允许当前录音轮次写入。 */
  const createTextInsertController = useLatestCallback((options?: {
    sessionId?: number
    sessionBound?: boolean
  }): TextInsertController => {
    const sessionId = options?.sessionId ?? recordingSessionRef.current
    const signal = sessionAbortControllerRef.current?.signal
    const textBeforeRecord = textBeforeRecordRef?.current || ''
    const canWrite = () =>
      !options?.sessionBound
      || (recordingSessionRef.current === sessionId && !signal?.aborted)
    const writeValue = (nextValue: string) => {
      if (!handleChangeVal || !canWrite()) return

      actualValueRef.current = nextValue
      handleChangeVal(nextValue)
    }

    return {
      get currentText() {
        return actualValueRef.current
      },
      get textBeforeRecord() {
        return textBeforeRecord
      },
      insertText: (text: string, replaceMode = false) => {
        if (replaceMode) {
          /** 替换模式：用识别结果替换录音前的文本 */
          writeValue(textBeforeRecord + text)
        }
        else {
          /** 追加模式：追加到当前文本末尾 */
          writeValue(actualValueRef.current + text)
        }
      },
      replaceText: (text: string) => {
        writeValue(text)
      },
      appendText: (text: string) => {
        writeValue(actualValueRef.current + text)
      },
    }
  })

  /** 外部 capture 专用上下文；取消或开始新轮次后自动拒绝迟到写入。 */
  const createCaptureContext = useLatestCallback((sessionId = recordingSessionRef.current): CustomASRCaptureContext => {
    const controller = createTextInsertController({ sessionId, sessionBound: true })
    const signal = sessionAbortControllerRef.current?.signal ?? new AbortController().signal

    return {
      ...controller,
      sessionId,
      signal,
    }
  })

  /** 取消上下文不绑定存活 session，允许宿主在短暂撤销窗口中回填重放结果。 */
  const createCaptureCancelContext = useLatestCallback((sessionId: number): CustomASRCaptureCancelContext => ({
    ...createTextInsertController(),
    sessionId,
  }))

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceControlStatus>('idle')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingResult | null>(null)
  const [voiceError, setVoiceError] = useState<string>()
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [isVoiceStarting, setIsVoiceStarting] = useState(false)
  const [usesExternalCapture, setUsesExternalCapture] = useState(false)
  const [voiceMode, setInternalVoiceMode] = useState<VoiceMode>(() => {
    const defaultModes: VoiceMode[] = ['audio', 'text']
    const availableModes = voiceModes || defaultModes
    return availableModes[0] || 'audio'
  })

  /** 当 voiceModes 变化时，如果当前模式不在可用选项中，切换到第一个可用选项 */
  useEffect(() => {
    const defaultModes: VoiceMode[] = ['audio', 'text']
    const availableModes = voiceModes || defaultModes
    if (
      voiceStatusRef.current === 'idle'
      && !isStartingRef.current
      && !availableModes.includes(voiceMode)
    ) {
      const newMode = availableModes[0] || 'audio'
      setInternalVoiceMode(newMode)
      onVoiceModeChange?.(newMode)
    }
  }, [voiceModes, voiceMode, onVoiceModeChange])

  const setVoiceMode = useLatestCallback((mode: VoiceMode) => {
    const availableModes = voiceModes || ['audio', 'text']
    if (
      voiceStatusRef.current !== 'idle'
      || isStartingRef.current
      || !availableModes.includes(mode)
    ) {
      return
    }
    setInternalVoiceMode(mode)
    onVoiceModeChange?.(mode)
  })

  const LiveWaveAudioRef = useRef<RecordingControls | null>(null)
  const durationTimerRef = useRef<number | undefined>(undefined)
  const durationStartedAtRef = useRef(0)
  const recorderStartPromiseRef = useRef<Promise<void> | null>(null)
  const recordingSessionRef = useRef(0)
  const sessionAbortControllerRef = useRef<AbortController | null>(null)
  const activeCaptureRef = useRef<CustomASRCapture | null>(null)
  const activeCallbacksRef = useRef<CustomASRCallbacks | null>(null)
  const activeVoiceModeRef = useRef<VoiceMode | null>(null)
  const pendingStopRef = useRef(false)
  const builtInFinishSessionsRef = useRef<number[]>([])
  /** 录音启动期重入锁：await destroy() 期间防止物理双击触发二次启动 */
  const isStartingRef = useRef(false)
  /**
   * 本轮正在「保留音频地取消」
   *
   * 置真后 {@link handleRecordingFinish} 会把音频交给 `onCancelRecord` 而不是丢弃，
   * 并跳过那里的 idle 早退——取消时界面已经收起，状态必然是 idle
   */
  const cancellingRef = useRef(false)
  const playbackRef = useRef<HTMLAudioElement | null>(null)
  const voiceStatusRef = useRef<VoiceControlStatus>('idle')
  /** 默认 SpeakToTxt 实例（仅在未提供 callbacks 时使用） */
  const speakToTxtRef = useRef<SpeakToTxt | null>(null)
  const customCapture = asrConfig?.capture
  const customCaptureRef = useLatestRef(customCapture)
  const expectBuiltInFinish = useLatestCallback((sessionId: number) => {
    const sessions = builtInFinishSessionsRef.current
    if (sessions.at(-1) !== sessionId) {
      sessions.push(sessionId)
    }
  })

  const getCurrentRecordingDuration = useLatestCallback(() => {
    const startedAt = durationStartedAtRef.current
    if (!startedAt) {
      return 0
    }

    return Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
  })

  const syncRecordingDuration = useLatestCallback(() => {
    const nextDuration = getCurrentRecordingDuration()

    setRecordingDuration((prev) =>
      prev === nextDuration
        ? prev
        : nextDuration
    )
  })

  const clearDurationTimer = useLatestCallback(() => {
    if (durationTimerRef.current === undefined) {
      return
    }
    window.clearInterval(durationTimerRef.current)
    durationTimerRef.current = undefined
  })

  const stopDurationTimer = useLatestCallback(() => {
    if (durationStartedAtRef.current) {
      syncRecordingDuration()
    }

    clearDurationTimer()
  })

  const resetDurationTimer = useLatestCallback(() => {
    clearDurationTimer()
    durationStartedAtRef.current = 0
    setRecordingDuration(0)
  })

  const startDurationTimer = useLatestCallback(() => {
    if (!durationStartedAtRef.current) {
      durationStartedAtRef.current = Date.now()
      setRecordingDuration(0)
    }

    syncRecordingDuration()

    if (durationTimerRef.current !== undefined) {
      return
    }
    durationTimerRef.current = window.setInterval(syncRecordingDuration, 1000)
  })

  const prepareRecordingSession = useLatestCallback((showPanel = false) => {
    sessionAbortControllerRef.current?.abort()
    recordingSessionRef.current += 1
    sessionAbortControllerRef.current = new AbortController()
    activeVoiceModeRef.current = voiceMode
    activeCaptureRef.current = voiceMode === 'text'
      ? customCapture ?? null
      : null
    activeCallbacksRef.current = voiceMode === 'text'
      ? asrConfig?.callbacks ?? null
      : null
    setUsesExternalCapture(voiceMode === 'text' && !!customCapture)
    pendingStopRef.current = false
    recorderStartPromiseRef.current = null
    resetDurationTimer()

    setVoiceError(undefined)
    setVoiceRecording(null)

    if (showPanel) {
      setShowVoiceRecorder(true)
    }

    return recordingSessionRef.current
  })

  const cleanupPlayback = useLatestCallback(() => {
    if (!playbackRef.current) {
      return
    }
    playbackRef.current.pause()
    playbackRef.current.currentTime = 0
    playbackRef.current.onended = null
    playbackRef.current = null
    setIsPlayingVoice(false)
  })

  const resetVoiceState = useLatestCallback((options?: {
    preserveError?: boolean
    sessionId?: number
  }) => {
    if (
      options?.sessionId !== undefined
      && recordingSessionRef.current !== options.sessionId
    ) {
      return
    }

    const sessionId = recordingSessionRef.current
    const activeCapture = activeCaptureRef.current
    const liveWaveAudio = LiveWaveAudioRef.current
    const isBuiltInRecording = !!liveWaveAudio?.isRecording()
    sessionAbortControllerRef.current?.abort()
    sessionAbortControllerRef.current = null
    activeCaptureRef.current = null
    activeCallbacksRef.current = null
    activeVoiceModeRef.current = null
    setUsesExternalCapture(false)
    pendingStopRef.current = false
    if (isBuiltInRecording) {
      expectBuiltInFinish(sessionId)
    }

    cleanupPlayback()
    resetDurationTimer()
    recorderStartPromiseRef.current = null
    recordingSessionRef.current += 1

    if (isBuiltInRecording && liveWaveAudio) {
      void liveWaveAudio.stop().catch((error) => onVoiceRecorderError?.(error as Error))
    }
    if (liveWaveAudio) {
      void liveWaveAudio.destroy().catch((error) => onVoiceRecorderError?.(error as Error))
    }
    if (speakToTxtRef.current) {
      speakToTxtRef.current.stop()
      speakToTxtRef.current = null
    }
    void Promise.resolve(activeCapture?.destroy?.())
      .catch((error) => onVoiceRecorderError?.(error as Error))
    voiceStatusRef.current = 'idle'

    setVoiceStatus('idle')
    setShowVoiceRecorder(false)
    const hadRecording = voiceRecording !== null
    setVoiceRecording(null)
    if (!options?.preserveError) {
      setVoiceError(undefined)
    }
    /** 通知调用者音频数据已清除 */
    if (hadRecording) {
      onAudioDataChangeEffect(null)
    }
  })

  const handleVoiceError = useLatestCallback((error: Error) => {
    const onError = activeCallbacksRef.current?.onError ?? asrConfig?.callbacks?.onError
    setVoiceError(error.message || t('chatInput.voice.errors.recordingFailed'))
    try {
      /** 如果使用 callbacks 模式，优先调用 callbacks.onError */
      if (onError) {
        onError(error)
      }
      else {
        onVoiceRecorderError?.(error)
      }
    }
    finally {
      resetVoiceState({ preserveError: true })
    }
  })
  const handleVoiceErrorEffect = useEffectEvent((error: Error) => handleVoiceError(error))

  const handleWaveformError = useLatestCallback((payload: Error | SyntheticEvent<HTMLDivElement>) => {
    if (payload instanceof Error) {
      handleVoiceError(payload)
      return
    }
    const nativeError = payload.nativeEvent
    if (nativeError instanceof Error) {
      handleVoiceError(nativeError)
    }
  })

  const completeTextSession = useLatestCallback((sessionId: number) => {
    if (recordingSessionRef.current !== sessionId) return

    sessionAbortControllerRef.current?.abort()
    sessionAbortControllerRef.current = null
    activeCaptureRef.current = null
    activeCallbacksRef.current = null
    activeVoiceModeRef.current = null
    setUsesExternalCapture(false)
    pendingStopRef.current = false
    recordingSessionRef.current += 1
    voiceStatusRef.current = 'idle'
    setVoiceStatus('idle')
    setShowVoiceRecorder(false)
  })

  const handleRecordingFinish = useLatestCallback(async (audioUrl: string, audioBlob: Blob, chunks: Blob[]) => {
    const sessionId = builtInFinishSessionsRef.current.shift() ?? recordingSessionRef.current
    if (recordingSessionRef.current !== sessionId) return

    const callbacks = activeCallbacksRef.current
    const sessionMode = activeVoiceModeRef.current ?? voiceMode
    const result: VoiceRecordingResult = {
      audioUrl,
      audioBlob,
      chunks,
    }

    /**
     * 保留音频的取消：必须排在下面的 idle 早退之前
     *
     * 取消是「界面立刻收起、音频随后到」，走到这里时状态早已是 idle，
     * 放在早退之后等于永远走不到
     */
    if (cancellingRef.current) {
      cancellingRef.current = false
      callbacks?.onCancelRecord?.(result, createTextInsertController({ sessionId }))
      return
    }

    if (voiceStatusRef.current === 'idle') {
      return
    }

    /** text 模式下，录音仅用于显示波形动画，不保存录音结果到 state */
    if (sessionMode === 'text') {
      stopDurationTimer()

      /** 如果使用 callbacks 模式，调用 onEndRecord */
      if (callbacks?.onEndRecord) {
        try {
          const controller = createTextInsertController({ sessionId, sessionBound: true })
          await callbacks.onEndRecord(result, controller)
        }
        catch (error) {
          if (recordingSessionRef.current === sessionId) {
            handleVoiceError(
              error instanceof Error
                ? error
                : new Error('ASR callback error'),
            )
          }
          return
        }
      }

      if (recordingSessionRef.current !== sessionId) return

      /** 通知调用者音频数据变化（即使不保存到 state） */
      onAudioDataChangeEffect(result)
      completeTextSession(sessionId)
      return
    }

    /** audio 模式下，保存录音结果并通知调用者 */
    cleanupPlayback()
    setVoiceRecording(result)

    stopDurationTimer()
    setIsPlayingVoice(false)

    const audio = new Audio(audioUrl)
    audio.onended = () => {
      setIsPlayingVoice(false)
    }

    playbackRef.current = audio
    voiceStatusRef.current = 'review'

    setVoiceStatus('review')
    setShowVoiceRecorder(true)
    setVoiceError(undefined)

    /** 添加一个短暂的延迟，确保状态更新完成后再调用回调 */
    setTimeout(() => {
      if (recordingSessionRef.current !== sessionId) return

      /** 先调用 onVoiceRecordingFinish 回调，允许外部处理录音结果 */
      onVoiceRecordingFinish?.(result)

      /** 然后通知音频数据变化 */
      onAudioDataChangeEffect(result)
    }, 0)
  })

  const handleStopRecording = useLatestCallback(async () => {
    if (isStartingRef.current) {
      pendingStopRef.current = true
      return
    }

    if (voiceStatusRef.current !== 'recording') {
      return
    }

    const sessionMode = activeVoiceModeRef.current ?? voiceMode

    /** text 模式下，停止 ASR 和 LiveWaveAudio 的录音 */
    if (sessionMode === 'text') {
      const capture = activeCaptureRef.current
      const sessionId = recordingSessionRef.current

      if (capture) {
        stopDurationTimer()
        voiceStatusRef.current = 'processing'
        setVoiceStatus('processing')

        try {
          await capture.finish(createCaptureContext(sessionId))
          completeTextSession(sessionId)
        }
        catch (error) {
          if (recordingSessionRef.current === sessionId) {
            handleVoiceError(
              error instanceof Error
                ? error
                : new Error('ASR capture finish failed'),
            )
          }
        }
        return
      }

      stopDurationTimer()

      /** 停止后进入 processing，等待 callbacks.onEndRecord 或默认 SpeakToTxt 完成 */
      voiceStatusRef.current = 'processing'
      setVoiceStatus('processing')

      /** 如果使用 callbacks 模式，不需要停止 SpeakToTxt（因为外部管理） */
      if (!activeCallbacksRef.current && speakToTxtRef.current) {
        speakToTxtRef.current.stop()
      }

      const recorder = LiveWaveAudioRef.current
      if (recorder && recorder.isRecording()) {
        expectBuiltInFinish(sessionId)
        await recorder.stop()
      }
      return
    }

    const recorder = LiveWaveAudioRef.current
    if (!recorder) {
      return
    }
    if (!recorder.isRecording()) {
      recorderStartPromiseRef.current = null
      recordingSessionRef.current += 1
      stopDurationTimer()
      voiceStatusRef.current = 'idle'
      setVoiceStatus('idle')
      setShowVoiceRecorder(false)
      return
    }
    stopDurationTimer()
    voiceStatusRef.current = 'processing'
    setVoiceStatus('processing')
    expectBuiltInFinish(recordingSessionRef.current)
    await recorder.stop()
  })

  const handleVoiceButtonClick = useLatestCallback(async () => {
    if (!enableVoiceRecorder) {
      return
    }

    if (voiceMode === 'text') {
      if (voiceStatusRef.current === 'recording') {
        await handleStopRecording()
        return
      }
      if (voiceStatusRef.current !== 'idle' || isStartingRef.current) {
        return
      }

      /** Start STT */
      isStartingRef.current = true
      setIsVoiceStarting(true)
      let shouldStopAfterStart = false
      try {
        const sessionId = prepareRecordingSession()
        const capture = activeCaptureRef.current
        const callbacks = activeCallbacksRef.current

        if (capture) {
          try {
            await capture.start(createCaptureContext(sessionId))
          }
          catch (error) {
            if (recordingSessionRef.current === sessionId) {
              handleVoiceError(
                error instanceof Error
                  ? error
                  : new Error('Failed to start ASR capture'),
              )
            }
            return
          }

          if (
            recordingSessionRef.current !== sessionId
            || sessionAbortControllerRef.current?.signal.aborted
          ) {
            return
          }

          setVoiceStatus('recording')
          voiceStatusRef.current = 'recording'
          startDurationTimer()
          shouldStopAfterStart = pendingStopRef.current
        }
        else if (callbacks) {
          /** 使用 callbacks 模式 */
          /** 调用 onStartRecord 回调 */
          const controller = createTextInsertController({ sessionId, sessionBound: true })
          try {
            const startResult = callbacks.onStartRecord?.(controller)
            if (startResult instanceof Promise) {
              await startResult
            }
          }
          catch (error) {
            if (recordingSessionRef.current === sessionId) {
              handleVoiceError(
                error instanceof Error
                  ? error
                  : new Error('Failed to start ASR callback'),
              )
            }
            return
          }

          if (
            recordingSessionRef.current !== sessionId
            || sessionAbortControllerRef.current?.signal.aborted
          ) {
            return
          }

          /** 启动录音（仅用于显示波形动画） */
          setVoiceStatus('recording')
          voiceStatusRef.current = 'recording'
          shouldStopAfterStart = pendingStopRef.current
        }
        else {
          /** 使用默认 SpeakToTxt */
          const defaultConfig = asrConfig?.defaultConfig || {}
          const stt = new SpeakToTxt({
            onResult: (text) => {
              onTranscriptResultEffect(text)
            },
            onEnd: () => {
              /** ASR 处理完成，从 processing 或 recording 状态转为 idle */
              if (voiceStatusRef.current === 'recording' || voiceStatusRef.current === 'processing') {
                completeTextSession(sessionId)
              }
            },
            continuous: defaultConfig.continuous ?? true,
            lang: defaultConfig.lang ?? 'zh-CN',
            interimResults: defaultConfig.interimResults ?? true,
            ...defaultConfig,
          })
          speakToTxtRef.current = stt

          /** 启动 SpeakToTxt */
          try {
            await stt.start()
          }
          catch (error) {
            if (recordingSessionRef.current === sessionId) {
              handleVoiceError(
                error instanceof Error
                  ? error
                  : new Error('Failed to start ASR'),
              )
            }
            return
          }

          if (
            recordingSessionRef.current !== sessionId
            || sessionAbortControllerRef.current?.signal.aborted
          ) {
            return
          }

          setVoiceStatus('recording')
          voiceStatusRef.current = 'recording'
          shouldStopAfterStart = pendingStopRef.current
        }
      }
      catch (e) {
        handleVoiceError(
          e instanceof Error
            ? e
            : new Error(t('chatInput.voice.errors.startSpeechToTextFailed')),
        )
      }
      finally {
        isStartingRef.current = false
        setIsVoiceStarting(false)
      }

      if (shouldStopAfterStart && voiceStatusRef.current === 'recording') {
        pendingStopRef.current = false
        await handleStopRecording()
      }
      return
    }

    if (voiceStatusRef.current === 'recording') {
      await handleStopRecording()
      return
    }
    /** await destroy() 期间状态尚未置 recording，靠重入锁挡住此窗口内的二次启动 */
    if (isStartingRef.current) {
      return
    }
    isStartingRef.current = true
    setIsVoiceStarting(true)
    try {
      if (LiveWaveAudioRef.current) {
        await LiveWaveAudioRef.current.destroy()
      }
      cleanupPlayback()
      prepareRecordingSession(true)
      voiceStatusRef.current = 'recording'
      setVoiceStatus('recording')
    }
    finally {
      isStartingRef.current = false
      setIsVoiceStarting(false)
    }
  })

  const handleReRecord = useLatestCallback(async () => {
    if (voiceMode === 'text') {
      await handleVoiceButtonClick()
      return
    }

    /** 同 handleVoiceButtonClick：重录的 await destroy() 期间防止二次启动 */
    if (isStartingRef.current) {
      return
    }
    isStartingRef.current = true
    setIsVoiceStarting(true)
    try {
      if (LiveWaveAudioRef.current) {
        await LiveWaveAudioRef.current.destroy()
      }
      cleanupPlayback()
      const hadRecording = voiceRecording !== null

      prepareRecordingSession(true)
      voiceStatusRef.current = 'recording'
      setVoiceStatus('recording')

      /** 通知调用者音频数据已清除（重新录制） */
      if (hadRecording) {
        onAudioDataChangeEffect(null)
      }
    }
    finally {
      isStartingRef.current = false
      setIsVoiceStarting(false)
    }
  })

  const handleVoicePanelClose = useLatestCallback(() => void cancelRecording())

  /**
   * 取消本轮录音
   *
   * 宿主给了 `onCancelRecord` 才多绕一步：先把录音器停到音频落地，再走通用清理
   * 不能反过来——`resetVoiceState` 里的 `destroy()` 会把还没组装完的这段音频一起带走
   *
   * 等 `stop()` 的代价是界面晚收起几毫秒（MediaRecorder 的 stop 事件），
   * 换来的是取消路径上音频不再凭空消失
   */
  const cancelRecording = useLatestCallback(async () => {
    const capture = activeCaptureRef.current
    const sessionMode = activeVoiceModeRef.current ?? voiceMode

    if (
      capture
      && sessionMode === 'text'
      && (
        isStartingRef.current
        || voiceStatusRef.current === 'recording'
        || voiceStatusRef.current === 'processing'
      )
    ) {
      const sessionId = recordingSessionRef.current
      const context = createCaptureCancelContext(sessionId)
      sessionAbortControllerRef.current?.abort()

      try {
        await capture.cancel(context)
      }
      catch (error) {
        const normalizedError = error instanceof Error
          ? error
          : new Error('ASR capture cancel failed')
        if (activeCallbacksRef.current?.onError) {
          activeCallbacksRef.current.onError(normalizedError)
        }
        else {
          onVoiceRecorderError?.(normalizedError)
        }
      }
      finally {
        resetVoiceState({ sessionId })
      }
      return
    }

    const recorder = LiveWaveAudioRef.current
    const shouldKeepAudio = !!activeCallbacksRef.current?.onCancelRecord
      && sessionMode === 'text'
      && voiceStatusRef.current === 'recording'
      && !!recorder?.isRecording()

    if (!shouldKeepAudio) {
      resetVoiceState()
      return
    }

    cancellingRef.current = true
    expectBuiltInFinish(recordingSessionRef.current)

    try {
      await recorder!.stop()
    }
    finally {
      /** 停不下来也要把状态收干净，否则这一轮会把输入框永远卡在录音态 */
      cancellingRef.current = false
      resetVoiceState()
    }
  })

  const handleVoicePlayToggle = useLatestCallback(() => {
    if (!voiceRecording) {
      return
    }
    setVoiceError(undefined)
    let audio = playbackRef.current
    if (!audio) {
      audio = new Audio(voiceRecording.audioUrl)
      audio.onended = () => {
        setIsPlayingVoice(false)
      }
      playbackRef.current = audio
    }
    if (isPlayingVoice) {
      audio.pause()
      audio.currentTime = 0
      setIsPlayingVoice(false)
      return
    }
    audio.currentTime = 0
    audio.play()
      .then(() => {
        setIsPlayingVoice(true)
      })
      .catch((error) => {
        setVoiceError(
          error instanceof Error
            ? error.message
            : t('chatInput.voice.audioPlaybackFailed'),
        )
        setIsPlayingVoice(false)
      })
  })

  const handleStreamEnd = useLatestCallback(() => {
    if (voiceStatusRef.current === 'recording') {
      stopDurationTimer()
    }
  })

  useEffect(() => {
    /** 只有当状态真正不同时才更新 ref，避免不必要的同步 */
    if (voiceStatusRef.current !== voiceStatus) {
      voiceStatusRef.current = voiceStatus
    }
  }, [voiceStatus])

  /**
   * 进入录制态时：命令式初始化 LiveWaveAudio（幂等），待流就绪后自动开始录制
   * text 模式下也会启动录音，但仅用于显示波形动画，不会保存录音结果
   */
  useEffect(() => {
    if (!enableVoiceRecorder) {
      return
    }

    if (voiceStatus !== 'recording') {
      return
    }
    if (activeCaptureRef.current && activeVoiceModeRef.current === 'text') {
      return
    }
    const ref = LiveWaveAudioRef.current
    if (!ref) {
      return
    }
    const sessionId = recordingSessionRef.current
    let cancelled = false

    void (async () => {
      try {
        let startPromise = recorderStartPromiseRef.current

        if (!startPromise) {
          startPromise = ref.start()
          recorderStartPromiseRef.current = startPromise

          startPromise
            .finally(() => {
              if (recorderStartPromiseRef.current === startPromise) {
                recorderStartPromiseRef.current = null
              }
            })
            .catch(() => {})
        }

        await startPromise

        const isCurrentRecording = recordingSessionRef.current === sessionId
          && voiceStatusRef.current === 'recording'

        if (!isCurrentRecording) {
          /**
           * 仅当没有更新的录音会话接管共享 recorder 时才销毁它
           * 否则（session 已推进且仍处于 recording）这次 stale destroy 会误杀新会话的
           * 录音，并经 onStreamEnd → handleStreamEnd 关掉新会话刚启动的计时器
           */
          const supersededByActiveSession = recordingSessionRef.current !== sessionId
            && voiceStatusRef.current === 'recording'
          if (!supersededByActiveSession) {
            await ref.destroy()
          }
          return
        }

        if (!cancelled) {
          startDurationTimer()
        }
      }
      catch (error) {
        if (!cancelled && recordingSessionRef.current === sessionId) {
          handleVoiceErrorEffect(error as Error)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enableVoiceRecorder, voiceStatus])

  useEffect(() => {
    if (enableVoiceRecorder) {
      return
    }
    resetVoiceState()
  }, [enableVoiceRecorder])

  /** 组件卸载时清理计时器、播放实例、ASR 和麦克风资源 */
  useEffect(() => {
    return () => {
      clearDurationTimer()
      if (playbackRef.current) {
        playbackRef.current.pause()
        playbackRef.current.currentTime = 0
        playbackRef.current.onended = null
        playbackRef.current = null
      }
      if (speakToTxtRef.current) {
        speakToTxtRef.current.stop()
        speakToTxtRef.current = null
      }
      if (LiveWaveAudioRef.current) {
        void LiveWaveAudioRef.current.destroy()
          .catch((error) => onVoiceRecorderError?.(error as Error))
      }
      sessionAbortControllerRef.current?.abort()
      const captures = new Set([
        activeCaptureRef.current,
        customCaptureRef.current,
      ])
      captures.forEach((capture) => {
        void Promise.resolve(capture?.destroy?.())
          .catch((error) => onVoiceRecorderError?.(error as Error))
      })
    }
  }, [])

  const isVoicePanelVisible = enableVoiceRecorder && (
    (voiceMode === 'audio' && showVoiceRecorder)
    || (voiceMode === 'text' && (voiceStatus === 'recording' || voiceStatus === 'processing'))
  )
  const isExternalCaptureActive = voiceMode === 'text'
    && (
      usesExternalCapture
      || (voiceStatus === 'idle' && !!customCapture)
    )
  const getVoiceAudioLevel = useLatestCallback(() => activeCaptureRef.current?.getAudioLevel?.() ?? 0)

  return {
    LiveWaveAudioRef,
    voiceStatus,
    voiceRecording,
    recordingDuration,
    voiceError,
    isPlayingVoice,
    isVoiceStarting,
    isVoicePanelVisible,
    isExternalCaptureActive,
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
  }
}
