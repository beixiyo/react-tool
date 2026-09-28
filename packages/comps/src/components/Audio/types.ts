/**
 * Audio 组件类型声明
 */
import type * as React from 'react'
/** 音频组件引用类型 */
export type AudioRef = AudioControls

/**
 * 音频组件属性类型
 */
export type AudioProps =
  & {
    /** 音频源地址 */
    src?: string
    /** 是否自动播放 */
    autoPlay?: boolean
    /** 预加载策略 */
    preload?: 'none' | 'metadata' | 'auto'
    /** @default 0.25 */
    minRate?: number
    /** @default 4 */
    maxRate?: number

    /** 自定义类名 */
    className?: string
    /** 自定义样式 */
    style?: React.CSSProperties
  }
  & AudioEventCallbacks
  & Omit<
    React.AudioHTMLAttributes<HTMLAudioElement>,
    | 'src'
    | 'autoPlay'
    | 'preload'
    | 'onPlay'
    | 'onPause'
    | 'onEnded'
    | 'onTimeUpdate'
    | 'onLoadedMetadata'
    | 'onLoadedData'
    | 'onLoadStart'
    | 'onError'
    | 'onVolumeChange'
    | 'onRateChange'
    | 'onMuteChange'
    | 'className'
    | 'style'
  >

/**
 * 音频状态接口
 */
export interface AudioState {
  /** 是否正在播放 */
  playing: boolean
  /** 当前播放时间（秒） */
  currentTime: number
  /** 音频总时长（秒） */
  duration: number
  /** 播放倍速 */
  playbackRate: number
  /** 是否静音 */
  muted: boolean
  /** 音量（0-1） */
  volume: number
  /** 是否循环播放 */
  loop: boolean
  /** 音频是否已加载 */
  loaded: boolean
  /** 是否正在加载 */
  loading: boolean
  /** 播放错误信息 */
  error: string | null
}

/**
 * 音频事件回调接口
 */
export interface AudioEventCallbacks {
  /** 播放开始 */
  onPlay?: () => void
  /** 播放暂停 */
  onPause?: () => void
  /** 播放结束 */
  onEnded?: () => void
  /** 时间更新 */
  onTimeUpdate?: (currentTime: number) => void
  /** 时长加载完成 */
  onLoadedMetadata?: (duration: number) => void
  /** 音频加载完成 */
  onLoadedData?: () => void
  /** 开始加载 */
  onLoadStart?: () => void
  /** 播放错误 */
  onError?: (error: string) => void
  /** 音量变化 */
  onVolumeChange?: (volume: number) => void
  /** 倍速变化 */
  onRateChange?: (rate: number) => void
  /** 静音状态变化 */
  onMuteChange?: (muted: boolean) => void
}

/**
 * 音频控制方法接口
 */
export interface AudioControls {
  /** 播放 */
  play: () => Promise<void>
  /** 暂停 */
  pause: () => void
  /** 切换播放/暂停 */
  toggle: () => Promise<void>
  /** 停止播放并重置到开始位置 */
  stop: () => void
  /** 跳转到指定时间 */
  seek: (time: number) => void
  /** 设置播放倍速 */
  setPlaybackRate: (rate: number) => void
  /** 设置音量 */
  setVolume: (volume: number) => void
  /** 切换静音状态 */
  toggleMute: () => void
  /** 设置静音状态 */
  setMuted: (muted: boolean) => void
  /** 设置循环播放 */
  setLoop: (loop: boolean) => void
  /** 重新加载音频 */
  reload: () => void
  /** 获取当前状态 */
  getState: () => AudioState
}
