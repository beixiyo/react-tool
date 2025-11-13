import type { HookProps } from './types'
import { Recorder } from '@jl-org/tool'
import { onUnmounted } from 'hooks'
import { useEffect } from 'react'

export function useMicrophone({
  active,
  deviceId,
  fftSize,
  smoothingTimeConstant,
  enableRecording = false,
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

  /**
   * 初始化（幂等）：如果已有可用流则直接复用，否则重建
   */
  const setupMicrophone = async () => {
    if (recorderRef.current && streamRef.current) {
      const hasLiveTrack = streamRef.current.getTracks().some(track => track.readyState === 'live')
      if (hasLiveTrack) {
        return recorderRef.current
      }
    }

    if (recorderRef.current) {
      recorderRef.current.destroy()
    }

    try {
      const recorder = new Recorder({
        deviceId,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        createAnalyser: true,
        fftSize: fftSize!,
        smoothingTimeConstant: smoothingTimeConstant!,
        onError,
        onFinish: enableRecording
          ? (audioUrl, chunks) => {
              const audioBlob = new Blob(chunks, { type: recorder.mimeType })
              onRecordingFinish?.(audioUrl, audioBlob, chunks)
            }
          : undefined,
      })

      await recorder.init()

      recorderRef.current = recorder

      if (recorder.analyser) {
        analyserRef.current = recorder.analyser
      }
      if (recorder.stream) {
        streamRef.current = recorder.stream
        onStreamReady?.(recorder.stream)
      }
      if (recorder.audioContext) {
        audioContextRef.current = recorder.audioContext
      }

      historyRef.current = []

      return recorder
    }
    catch (error) {
      onError?.(error as Error)
      return null
    }
  }

  /**
   * 销毁：停止录制并清理资源（不置空 recorderRef）
   */
  const destroyMicrophone = () => {
    if (enableRecording && recorderRef.current) {
      const recorder = recorderRef.current
      if (recorder.isRecording()) {
        recorder.stop()
      }
    }

    if (recorderRef.current) {
      recorderRef.current.destroy()
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
    onStreamEnd?.()
  }

  onUnmounted(() => {
    destroyMicrophone()
  })

  useEffect(() => {
    if (!active) {
      /** 如果启用了录制功能，在停止时完成录制 */
      if (enableRecording && recorderRef.current) {
        const recorder = recorderRef.current
        /** 如果正在录制，停止录制 */
        if (recorder.isRecording()) {
          recorder.stop()
        }
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
      onStreamEnd?.()
      return
    }

    setupMicrophone()

    return () => {
      /** 如果启用了录制功能，在清理前停止录制 */
      if (enableRecording && recorderRef.current) {
        const recorder = recorderRef.current
        if (recorder.isRecording()) {
          recorder.stop()
        }
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
      onStreamEnd?.()
    }
  }, [
    active,
    deviceId,
    fftSize,
    smoothingTimeConstant,
    enableRecording,
    onError,
    onStreamReady,
    onStreamEnd,
    onRecordingFinish,
    streamRef,
    audioContextRef,
    animationRef,
    analyserRef,
    historyRef,
    recorderRef,
  ])

  /** 返回获取与控制 Recorder 的函数集合 */
  return {
    getRecorder: () => recorderRef.current,
    init: setupMicrophone,
    destroy: destroyMicrophone,
  }
}
