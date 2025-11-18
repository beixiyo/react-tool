import type { Recorder } from '@jl-org/tool'
import type { HTMLAttributes } from 'react'

/**
 * LiveWaveAudio 组件的属性定义
 *
 * - `active` 仅负责生命周期控制。当为 false 时销毁所有麦克风、分析器、音频上下文与动画等资源
 * - `mode` 仅定义渲染样式，不参与数据状态
 * - `state` 定义数据驱动状态：recording 时根据外部音频更新波形，stop 时冻结画面
 */
export type LiveWaveAudioProps = Omit<HTMLAttributes<HTMLDivElement>, 'onError'> & {
  /**
   * 生命周期控制：false 时销毁所有相关资源
   * @default false
   */
  active?: boolean
  /**
   * 麦克风设备 id，不传则使用系统默认输入设备
   */
  deviceId?: string
  /**
   * 渲染样式：静态或滚动
   * @default 'static'
   */
  mode?: 'scrolling' | 'static'
  /**
   * 数据状态：
   * - recording：基于外部音频实时更新波形
   * - stop：冻结画面
   * - idle：播放内置的空闲动画（不依赖外部音频），用于演示/占位
   * @default 'stop'
   */
  state?: 'recording' | 'stop' | 'idle'
  /**
   * 柱条宽度
   * @default 3
   */
  barWidth?: number
  /**
   * 柱条间距
   * @default 1
   */
  barGap?: number
  /**
   * 柱条圆角半径
   * @default 1.5
   */
  barRadius?: number
  /**
   * 柱条颜色（不传则使用 canvas 上下文的计算样式颜色）
   */
  barColor?: string
  /**
   * 是否在两端添加渐隐
   * @default true
   */
  fadeEdges?: boolean
  /**
   * 渐隐宽度（像素）
   * @default 24
   */
  fadeWidth?: number
  /**
   * 组件高度，数字会被转换为像素串
   * @default 64
   */
  height?: string | number
  /**
   * 灵敏度（放大系数）
   * @default 1
   */
  sensitivity?: number
  /**
   * AnalyserNode 的平滑常量
   * @default 0.8
   */
  smoothingTimeConstant?: number
  /**
   * FFT 大小
   * @default 256
   */
  fftSize?: number
  /**
   * 历史数据最大长度（滚动模式）
   * @default 60
   */
  historySize?: number
  /**
   * 画面更新频率（毫秒）
   * @default 30
   */
  updateRate?: number
  /**
   * 错误回调
   */
  onError?: (error: Error) => void
  /**
   * 音频流就绪回调
   */
  onStreamReady?: (stream: MediaStream) => void
  /**
   * 音频流结束回调
   */
  onStreamEnd?: () => void
  /**
   * 录制完成的回调
   * @param audioUrl 录制的音频 URL
   * @param audioBlob 录制的音频 Blob 对象
   * @param chunks 录制的音频数据块数组
   */
  onRecordingFinish?: (audioUrl: string, audioBlob: Blob, chunks: Blob[]) => void
}

/**
 * 录制控制方法
 */
export type RecordingControls = {
  /**
   * 销毁麦克风与 Recorder 相关资源
   */
  destroy: () => void
  /**
   * 开始录制
   */
  start: () => Promise<void>
  /**
   * 停止录制
   */
  stop: () => Promise<void>
  /**
   * 暂停录制
   */
  pause: () => Promise<void>
  /**
   * 继续录制
   */
  resume: () => Promise<void>
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
