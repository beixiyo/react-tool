import { clamp } from '@jl-org/tool'
import { useGetState, useLatestCallback } from 'hooks'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { cn } from 'utils'
import type { AudioProps, AudioRef, AudioState } from './types'

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
  /** 标记是否已触发过自动播放，避免播放被浏览器拦截后反复重试 */
  const hasAutoPlayedRef = useRef(false)

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
  const play = useLatestCallback(async () => {
    if (!audioRef.current) return

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
  })

  /** 暂停方法 */
  const pause = useLatestCallback(() => {
    if (!audioRef.current) return

    audioRef.current.pause()
    setState({ playing: false })
    onPause?.()
  })

  /** 切换播放/暂停 */
  const toggle = useCallback(async () => {
    if (state.playing) {
      pause()
    }
    else {
      await play()
    }
  }, [state.playing])

  /** 停止播放并重置 */
  const stop = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setState({ playing: false, currentTime: 0 })
  }, [setState])

  /** 跳转到指定时间 */
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return

    audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration))
    setState({ currentTime: audioRef.current.currentTime })
  }, [state.duration, setState])

  /**
   * 设置播放倍速
   * 用 useLatestCallback 持有最新的 minRate/maxRate/onRateChange，
   * 避免父组件动态修改限值后闭包读到旧值
   */
  const setPlaybackRate = useLatestCallback((rate: number) => {
    if (!audioRef.current) return

    const validRate = clamp(rate, minRate, maxRate)
    audioRef.current.playbackRate = validRate
    setState({ playbackRate: validRate })
    onRateChange?.(validRate)
  })

  /** 设置音量 */
  const setVolume = useLatestCallback((volume: number) => {
    if (!audioRef.current) return

    const validVolume = Math.max(0, Math.min(volume, 1))
    audioRef.current.volume = validVolume
    setState({ volume: validVolume })
    onVolumeChange?.(validVolume)
  })

  /** 切换静音状态 */
  const toggleMute = useLatestCallback(() => {
    if (!audioRef.current) return

    const newMuted = !state.muted
    audioRef.current.muted = newMuted
    setState({ muted: newMuted })
    onMuteChange?.(newMuted)
  })

  /** 设置静音状态 */
  const setMuted = useLatestCallback((muted: boolean) => {
    if (!audioRef.current) return

    audioRef.current.muted = muted
    setState({ muted })
    onMuteChange?.(muted)
  })

  /** 设置循环播放 */
  const setLoop = useCallback((loop: boolean) => {
    if (!audioRef.current) return

    audioRef.current.loop = loop
    setState({ loop })
  }, [setState])

  /** 重新加载音频 */
  const reload = useCallback(() => {
    if (!audioRef.current) return

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
    toggle,
    stop,
    seek,
    setLoop,
    reload,
    getState,
  ])

  /** 处理时间更新事件 */
  const handleTimeUpdate = useLatestCallback(() => {
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
  })

  /** 处理元数据加载完成 */
  const handleLoadedMetadata = useLatestCallback(() => {
    /** 先执行用户的事件回调 */
    const duration = audioRef.current?.duration || 0
    onLoadedMetadata?.(duration)

    /** 然后执行内部逻辑 */
    if (audioRef.current) {
      setState({ duration, loaded: true, loading: false })
    }
  })

  /** 处理数据加载完成 */
  const handleLoadedData = useLatestCallback(() => {
    /** 先执行用户的事件回调 */
    onLoadedData?.()

    /** 然后执行内部逻辑 */
    setState({ loaded: true, loading: false })
  })

  /** 处理开始加载 */
  const handleLoadStart = useLatestCallback(() => {
    /** 先执行用户的事件回调 */
    onLoadStart?.()

    /** 然后执行内部逻辑 */
    setState({ loading: true, error: null })
  })

  /** 处理播放结束 */
  const handleEnded = useLatestCallback(() => {
    /** 先执行用户的事件回调 */
    onEnded?.()

    /** 然后执行内部逻辑 */
    setState({ playing: false, currentTime: 0 })
  })

  /** 处理错误 */
  const handleError = useLatestCallback(() => {
    /** 先执行用户的事件回调 */
    const errorMessage = '音频加载失败'
    onError?.(errorMessage)

    /** 然后执行内部逻辑 */
    setState({ error: errorMessage, loading: false, playing: false })
  })

  /** 处理音量变化和静音状态变化 */
  const handleVolumeChange = useLatestCallback(() => {
    /** 先执行用户的事件回调 */
    const volume = audioRef.current?.volume || 1
    const muted = audioRef.current?.muted || false
    onVolumeChange?.(volume)
    onMuteChange?.(muted)

    /** 然后执行内部逻辑 */
    if (audioRef.current) {
      setState({ volume, muted })
    }
  })

  /** 当 src 变化时重新加载 */
  useEffect(() => {
    if (audioRef.current && src) {
      audioRef.current.src = src
      /** 新音源允许重新触发一次自动播放 */
      hasAutoPlayedRef.current = false
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

  /**
   * 自动播放
   * 仅在首次加载完成时触发一次；若被浏览器拦截（play 失败 playing 仍为 false），
   * 不再因 play 引用变化而反复重试
   */
  useEffect(() => {
    if (autoPlay && state.loaded && !state.playing && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true
      play()
    }
  }, [autoPlay, state.loaded, state.playing])

  /**
   * 清理函数：卸载时停止播放并释放媒体资源
   * 须在 effect 体内捕获元素——卸载 commit 阶段 ref 先被置 null，cleanup 里读 ref 恒为空；
   * 播放中的媒体元素受规范保护不可 GC，不 pause + 清 src 会导致脱离 DOM 后继续出声且驻留内存
   */
  useEffect(() => {
    const el = audioRef.current
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      el?.pause()
      el?.removeAttribute('src')
      el?.load()
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
