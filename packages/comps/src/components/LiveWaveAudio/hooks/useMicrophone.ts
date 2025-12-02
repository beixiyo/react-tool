import type { HookProps } from './types'
import { Recorder } from '@jl-org/tool'
import { onUnmounted, useWatchRef } from 'hooks'

export function useMicrophone({
  externalStream,
  deviceId,
  preferredMimeTypes,
  fftSize,
  smoothingTimeConstant,
  onError,
  onStreamReady,
  onStreamEnd,
  onRecordingFinish,
  refs,
}: HookProps) {
  const {
    streamRef,
    audioContextRef,
    animationRef,
    analyserRef,
    historyRef,
    recorderRef,
  } = refs
  const onErrorRef = useWatchRef(onError)
  const onStreamReadyRef = useWatchRef(onStreamReady)
  const onStreamEndRef = useWatchRef(onStreamEnd)
  const onRecordingFinishRef = useWatchRef(onRecordingFinish)

  /**
   * 确保 Recorder 已就绪（幂等）：复用可用流，否则重建
   * 注意：如果有外部流，则不创建新的 Recorder
   */
  const ensureRecorder = async () => {
    /** 如果有外部流，不创建新的 Recorder */
    if (externalStream) {
      return null
    }

    if (recorderRef.current && streamRef.current) {
      const hasLiveTrack = streamRef.current.getTracks().some(track => track.readyState === 'live')
      if (hasLiveTrack) {
        onStreamReadyRef.current?.(streamRef.current)
        return recorderRef.current
      }
    }

    if (recorderRef.current) {
      await recorderRef.current.destroy()
    }

    try {
      const recorder = new Recorder({
        deviceId,
        preferredMimeTypes,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        createAnalyser: true,
        fftSize: fftSize!,
        smoothingTimeConstant: smoothingTimeConstant!,
        autoInit: false,
        onError: e => onErrorRef.current?.(e as Error),
        onFinish: (audioUrl, chunks) => {
          const audioBlob = new Blob(chunks, { type: recorder.mimeType })
          onRecordingFinishRef.current?.(audioUrl, audioBlob, chunks)
        },
      })

      await recorder.init()
      recorderRef.current = recorder

      if (recorder.analyser) {
        analyserRef.current = recorder.analyser
      }
      if (recorder.capture.stream) {
        streamRef.current = recorder.capture.stream
        onStreamReadyRef.current?.(recorder.capture.stream)
      }
      if (recorder.analysis.audioContext) {
        audioContextRef.current = recorder.analysis.audioContext
      }

      historyRef.current = []

      return recorder
    }
    catch (error) {
      onErrorRef.current?.(error as Error)
      return null
    }
  }

  /**
   * 销毁：停止录制并清理资源（不置空 recorderRef）
   */
  const destroyMicrophone = async () => {
    if (recorderRef.current) {
      const recorder = recorderRef.current
      if (recorder.isRecording) {
        await recorder.stop()
      }
    }

    if (recorderRef.current) {
      await recorderRef.current.destroy()
    }

    if (streamRef.current) {
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
    }
    onStreamEndRef.current?.()
  }

  /** 组件卸载时自动清理资源 */
  onUnmounted(() => {
    destroyMicrophone()
  })

  /** 返回获取与控制 Recorder 的函数集合 */
  return {
    getRecorder: () => recorderRef.current,
    ensureRecorder,
    destroy: destroyMicrophone,
  }
}
