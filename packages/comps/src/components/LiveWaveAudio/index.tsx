'use client'

import type { Recorder } from '@jl-org/tool'
import type { LiveWaveAudioProps, RecordingControls } from './types'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { cn } from 'utils'
import { DEFAULT_PROPS } from './constants'
import {
  useCanvasResize,
  useMicrophone,
  useProcessingAnimation,
  useWaveformDrawer,
} from './hooks'

/**
 * @link https://ui.elevenlabs.io/r/live-waveform.json
 * @link https://ui.elevenlabs.io/docs/components/live-waveform
 */
export const LiveWaveAudio = forwardRef<RecordingControls, LiveWaveAudioProps>((props, ref) => {
  const {
    className,
    deviceId,
    barColor,
    active = DEFAULT_PROPS.active,
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

  const hookProps = { ...props, active, state, barWidth, barGap, barRadius, fadeEdges, fadeWidth, height, sensitivity, smoothingTimeConstant, fftSize, historySize, updateRate, mode, onRecordingFinish }

  useCanvasResize({
    refs,
  })

  useProcessingAnimation({
    ...hookProps,
    refs,
  })

  const { getRecorder, ensureRecorder, destroy } = useMicrophone({
    ...hookProps,
    refs,
  })

  useWaveformDrawer({
    ...hookProps,
    refs,
  })

  /** 暴露录制与初始化控制方法 */
  useImperativeHandle(ref, () => ({
    destroy: () => destroy(),
    start: async () => {
      const recorder = await ensureRecorder()
      if (!recorder) {
        return
      }
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
  }), [getRecorder, ensureRecorder, destroy])

  return (
    <div
      className={ cn('relative h-full w-full', className) }
      ref={ containerRef }
      style={ { height: heightStyle } }
      aria-label={
        active
          ? (state === 'recording'
            ? 'Live audio waveform'
            : state === 'idle'
              ? 'Audio waveform idle'
              : 'Audio waveform stopped')
          : 'Audio waveform idle'
      }
      role="img"
      { ...rest }
    >
      { !active && (
        <div className="border-muted-foreground/20 absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t-2 border-dotted" />
      ) }
      <canvas
        className="block h-full w-full"
        ref={ canvasRef }
        aria-hidden="true"
      />
    </div>
  )
})

LiveWaveAudio.displayName = 'LiveWaveAudio'

export type { LiveWaveAudioProps, RecordingControls } from './types'
