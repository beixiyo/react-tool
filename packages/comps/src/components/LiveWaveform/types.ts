import type { Recorder } from '@jl-org/tool'
import type { HTMLAttributes } from 'react'

export type LiveWaveformProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean
  processing?: boolean
  deviceId?: string
  barWidth?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  fadeEdges?: boolean
  fadeWidth?: number
  height?: string | number
  sensitivity?: number
  smoothingTimeConstant?: number
  fftSize?: number
  historySize?: number
  updateRate?: number
  mode?: 'scrolling' | 'static'
  onError?: (error: Error) => void
  onStreamReady?: (stream: MediaStream) => void
  onStreamEnd?: () => void
  /**
   * 录制完成的回调
   * @param audioUrl 录制的音频 URL
   * @param audioBlob 录制的音频 Blob 对象
   * @param chunks 录制的音频数据块数组
   */
  onRecordingFinish?: (audioUrl: string, audioBlob: Blob, chunks: Blob[]) => void
  /**
   * 是否启用录制功能
   * @default false
   */
  enableRecording?: boolean
}

/**
 * 录制控制方法
 */
export type RecordingControls = {
  /**
   * 开始录制
   */
  startRecording: () => void
  /**
   * 停止录制
   */
  stopRecording: () => void
  /**
   * 获取当前录制的音频
   * @returns 如果正在录制或录制完成，返回音频 URL 和 Blob，否则返回 null
   */
  getRecording: () => { audioUrl: string, audioBlob: Blob, chunks: Blob[] } | null
  /**
   * 检查是否正在录制
   */
  isRecording: () => boolean
  /**
   * 获取 Recorder 实例，用于调用下载等高级功能
   * @returns 当前 Recorder 实例，如果未初始化则返回 null
   */
  getRecorder: () => Recorder | null
}
