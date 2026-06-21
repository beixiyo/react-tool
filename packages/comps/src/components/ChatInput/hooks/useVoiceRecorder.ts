import type { SyntheticEvent } from 'react'
import type { RecordingControls } from '../..'
import type { TextInsertController, UseVoiceRecorderOptions, VoiceControlStatus, VoiceMode, VoiceRecordingResult } from '../types'
import { SpeakToTxt } from '@jl-org/tool'
import { useLatestCallback } from 'hooks'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useT } from '../../../i18n'

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
  const onTranscriptResultEffect = useEffectEvent((text: string) => onTranscriptResult?.(text))
  const onAudioDataChangeEffect = useEffectEvent((audioData: VoiceRecordingResult | null) => onAudioDataChange?.(audioData))

  /** 创建文本插入控制器 */
  const createTextInsertController = useLatestCallback((): TextInsertController => {
    return {
      get currentText() {
        return actualValue
      },
      get textBeforeRecord() {
        return textBeforeRecordRef?.current || ''
      },
      insertText: (text: string, replaceMode = false) => {
        if (!handleChangeVal)
          return

        if (replaceMode) {
          /** 替换模式：用识别结果替换录音前的文本 */
          const textBefore = textBeforeRecordRef?.current || ''
          handleChangeVal(textBefore + text)
        }
        else {
          /** 追加模式：追加到当前文本末尾 */
          handleChangeVal(actualValue + text)
        }
      },
      replaceText: (text: string) => {
        if (handleChangeVal) {
          handleChangeVal(text)
        }
      },
      appendText: (text: string) => {
        if (handleChangeVal) {
          const textBefore = textBeforeRecordRef?.current || ''
          handleChangeVal(textBefore + text)
        }
      },
    }
  })

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceControlStatus>('idle')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingResult | null>(null)
  const [voiceError, setVoiceError] = useState<string>()
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [voiceMode, setInternalVoiceMode] = useState<VoiceMode>(() => {
    const defaultModes: VoiceMode[] = ['audio', 'text']
    const availableModes = voiceModes || defaultModes
    return availableModes[0] || 'audio'
  })

  /** 当 voiceModes 变化时，如果当前模式不在可用选项中，切换到第一个可用选项 */
  useEffect(() => {
    const defaultModes: VoiceMode[] = ['audio', 'text']
    const availableModes = voiceModes || defaultModes
    if (!availableModes.includes(voiceMode)) {
      const newMode = availableModes[0] || 'audio'
      setInternalVoiceMode(newMode)
      onVoiceModeChange?.(newMode)
    }
  }, [voiceModes, voiceMode, onVoiceModeChange])

  const setVoiceMode = useLatestCallback((mode: VoiceMode) => {
    setInternalVoiceMode(mode)
    onVoiceModeChange?.(mode)
  })

  const LiveWaveAudioRef = useRef<RecordingControls | null>(null)
  const durationTimerRef = useRef<number | undefined>(undefined)
  const durationStartedAtRef = useRef(0)
  const recorderStartPromiseRef = useRef<Promise<void> | null>(null)
  const recordingSessionRef = useRef(0)
  /** 录音启动期重入锁：await destroy() 期间防止物理双击触发二次启动 */
  const isStartingRef = useRef(false)
  const playbackRef = useRef<HTMLAudioElement | null>(null)
  const voiceStatusRef = useRef<VoiceControlStatus>('idle')
  /** 默认 SpeakToTxt 实例（仅在未提供 callbacks 时使用） */
  const speakToTxtRef = useRef<SpeakToTxt | null>(null)

  const getCurrentRecordingDuration = useLatestCallback(() => {
    const startedAt = durationStartedAtRef.current
    if (!startedAt) {
      return 0
    }

    return Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
  })

  const syncRecordingDuration = useLatestCallback(() => {
    const nextDuration = getCurrentRecordingDuration()

    setRecordingDuration(prev => prev === nextDuration
      ? prev
      : nextDuration)
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
    recordingSessionRef.current += 1
    recorderStartPromiseRef.current = null
    resetDurationTimer()

    setVoiceError(undefined)
    setVoiceRecording(null)

    if (showPanel) {
      setShowVoiceRecorder(true)
    }
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

  const resetVoiceState = useLatestCallback(() => {
    cleanupPlayback()
    resetDurationTimer()
    recorderStartPromiseRef.current = null
    recordingSessionRef.current += 1

    if (LiveWaveAudioRef.current?.isRecording()) {
      LiveWaveAudioRef.current.stop()
    }
    if (LiveWaveAudioRef.current) {
      LiveWaveAudioRef.current.destroy()
    }
    if (speakToTxtRef.current) {
      speakToTxtRef.current.stop()
      speakToTxtRef.current = null
    }
    voiceStatusRef.current = 'idle'

    setVoiceStatus('idle')
    setShowVoiceRecorder(false)
    const hadRecording = voiceRecording !== null
    setVoiceRecording(null)
    setVoiceError(undefined)
    /** 通知调用者音频数据已清除 */
    if (hadRecording) {
      onAudioDataChangeEffect(null)
    }
  })

  const handleVoiceError = useLatestCallback((error: Error) => {
    setVoiceError(error.message || t('chatInput.voice.errors.recordingFailed'))
    /** 如果使用 callbacks 模式，优先调用 callbacks.onError */
    if (asrConfig?.callbacks?.onError) {
      asrConfig.callbacks.onError(error)
    }
    else {
      onVoiceRecorderError?.(error)
    }
    resetVoiceState()
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

  const handleRecordingFinish = useLatestCallback(async (audioUrl: string, audioBlob: Blob, chunks: Blob[]) => {
    if (voiceStatusRef.current === 'idle') {
      return
    }

    const result: VoiceRecordingResult = {
      audioUrl,
      audioBlob,
      chunks,
    }

    // text 模式下，录音仅用于显示波形动画，不保存录音结果到 state
    if (voiceMode === 'text') {
      stopDurationTimer()

      /** 如果使用 callbacks 模式，调用 onEndRecord */
      if (asrConfig?.callbacks?.onEndRecord) {
        try {
          const controller = createTextInsertController()
          await asrConfig.callbacks.onEndRecord(result, controller)
          /** ASR 处理完成，从 processing 或 recording 状态转为 idle */
          if (voiceStatusRef.current === 'recording' || voiceStatusRef.current === 'processing') {
            setVoiceStatus('idle')
            voiceStatusRef.current = 'idle'
          }
        }
        catch (error) {
          handleVoiceError(error instanceof Error
            ? error
            : new Error('ASR callback error'))
        }
      }

      /** 通知调用者音频数据变化（即使不保存到 state） */
      onAudioDataChangeEffect(result)
      return
    }

    // audio 模式下，保存录音结果并通知调用者
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
      /** 先调用 onVoiceRecordingFinish 回调，允许外部处理录音结果 */
      onVoiceRecordingFinish?.(result)

      /** 然后通知音频数据变化 */
      onAudioDataChangeEffect(result)
    }, 0)
  })

  const handleStopRecording = useLatestCallback(async () => {
    // text 模式下，停止 ASR 和 LiveWaveAudio 的录音
    if (voiceMode === 'text') {
      /** 如果使用 callbacks 模式，不需要停止 SpeakToTxt（因为外部管理） */
      if (!asrConfig?.callbacks && speakToTxtRef.current) {
        speakToTxtRef.current.stop()
      }

      const recorder = LiveWaveAudioRef.current
      if (recorder && recorder.isRecording()) {
        recorder.stop()
      }
      stopDurationTimer()

      /** 停止后进入 processing，等待 callbacks.onEndRecord 或默认 SpeakToTxt 完成 */
      voiceStatusRef.current = 'processing'
      setVoiceStatus('processing')
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
    recorder.stop()
    stopDurationTimer()
    voiceStatusRef.current = 'processing'
    setVoiceStatus('processing')
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

      // Start STT
      try {
        prepareRecordingSession()

        /** 使用 callbacks 模式 */
        if (asrConfig?.callbacks) {
          /** 调用 onStartRecord 回调 */
          const controller = createTextInsertController()
          try {
            const startResult = asrConfig.callbacks.onStartRecord?.(controller)
            if (startResult instanceof Promise) {
              await startResult
            }
          }
          catch (error) {
            handleVoiceError(error instanceof Error
              ? error
              : new Error('Failed to start ASR callback'))
            return
          }

          /** 启动录音（仅用于显示波形动画） */
          setVoiceStatus('recording')
          voiceStatusRef.current = 'recording'
          return
        }

        /** 使用默认 SpeakToTxt */
        const defaultConfig = asrConfig?.defaultConfig || {}
        const stt = new SpeakToTxt({
          onResult: (text) => {
            onTranscriptResultEffect(text)
          },
          onEnd: () => {
            // ASR 处理完成，从 processing 或 recording 状态转为 idle
            if (voiceStatusRef.current === 'recording' || voiceStatusRef.current === 'processing') {
              setVoiceStatus('idle')
              voiceStatusRef.current = 'idle'
            }
          },
          continuous: defaultConfig.continuous ?? true,
          lang: defaultConfig.lang ?? 'zh-CN',
          interimResults: defaultConfig.interimResults ?? true,
          ...defaultConfig,
        })
        speakToTxtRef.current = stt

        /** 启动 SpeakToTxt */
        const startResult = stt.start()
        if (startResult instanceof Promise) {
          startResult.catch((error) => {
            handleVoiceError(error instanceof Error
              ? error
              : new Error('Failed to start ASR'))
          })
        }
        setVoiceStatus('recording')
        voiceStatusRef.current = 'recording'
      }
      catch (e) {
        handleVoiceError(e instanceof Error
          ? e
          : new Error(t('chatInput.voice.errors.startSpeechToTextFailed')))
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
    }
  })

  const handleVoicePanelClose = useLatestCallback(() => {
    resetVoiceState()
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
        setVoiceError(error instanceof Error
          ? error.message
          : t('chatInput.voice.audioPlaybackFailed'))
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

        const isCurrentRecording = (
          recordingSessionRef.current === sessionId
          && voiceStatusRef.current === 'recording'
        )

        if (!isCurrentRecording) {
          /**
           * 仅当没有更新的录音会话接管共享 recorder 时才销毁它。
           * 否则（session 已推进且仍处于 recording）这次 stale destroy 会误杀新会话的
           * 录音，并经 onStreamEnd → handleStreamEnd 关掉新会话刚启动的计时器。
           */
          const supersededByActiveSession = (
            recordingSessionRef.current !== sessionId
            && voiceStatusRef.current === 'recording'
          )
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
        LiveWaveAudioRef.current.destroy()
      }
    }
  }, [])

  const isVoicePanelVisible = enableVoiceRecorder && (
    (voiceMode === 'audio' && showVoiceRecorder)
    || (voiceMode === 'text' && (voiceStatus === 'recording' || voiceStatus === 'processing'))
  )

  return {
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
  }
}
