import type { RefObject, SyntheticEvent } from 'react'
import type { RecordingControls } from '../..'
import type { VoiceControlStatus } from '../components'
import type { ASRConfig, TextInsertController, VoiceMode, VoiceRecordingResult } from '../types'
import { SpeakToTxt } from '@jl-org/tool'
import { useT } from 'i18n/react'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const createTextInsertController = useCallback((): TextInsertController => {
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
  }, [actualValue, handleChangeVal, textBeforeRecordRef])

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceControlStatus>('idle')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingResult | null>(null)
  const [voiceError, setVoiceError] = useState<string>()
  const [isRecorderReady, setIsRecorderReady] = useState(false)
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

  const setVoiceMode = useCallback((mode: VoiceMode) => {
    setInternalVoiceMode(mode)
    onVoiceModeChange?.(mode)
  }, [onVoiceModeChange, voiceMode])

  const LiveWaveAudioRef = useRef<RecordingControls | null>(null)
  const durationTimerRef = useRef<number | undefined>(undefined)
  const playbackRef = useRef<HTMLAudioElement | null>(null)
  const voiceStatusRef = useRef<VoiceControlStatus>('idle')
  /** 默认 SpeakToTxt 实例（仅在未提供 callbacks 时使用） */
  const speakToTxtRef = useRef<SpeakToTxt | null>(null)

  const startDurationTimer = useCallback(() => {
    if (durationTimerRef.current !== undefined) {
      return
    }
    durationTimerRef.current = window.setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
  }, [])

  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current === undefined) {
      return
    }
    window.clearInterval(durationTimerRef.current)
    durationTimerRef.current = undefined
  }, [])

  const cleanupPlayback = useCallback(() => {
    if (!playbackRef.current) {
      return
    }
    playbackRef.current.pause()
    playbackRef.current.currentTime = 0
    playbackRef.current.onended = null
    playbackRef.current = null
    setIsPlayingVoice(false)
  }, [])

  const resetVoiceState = useCallback(() => {
    cleanupPlayback()
    stopDurationTimer()

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
    setRecordingDuration(0)
    const hadRecording = voiceRecording !== null
    setVoiceRecording(null)
    setIsRecorderReady(false)
    setVoiceError(undefined)
    /** 通知调用者音频数据已清除 */
    if (hadRecording) {
      onAudioDataChangeEffect(null)
    }
  }, [cleanupPlayback, stopDurationTimer, voiceRecording])

  const handleVoiceError = useCallback((error: Error) => {
    setVoiceError(error.message || t('chatInput.voice.errors.recordingFailed'))
    /** 如果使用 callbacks 模式，优先调用 callbacks.onError */
    if (asrConfig?.callbacks?.onError) {
      asrConfig.callbacks.onError(error)
    }
    else {
      onVoiceRecorderError?.(error)
    }
    resetVoiceState()
  }, [onVoiceRecorderError, resetVoiceState, t, asrConfig])

  const handleWaveformError = useCallback((payload: Error | SyntheticEvent<HTMLDivElement>) => {
    if (payload instanceof Error) {
      handleVoiceError(payload)
      return
    }
    const nativeError = payload.nativeEvent
    if (nativeError instanceof Error) {
      handleVoiceError(nativeError)
    }
  }, [handleVoiceError])

  const handleRecordingFinish = useCallback(async (audioUrl: string, audioBlob: Blob, chunks: Blob[]) => {
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
      setIsRecorderReady(false)

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
    setIsRecorderReady(false)
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
  }, [cleanupPlayback, onVoiceRecordingFinish, stopDurationTimer, voiceMode, asrConfig, createTextInsertController, handleVoiceError])

  const handleStopRecording = useCallback(async () => {
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

      /** 如果使用 callbacks 模式，停止后直接进入 processing 状态，等待 onEndRecord 完成 */
      if (asrConfig?.callbacks) {
        voiceStatusRef.current = 'processing'
        setVoiceStatus('processing')
      }
      else {
        /** 在 text 模式下，停止后进入 processing 状态，等待 SpeakToTxt 处理完成 */
        voiceStatusRef.current = 'processing'
        setVoiceStatus('processing')
      }
      return
    }

    const recorder = LiveWaveAudioRef.current
    if (!recorder) {
      return
    }
    if (!recorder.isRecording()) {
      return
    }
    recorder.stop()
    stopDurationTimer()
    voiceStatusRef.current = 'processing'
    setVoiceStatus('processing')
  }, [stopDurationTimer, voiceMode, asrConfig])

  const handleVoiceButtonClick = useCallback(async () => {
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
    if (LiveWaveAudioRef.current) {
      LiveWaveAudioRef.current.destroy()
    }
    cleanupPlayback()
    setVoiceError(undefined)
    setVoiceRecording(null)
    setRecordingDuration(0)
    setShowVoiceRecorder(true)
    setIsRecorderReady(false)
    voiceStatusRef.current = 'recording'
    setVoiceStatus('recording')
  }, [cleanupPlayback, enableVoiceRecorder, handleStopRecording, voiceMode, handleVoiceError, asrConfig, createTextInsertController])

  const handleReRecord = useCallback(async () => {
    if (voiceMode === 'text') {
      await handleVoiceButtonClick()
      return
    }

    if (LiveWaveAudioRef.current) {
      await LiveWaveAudioRef.current.destroy()
    }
    cleanupPlayback()
    setVoiceError(undefined)
    const hadRecording = voiceRecording !== null

    setVoiceRecording(null)
    setRecordingDuration(0)
    setShowVoiceRecorder(true)
    setIsRecorderReady(false)
    voiceStatusRef.current = 'recording'
    setVoiceStatus('recording')

    /** 通知调用者音频数据已清除（重新录制） */
    if (hadRecording) {
      onAudioDataChangeEffect(null)
    }

    const ref = LiveWaveAudioRef.current
    if (ref) {
      try {
        await ref.start()
      }
      catch (error) {
        handleVoiceError(error as Error)
      }
    }
  }, [cleanupPlayback, handleVoiceError, voiceMode, handleVoiceButtonClick, voiceRecording])

  const handleVoicePanelClose = useCallback(() => {
    resetVoiceState()
  }, [resetVoiceState])

  const handleVoicePlayToggle = useCallback(() => {
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
  }, [isPlayingVoice, voiceRecording, t])

  const handleStreamReady = useCallback((_: MediaStream) => {
    setIsRecorderReady(true)
  }, [])

  const handleStreamEnd = useCallback(() => {
    setIsRecorderReady(false)
  }, [])

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
    ; (async () => {
      try {
        await ref.start()
      }
      catch (error) {
        handleVoiceError(error as Error)
      }
    })()
  }, [enableVoiceRecorder, handleVoiceError, voiceStatus])

  useEffect(() => {
    if (voiceStatus !== 'recording' || !isRecorderReady) {
      return
    }
    // Only for audio mode need timer? STT maybe doesn't need duration?
    // Let's keep it consistent
    setRecordingDuration(0)
    setVoiceRecording(null)
    startDurationTimer()
  }, [isRecorderReady, startDurationTimer, voiceStatus])

  useEffect(() => {
    if (voiceStatus !== 'recording') {
      setIsRecorderReady(false)
    }
  }, [voiceStatus])

  useEffect(() => {
    if (enableVoiceRecorder) {
      return
    }
    resetVoiceState()
  }, [enableVoiceRecorder, resetVoiceState])

  /**
   * 这个 useEffect 没有实际作用，只是为了在组件卸载时清理资源
   * 但由于 resetVoiceState 的依赖变化会导致不必要的 cleanup 调用，所以移除它
   */
  useEffect(() => {
    return () => {
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
    handleStreamReady,
    handleStreamEnd,
  }
}

/**
 * 语音录制 Hook 的配置项
 */
export type UseVoiceRecorderOptions = {
  /**
   * 是否启用语音录制功能
   * @default false
   */
  enableVoiceRecorder?: boolean
  /**
   * 语音录制完成回调
   */
  onVoiceRecordingFinish?: (recording: VoiceRecordingResult) => void
  /**
   * 语音录制错误回调
   */
  onVoiceRecorderError?: (error: Error) => void
  /**
   * 语音转文字结果回调
   */
  onTranscriptResult?: (text: string) => void
  /**
   * 音频数据变化回调
   * 当音频数据发生变化时（录制完成、清除等）会调用此回调通知调用者
   */
  onAudioDataChange?: (audioData: VoiceRecordingResult | null) => void
  /**
   * 可用的语音模式选项
   * 如果不提供，默认显示所有选项 ['audio', 'text']
   * 组件内部会自动使用第一个可用选项作为初始模式
   */
  voiceModes?: VoiceMode[]
  /**
   * 语音模式切换回调
   */
  onVoiceModeChange?: (mode: VoiceMode) => void
  /**
   * ASR 配置选项
   * - 如果提供 callbacks，使用回调模式
   * - 如果不提供，使用默认的 SpeakToTxt（使用 defaultConfig）
   */
  asrConfig?: ASRConfig
  /**
   * 当前输入框的值（用于 TextInsertController）
   */
  actualValue?: string
  /**
   * 更新输入框值的函数（用于 TextInsertController）
   */
  handleChangeVal?: (value: string) => void
  /**
   * 录音前的文本引用（用于 TextInsertController）
   */
  textBeforeRecordRef?: RefObject<string>
}
