import type { HookProps } from './types'
import { onUnmounted, useWatchRef } from 'hooks'
import { useEffect, useRef } from 'react'

/**
 * 处理外部音频流的 hook
 * 当有外部流时，创建 AudioContext 和 AnalyserNode，并将外部流连接到分析器
 * 优先级高于麦克风流
 */
export function useExternalStream({
  externalStream,
  fftSize,
  smoothingTimeConstant,
  onError,
  onStreamReady,
  onStreamEnd,
  refs,
}: HookProps) {
  const {
    streamRef,
    audioContextRef,
    analyserRef,
    animationRef,
  } = refs

  const onErrorRef = useWatchRef(onError)
  const onStreamReadyRef = useWatchRef(onStreamReady)
  const onStreamEndRef = useWatchRef(onStreamEnd)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const externalStreamRef = useRef<MediaStream | null | undefined>(externalStream)

  /** 更新外部流引用 */
  useEffect(() => {
    externalStreamRef.current = externalStream
  }, [externalStream])

  /**
   * 清理外部流相关资源
   */
  const cleanupExternalStream = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect()
      }
      catch (e) {
        /** 忽略断开连接时的错误 */
      }
      sourceNodeRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {
        /** 忽略关闭时的错误 */
      })
    }

    if (streamRef.current) {
      streamRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
    }

    onStreamEndRef.current?.()
  }

  /** 监听外部流变化 */
  useEffect(() => {
    /**
     * 设置外部流
     */
    const setupExternalStream = async (stream: MediaStream) => {
      /** 先清理旧资源 */
      cleanupExternalStream()

      try {
        /** 创建 AudioContext */
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioContext

        /** 创建 AnalyserNode */
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = fftSize!
        analyser.smoothingTimeConstant = smoothingTimeConstant!
        analyserRef.current = analyser

        /** 创建 MediaStreamAudioSourceNode 并连接到分析器 */
        const sourceNode = audioContext.createMediaStreamSource(stream)
        sourceNode.connect(analyser)
        sourceNodeRef.current = sourceNode

        /** 更新流引用 */
        streamRef.current = stream

        /** 触发就绪回调 */
        onStreamReadyRef.current?.(stream)
      }
      catch (error) {
        onErrorRef.current?.(error as Error)
        cleanupExternalStream()
      }
    }

    if (externalStream) {
      setupExternalStream(externalStream)
    }
    else {
      cleanupExternalStream()
    }

    return () => {
      cleanupExternalStream()
    }
  }, [externalStream, fftSize, smoothingTimeConstant])

  /** 组件卸载时清理资源 */
  onUnmounted(() => {
    cleanupExternalStream()
  })

  return {
    hasExternalStream: () => !!externalStreamRef.current,
    cleanup: cleanupExternalStream,
  }
}
