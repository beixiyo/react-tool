'use client'

import type { Recorder } from '@jl-org/tool'
import type { LiveWaveformProps, RecordingControls } from './types'
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
export const LiveWaveform = forwardRef<RecordingControls, LiveWaveformProps>((props, ref) => {
  const {
    className,
    active = DEFAULT_PROPS.active,
    processing = DEFAULT_PROPS.processing,
    deviceId,
    barWidth = DEFAULT_PROPS.barWidth,
    barGap = DEFAULT_PROPS.barGap,
    barRadius = DEFAULT_PROPS.barRadius,
    barColor,
    fadeEdges = DEFAULT_PROPS.fadeEdges,
    fadeWidth = DEFAULT_PROPS.fadeWidth,
    height = DEFAULT_PROPS.height,
    sensitivity = DEFAULT_PROPS.sensitivity,
    smoothingTimeConstant = DEFAULT_PROPS.smoothingTimeConstant,
    fftSize = DEFAULT_PROPS.fftSize,
    historySize = DEFAULT_PROPS.historySize,
    updateRate = DEFAULT_PROPS.updateRate,
    mode = DEFAULT_PROPS.mode,
    enableRecording = false,
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

  const hookProps = { ...props, active, processing, barWidth, barGap, barRadius, fadeEdges, fadeWidth, height, sensitivity, smoothingTimeConstant, fftSize, historySize, updateRate, mode, enableRecording, onRecordingFinish }

  useCanvasResize({
    refs,
  })

  useProcessingAnimation({
    ...hookProps,
    refs,
  })

  const getRecorder = useMicrophone({
    ...hookProps,
    refs,
  })

  useWaveformDrawer({
    ...hookProps,
    refs,
  })

  /** 暴露录制控制方法 */
  useImperativeHandle(ref, () => ({
    startRecording: () => {
      if (recorderRef.current) {
        recorderRef.current.start()
      }
    },
    stopRecording: () => {
      if (recorderRef.current) {
        recorderRef.current.stop()
      }
    },
    getRecording: () => {
      if (!recorderRef.current || !recorderRef.current.audioUrl) {
        return null
      }
      const audioBlob = new Blob(recorderRef.current.chunks, { type: recorderRef.current.mimeType })
      return {
        audioUrl: recorderRef.current.audioUrl,
        audioBlob,
        chunks: recorderRef.current.chunks,
      }
    },
    isRecording: () => {
      return recorderRef.current?.isRecording() ?? false
    },
    getRecorder: () => {
      return getRecorder()
    },
  }), [getRecorder])

  return (
    <div
      className={ cn('relative h-full w-full', className) }
      ref={ containerRef }
      style={ { height: heightStyle } }
      aria-label={
        active
          ? 'Live audio waveform'
          : processing
            ? 'Processing audio'
            : 'Audio waveform idle'
      }
      role="img"
      { ...rest }
    >
      { !active && !processing && (
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

LiveWaveform.displayName = 'LiveWaveform'

export type { LiveWaveformProps, RecordingControls } from './types'
