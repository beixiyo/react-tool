import type * as React from 'react'

/** 音频组件属性；原生媒体事件保留 React 的事件签名 */
export type AudioProps = React.AudioHTMLAttributes<HTMLAudioElement> & {
  /** 受控目标倍速；外部临时改动只观察，加载或目标变化时恢复 */
  playbackRate?: number
  /** 非受控初始目标倍速，仅挂载时读取。@default 1 */
  defaultPlaybackRate?: number
  /** 非受控时换源或 reload 保留目标倍速。@default false */
  preservePlaybackRateOnSourceChange?: boolean
  /** @default 0.25 */
  minRate?: number
  /** @default 4 */
  maxRate?: number
  /** 受控模式下控制方法发出的目标倍速请求 */
  onPlaybackRateChange?: (rate: number) => void
  /**
   * 初始资源加载状态，不代表可播放，也不包括播放中缓冲
   * loadstart 开始；metadata、data、错误、取消或清空时结束
   */
  onLoadingChange?: (loading: boolean) => void
}

/** 播放器状态快照；读取快照不会触发重渲染 */
export interface AudioState {
  playing: boolean
  currentTime: number
  duration: number
  playbackRate: number
  muted: boolean
  volume: number
  loop: boolean
  loading: boolean
}

/** 音频组件引用类型 */
export interface AudioRef {
  /** 原生元素；卸载后为 null */
  readonly element: HTMLAudioElement | null
  /** 播放失败时返回 rejected Promise */
  play: (options?: AudioPlayOptions) => Promise<void>
  pause: () => void
  toggle: (options?: AudioPlayOptions) => Promise<void>
  stop: () => void
  seek: (time: number) => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  setLoop: (loop: boolean) => void
  reload: () => void
  getState: () => AudioState
}

/** 一次播放成功后的可选观察，不影响播放结果 */
export interface AudioPlayOptions {
  onStarted?: () => void
}

/** 命令式控制接口 */
export type AudioControls = AudioRef
