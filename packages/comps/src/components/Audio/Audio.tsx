import { clamp } from '@jl-org/tool'
import { useGetState } from 'hooks'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { cn } from 'utils'

const InnerAudio = forwardRef<AudioRef, AudioProps>((props, ref) => {
  const {
    src,
    autoPlay = false,
    preload = 'metadata',
    className,
    style,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    onLoadedData,
    onLoadStart,
    onError,
    onVolumeChange,
    onRateChange,
    onMuteChange,
    minRate = 0.25,
    maxRate = 4,
    ...restProps
  } = props

  const audioRef = useRef<HTMLAudioElement>(null)
  const animationFrameRef = useRef<number>(null)

  /** 使用 useGetState 管理音频状态，避免闭包陷阱 */
  const [state, setState] = useGetState<AudioState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    muted: false,
    volume: 1.0,
    loop: false,
    loaded: false,
    loading: false,
    error: null,
  })

  /** 播放方法 */
  const play = useCallback(async () => {
    if (!audioRef.current)
      return

    try {
      await audioRef.current.play()
      setState({ playing: true, error: null })
      onPlay?.()
    }
    catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : '播放失败'
      setState({ playing: false, error: errorMessage })
      onError?.(errorMessage)
    }
  }, [setState, onPlay, onError])

  /** 暂停方法 */
  const pause = useCallback(() => {
    if (!audioRef.current)
      return

    audioRef.current.pause()
    setState({ playing: false })
    onPause?.()
  }, [setState, onPause])

  /** 切换播放/暂停 */
  const toggle = useCallback(async () => {
    if (state.playing) {
      pause()
    }
    else {
      await play()
    }
  }, [state.playing, play, pause])

  /** 停止播放并重置 */
  const stop = useCallback(() => {
    if (!audioRef.current)
      return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setState({ playing: false, currentTime: 0 })
  }, [setState])

  /** 跳转到指定时间 */
  const seek = useCallback((time: number) => {
    if (!audioRef.current)
      return

    audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration))
    setState({ currentTime: audioRef.current.currentTime })
  }, [state.duration, setState])

  /** 设置播放倍速 */
  const setPlaybackRate = useCallback((rate: number) => {
    if (!audioRef.current)
      return

    const validRate = clamp(rate, minRate, maxRate)
    audioRef.current.playbackRate = validRate
    setState({ playbackRate: validRate })
    onRateChange?.(validRate)
  }, [setState, onRateChange])

  /** 设置音量 */
  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current)
      return

    const validVolume = Math.max(0, Math.min(volume, 1))
    audioRef.current.volume = validVolume
    setState({ volume: validVolume })
    onVolumeChange?.(validVolume)
  }, [setState, onVolumeChange])

  /** 切换静音状态 */
  const toggleMute = useCallback(() => {
    if (!audioRef.current)
      return

    const newMuted = !state.muted
    audioRef.current.muted = newMuted
    setState({ muted: newMuted })
    onMuteChange?.(newMuted)
  }, [state.muted, setState, onMuteChange])

  /** 设置静音状态 */
  const setMuted = useCallback((muted: boolean) => {
    if (!audioRef.current)
      return

    audioRef.current.muted = muted
    setState({ muted })
    onMuteChange?.(muted)
  }, [setState, onMuteChange])

  /** 设置循环播放 */
  const setLoop = useCallback((loop: boolean) => {
    if (!audioRef.current)
      return

    audioRef.current.loop = loop
    setState({ loop })
  }, [setState])

  /** 重新加载音频 */
  const reload = useCallback(() => {
    if (!audioRef.current)
      return

    audioRef.current.load()
    setState({
      playing: false,
      currentTime: 0,
      duration: 0,
      loaded: false,
      loading: true,
      error: null,
    })
  }, [setState])

  /** 获取当前状态 */
  const getState = useCallback(() => {
    return setState.getLatest()
  }, [setState])

  /** 暴露控制方法给父组件 */
  useImperativeHandle(ref, () => ({
    play,
    pause,
    toggle,
    stop,
    seek,
    setPlaybackRate,
    setVolume,
    toggleMute,
    setMuted,
    setLoop,
    reload,
    getState,
  }), [
    play,
    pause,
    toggle,
    stop,
    seek,
    setPlaybackRate,
    setVolume,
    toggleMute,
    setMuted,
    setLoop,
    reload,
    getState,
  ])

  /** 处理时间更新事件 */
  const handleTimeUpdate = useCallback(() => {
    /** 先执行用户的事件回调 */
    onTimeUpdate?.(audioRef.current?.currentTime || 0)

    /** 然后执行内部逻辑 */
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime
        setState({ currentTime })
      }
    })
  }, [onTimeUpdate, setState])

  /** 处理元数据加载完成 */
  const handleLoadedMetadata = useCallback(() => {
    /** 先执行用户的事件回调 */
    const duration = audioRef.current?.duration || 0
    onLoadedMetadata?.(duration)

    /** 然后执行内部逻辑 */
    if (audioRef.current) {
      setState({ duration, loaded: true, loading: false })
    }
  }, [onLoadedMetadata, setState])

  /** 处理数据加载完成 */
  const handleLoadedData = useCallback(() => {
    /** 先执行用户的事件回调 */
    onLoadedData?.()

    /** 然后执行内部逻辑 */
    setState({ loaded: true, loading: false })
  }, [onLoadedData, setState])

  /** 处理开始加载 */
  const handleLoadStart = useCallback(() => {
    /** 先执行用户的事件回调 */
    onLoadStart?.()

    /** 然后执行内部逻辑 */
    setState({ loading: true, error: null })
  }, [onLoadStart, setState])

  /** 处理播放结束 */
  const handleEnded = useCallback(() => {
    /** 先执行用户的事件回调 */
    onEnded?.()

    /** 然后执行内部逻辑 */
    setState({ playing: false, currentTime: 0 })
  }, [onEnded, setState])

  /** 处理错误 */
  const handleError = useCallback(() => {
    /** 先执行用户的事件回调 */
    const errorMessage = '音频加载失败'
    onError?.(errorMessage)

    /** 然后执行内部逻辑 */
    setState({ error: errorMessage, loading: false, playing: false })
  }, [onError, setState])

  /** 处理音量变化和静音状态变化 */
  const handleVolumeChange = useCallback(() => {
    /** 先执行用户的事件回调 */
    const volume = audioRef.current?.volume || 1
    const muted = audioRef.current?.muted || false
    onVolumeChange?.(volume)
    onMuteChange?.(muted)

    /** 然后执行内部逻辑 */
    if (audioRef.current) {
      setState({ volume, muted })
    }
  }, [onVolumeChange, onMuteChange, setState])

  /** 当 src 变化时重新加载 */
  useEffect(() => {
    if (audioRef.current && src) {
      audioRef.current.src = src
      setState({
        playing: false,
        currentTime: 0,
        duration: 0,
        loaded: false,
        loading: true,
        error: null,
      })
    }
  }, [src, setState])

  /** 自动播放 */
  useEffect(() => {
    if (autoPlay && state.loaded && !state.playing) {
      play()
    }
  }, [autoPlay, state.loaded, state.playing, play])

  /** 清理函数 */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <audio
      ref={ audioRef }
      className={ cn('AudioContainer', className) }
      style={ style }
      preload={ preload }
      onTimeUpdate={ handleTimeUpdate }
      onLoadedMetadata={ handleLoadedMetadata }
      onLoadedData={ handleLoadedData }
      onLoadStart={ handleLoadStart }
      onEnded={ handleEnded }
      onError={ handleError }
      onVolumeChange={ handleVolumeChange }
      { ...restProps }
    />
  )
})

InnerAudio.displayName = 'Audio'

export const Audio = memo(InnerAudio) as typeof InnerAudio

/**
 * 音频组件引用类型
 */
export type AudioRef = AudioControls

/**
 * 音频组件属性类型
 */
export type AudioProps = {
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
} & AudioEventCallbacks
& Omit<React.AudioHTMLAttributes<HTMLAudioElement>, 'src' | 'autoPlay' | 'preload' | 'onPlay' | 'onPause' | 'onEnded' | 'onTimeUpdate' | 'onLoadedMetadata' | 'onLoadedData' | 'onLoadStart' | 'onError' | 'onVolumeChange' | 'onRateChange' | 'onMuteChange' | 'className' | 'style'>

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
