'use client'

import type { Recorder } from '@jl-org/tool'
import type { LiveWaveAudioProps, RecordingControls } from './types'
import { useTheme } from 'hooks'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { cn } from 'utils'
import { DEFAULT_PROPS } from './constants'
import {
  useCanvasResize,
  useExternalStream,
  useMicrophone,
  useProcessingAnimation,
  useWaveformDrawer,
} from './hooks'

/**
 * @link https://ui.elevenlabs.io/r/live-waveform.json
 * @link https://ui.elevenlabs.io/docs/components/live-waveform
 * @remarks
 *  - 真正的录音流程需要通过 ref 调用 `start`、`stop` 等方法，这些方法内部会创建并管理 `Recorder`
 *  - 组件挂载后需要先拿到 ref，再按需调用控制方法
 *  - 组件卸载时会自动清理所有资源（麦克风、分析器、音频上下文等）
 */
export const LiveWaveAudio = forwardRef<RecordingControls, LiveWaveAudioProps>((props, ref) => {
  const {
    className,
    externalStream,
    deviceId,
    preferredMimeTypes,
    barColor,
    state = DEFAULT_PROPS.state,
    barWidth = DEFAULT_PROPS.barWidth,
    barGap = DEFAULT_PROPS.barGap,
    barRadius = DEFAULT_PROPS.barRadius,
    fadeEdges = DEFAULT_PROPS.fadeEdges,
    fadeWidth = DEFAULT_PROPS.fadeWidth,
    height = DEFAULT_PROPS.height,
    sensitivity = DEFAULT_PROPS.sensitivity,
    smoothingTimeConstant = DEFAULT_PROPS.smoothingTimeConstant,
    fftSize = DEFAULT_PROPS.fftSize,
    historySize = DEFAULT_PROPS.historySize,
    updateRate = DEFAULT_PROPS.updateRate,
    mode = DEFAULT_PROPS.mode,
    onError,
    onStreamReady,
    onStreamEnd,
    onRecordingFinish,
    ...rest
  } = props

  const [theme] = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<number[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)
  const processingAnimationRef = useRef<number | null>(null)
  const lastActiveDataRef = useRef<number[]>([])
  const transitionProgressRef = useRef(0)
  const staticBarsRef = useRef<number[]>([])
  const needsRedrawRef = useRef(true)
  const gradientCacheRef = useRef<CanvasGradient | null>(null)
  const lastWidthRef = useRef(0)
  const recorderRef = useRef<Recorder | null>(null)

  const heightStyle = typeof height === 'number'
    ? `${height}px`
    : height

  const refs = {
    canvasRef,
    containerRef,
    historyRef,
    analyserRef,
    audioContextRef,
    streamRef,
    animationRef,
    lastUpdateRef,
    processingAnimationRef,
    lastActiveDataRef,
    transitionProgressRef,
    staticBarsRef,
    needsRedrawRef,
    gradientCacheRef,
    lastWidthRef,
    recorderRef,
  }

  const hookProps = { ...props, state, barWidth, barGap, barRadius, fadeEdges, fadeWidth, height, sensitivity, smoothingTimeConstant, fftSize, historySize, updateRate, mode, preferredMimeTypes, onRecordingFinish, theme }

  useCanvasResize({
    refs,
  })

  useProcessingAnimation({
    ...hookProps,
    refs,
  })

  /** 外部流优先级最高，先处理外部流 */
  const { hasExternalStream, cleanup: cleanupExternalStream } = useExternalStream({
    ...hookProps,
    refs,
  })

  const { getRecorder, ensureRecorder, destroy: destroyMicrophone } = useMicrophone({
    ...hookProps,
    refs,
  })

  useWaveformDrawer({
    ...hookProps,
    refs,
  })

  /** 暴露录制与初始化控制方法 */
  useImperativeHandle(ref, () => ({
    destroy: async () => {
      /** 先清理外部流，再清理麦克风 */
      cleanupExternalStream()
      await destroyMicrophone()
    },
    start: async () => {
      /** 如果有外部流，不需要启动录制 */
      if (hasExternalStream()) {
        return
      }
      const recorder = await ensureRecorder()
      if (!recorder) {
        return
      }
      await recorder.stop()
      await recorder.start()
    },
    stop: async () => {
      const recorder = getRecorder()
      if (!recorder) {
        return
      }
      await recorder.stop()
    },
    pause: async () => {
      const recorder = getRecorder()
      if (!recorder || !recorder.isRecording) {
        return
      }
      await recorder.pause()
    },
    resume: async () => {
      const recorder = getRecorder()
      if (!recorder || !recorder.isPaused) {
        return
      }
      await recorder.resume()
    },
    getRecording: () => {
      const recorder = getRecorder()
      if (!recorder || !recorder.audioUrl) {
        return null
      }
      const audioBlob = new Blob(recorder.chunks, { type: recorder.mimeType })
      return {
        audioUrl: recorder.audioUrl,
        audioBlob,
        chunks: recorder.chunks,
      }
    },
    isRecording: () => {
      const recorder = getRecorder()
      return recorder?.isRecording ?? false
    },
    isPaused: () => {
      const recorder = getRecorder()
      return recorder?.isPaused ?? false
    },
    getRecorder: () => {
      return getRecorder()
    },
  }), [getRecorder, ensureRecorder, destroyMicrophone, hasExternalStream, cleanupExternalStream])

  return (
    <div
      className={ cn(
        'relative h-full w-full text-neutral-900 dark:text-neutral-50',
        className,
      ) }
      ref={ containerRef }
      style={ { height: heightStyle } }
      aria-label={
        state === 'recording'
          ? 'Live audio waveform'
          : state === 'idle'
            ? 'Audio waveform idle'
            : 'Audio waveform stopped'
      }
      role="img"
      { ...rest }
    >
      <canvas
        className="block h-full w-full"
        ref={ canvasRef }
        aria-hidden="true"
      />
    </div>
  )
})

LiveWaveAudio.displayName = 'LiveWaveAudio'
