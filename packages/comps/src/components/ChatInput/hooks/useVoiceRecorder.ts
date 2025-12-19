import type { SyntheticEvent } from 'react'
import type { RecordingControls } from '../..'
import type { VoiceControlStatus } from '../components'
import type { VoiceRecordingResult } from '../types'
import { SpeakToTxt } from '@jl-org/tool'
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
    voiceMode: controlledVoiceMode,
    onVoiceModeChange,
  } = options

  const onTranscriptResultRef = useRef(onTranscriptResult)
  useEffect(() => {
    onTranscriptResultRef.current = onTranscriptResult
  }, [onTranscriptResult])

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceControlStatus>('idle')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingResult | null>(null)
  const [voiceError, setVoiceError] = useState<string>()
  const [isRecorderReady, setIsRecorderReady] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [internalVoiceMode, setInternalVoiceMode] = useState<'audio' | 'text'>('audio')

  const isVoiceModeControlled = controlledVoiceMode !== undefined
  const voiceMode = isVoiceModeControlled
    ? controlledVoiceMode
    : internalVoiceMode

  const setVoiceMode = useCallback((mode: 'audio' | 'text') => {
    if (!isVoiceModeControlled) {
      setInternalVoiceMode(mode)
    }
    onVoiceModeChange?.(mode)
  }, [isVoiceModeControlled, onVoiceModeChange])

  const LiveWaveAudioRef = useRef<RecordingControls | null>(null)
  const durationTimerRef = useRef<number | undefined>(undefined)
  const playbackRef = useRef<HTMLAudioElement | null>(null)
  const voiceStatusRef = useRef<VoiceControlStatus>('idle')
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
    setVoiceRecording(null)
    setIsRecorderReady(false)
    setVoiceError(undefined)
  }, [cleanupPlayback, stopDurationTimer])

  const handleVoiceError = useCallback((error: Error) => {
    setVoiceError(error.message || '语音录制失败，请检查麦克风权限')
    onVoiceRecorderError?.(error)
    resetVoiceState()
  }, [onVoiceRecorderError, resetVoiceState])

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

  const handleRecordingFinish = useCallback((audioUrl: string, audioBlob: Blob, chunks: Blob[]) => {
    if (voiceStatusRef.current === 'idle') {
      return
    }

    // text 模式下，录音仅用于显示波形动画，不保存录音结果
    if (voiceMode === 'text') {
      stopDurationTimer()
      setIsRecorderReady(false)
      return
    }

    cleanupPlayback()
    const result: VoiceRecordingResult = {
      audioUrl,
      audioBlob,
      chunks,
    }
    setVoiceRecording(result)
    onVoiceRecordingFinish?.(result)
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
  }, [cleanupPlayback, onVoiceRecordingFinish, stopDurationTimer, voiceMode])

  const handleStopRecording = useCallback(() => {
    // text 模式下，停止 SpeakToTxt 和 LiveWaveAudio 的录音
    if (voiceMode === 'text') {
      if (speakToTxtRef.current) {
        speakToTxtRef.current.stop()
      }
      const recorder = LiveWaveAudioRef.current
      if (recorder && recorder.isRecording()) {
        recorder.stop()
      }
      stopDurationTimer()
      setVoiceStatus('idle')
      voiceStatusRef.current = 'idle'
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
  }, [stopDurationTimer, voiceMode])

  const handleVoiceButtonClick = useCallback(() => {
    if (!enableVoiceRecorder) {
      return
    }

    if (voiceMode === 'text') {
      if (voiceStatusRef.current === 'recording') {
        handleStopRecording()
        return
      }

      // Start STT
      try {
        const stt = new SpeakToTxt({
          onResult: (text) => {
            onTranscriptResultRef.current?.(text)
          },
          onEnd: () => {
            // Auto stop when silence or end
            // But we might want to keep it open if continuous is true?
            // If onEnd fires, it means it stopped.
            if (voiceStatusRef.current === 'recording') {
              setVoiceStatus('idle')
              voiceStatusRef.current = 'idle'
            }
          },
          continuous: true,
          lang: 'zh-CN', // Default to Chinese as per original doc
          interimResults: true,
        })
        stt.start()
        speakToTxtRef.current = stt
        setVoiceStatus('recording')
        voiceStatusRef.current = 'recording'
      }
      catch (e) {
        handleVoiceError(e instanceof Error
          ? e
          : new Error('Start Speech to text failed'))
      }
      return
    }

    if (voiceStatusRef.current === 'recording') {
      handleStopRecording()
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
  }, [cleanupPlayback, enableVoiceRecorder, handleStopRecording, voiceMode, handleVoiceError])

  const handleReRecord = useCallback(async () => {
    if (voiceMode === 'text') {
      handleVoiceButtonClick()
      return
    }

    if (LiveWaveAudioRef.current) {
      await LiveWaveAudioRef.current.destroy()
    }
    cleanupPlayback()
    setVoiceError(undefined)
    setVoiceRecording(null)
    setRecordingDuration(0)
    setShowVoiceRecorder(true)
    setIsRecorderReady(false)
    voiceStatusRef.current = 'recording'
    setVoiceStatus('recording')

    const ref = LiveWaveAudioRef.current
    if (ref) {
      try {
        await ref.start()
      }
      catch (error) {
        handleVoiceError(error as Error)
      }
    }
  }, [cleanupPlayback, handleVoiceError, voiceMode, handleVoiceButtonClick])

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
          : '音频播放失败')
        setIsPlayingVoice(false)
      })
  }, [isPlayingVoice, voiceRecording])

  const handleStreamReady = useCallback((_: MediaStream) => {
    setIsRecorderReady(true)
  }, [])

  const handleStreamEnd = useCallback(() => {
    setIsRecorderReady(false)
  }, [])

  useEffect(() => {
    voiceStatusRef.current = voiceStatus
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

  useEffect(() => {
    return () => {
      resetVoiceState()
    }
  }, [resetVoiceState])

  const isVoicePanelVisible = enableVoiceRecorder && (
    (voiceMode === 'audio' && showVoiceRecorder)
    || (voiceMode === 'text' && voiceStatus === 'recording')
  )

  return {
    LiveWaveAudioRef,
    voiceStatus,
    recordingDuration,
    voiceRecording,
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
   * 当前语音模式
   */
  voiceMode?: 'audio' | 'text'
  /**
   * 语音模式切换回调
   */
  onVoiceModeChange?: (mode: 'audio' | 'text') => void
}
