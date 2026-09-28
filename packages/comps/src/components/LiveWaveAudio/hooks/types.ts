import type { Recorder, Theme } from '@jl-org/tool'
import type { LiveWaveAudioProps } from '../types'

export type RefStore = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  historyRef: React.RefObject<number[]>
  analyserRef: React.RefObject<AnalyserNode | null>
  audioContextRef: React.RefObject<AudioContext | null>
  streamRef: React.RefObject<MediaStream | null>
  animationRef: React.RefObject<number>
  lastUpdateRef: React.RefObject<number>
  processingAnimationRef: React.RefObject<number | null>
  lastActiveDataRef: React.RefObject<number[]>
  transitionProgressRef: React.RefObject<number>
  staticBarsRef: React.RefObject<number[]>
  needsRedrawRef: React.RefObject<boolean>
  gradientCacheRef: React.RefObject<CanvasGradient | null>
  lastWidthRef: React.RefObject<number>
  recorderRef: React.RefObject<Recorder | null>
}

export type HookProps = LiveWaveAudioProps & {
  refs: RefStore
  theme: Theme
}
