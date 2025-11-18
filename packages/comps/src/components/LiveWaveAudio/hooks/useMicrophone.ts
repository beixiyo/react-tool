import type { HookProps } from './types'
import { Recorder } from '@jl-org/tool'
import { onUnmounted, useAsyncEffect } from 'hooks'

export function useMicrophone({
  active,
  deviceId,
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

  /**
   * 确保 Recorder 已就绪（幂等）：复用可用流，否则重建
   */
  const ensureRecorder = async () => {
    if (recorderRef.current && streamRef.current) {
      const hasLiveTrack = streamRef.current.getTracks().some(track => track.readyState === 'live')
      if (hasLiveTrack) {
        onStreamReady?.(streamRef.current)
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
        autoInit: false,
        onError,
        onFinish: (audioUrl, chunks) => {
          const audioBlob = new Blob(chunks, { type: recorder.mimeType })
          onRecordingFinish?.(audioUrl, audioBlob, chunks)
        },
      })

      await recorder.init()
      recorderRef.current = recorder

      if (recorder.analyser) {
        analyserRef.current = recorder.analyser
      }
      if (recorder.capture.stream) {
        streamRef.current = recorder.capture.stream
        onStreamReady?.(recorder.capture.stream)
      }
      if (recorder.analysis.audioContext) {
        audioContextRef.current = recorder.analysis.audioContext
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
  const destroyMicrophone = async () => {
    if (recorderRef.current) {
      const recorder = recorderRef.current
      if (recorder.isRecording) {
        recorder.stop()
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
    onStreamEnd?.()
  }

  onUnmounted(() => {
    destroyMicrophone()
  })

  useAsyncEffect(async () => {
    if (!active) {
      /** 如果启用了录制功能，在停止时完成录制 */
      if (recorderRef.current) {
        const recorder = recorderRef.current
        /** 如果正在录制，停止录制 */
        if (recorder.isRecording) {
          await recorder.stop()
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

    return () => {
      /** 如果启用了录制功能，在清理前停止录制 */
      if (recorderRef.current) {
        const recorder = recorderRef.current
        if (recorder.isRecording) {
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
    ensureRecorder,
    destroy: destroyMicrophone,
  }
}
