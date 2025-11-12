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
}: HookProps): () => Recorder | null {
  const {
    streamRef,
    audioContextRef,
    animationRef,
    analyserRef,
    historyRef,
    recorderRef,
  } = refs

  onUnmounted(() => {
    if (recorderRef.current) {
      recorderRef.current.destroy()
      recorderRef.current = null
    }
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

    const setupMicrophone = async () => {
      if (recorderRef.current) {
        recorderRef.current.destroy()
        recorderRef.current = null
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
          /** 如果启用了录制功能，设置录制完成的回调 */
          onFinish: enableRecording
            ? (audioUrl, chunks) => {
              /** 使用与 Recorder 类相同的 MIME 类型 */
                const audioBlob = new Blob(chunks, { type: recorder.mimeType })
                onRecordingFinish?.(audioUrl, audioBlob, chunks)
              }
            : undefined,
        })

        await recorder.init()

        recorderRef.current = recorder

        /** 将 Recorder 的资源赋值给 refs，以便其他 hooks 使用 */
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

        /** 注意：录制功能需要手动调用 startRecording() 开始，不会自动开始 */
      }
      catch (error) {
        onError?.(error as Error)
      }
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

  /** 返回获取 Recorder 实例的函数 */
  return () => recorderRef.current
}
