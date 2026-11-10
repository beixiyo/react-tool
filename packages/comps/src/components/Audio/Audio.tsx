import { useGetState, useLatestCallback } from 'hooks'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react'
import type { ReactEventHandler } from 'react'
import { cn } from 'utils'
import { useAudioPlaybackRate } from './hooks/useAudioPlaybackRate'
import type { AudioPlayOptions, AudioProps, AudioRef, AudioState } from './types'

const InnerAudio = forwardRef<AudioRef, AudioProps>((props, ref) => {
  const {
    src,
    preload = 'metadata',
    className,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    onLoadedData,
    onLoadStart,
    onAbort,
    onEmptied,
    onError,
    onVolumeChange,
    onRateChange,
    onLoadingChange,
    minRate,
    maxRate,
    playbackRate,
    defaultPlaybackRate,
    preservePlaybackRateOnSourceChange,
    onPlaybackRateChange,
    ...restProps
  } = props

  const audioRef = useRef<HTMLAudioElement>(null)
  const [, setState] = useGetState<AudioState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    muted: false,
    volume: 1,
    loop: false,
    loading: false,
  })

  const updateLoading = useLatestCallback((loading: boolean) => {
    if (setState.getLatest().loading === loading) return
    setState({ loading })
    onLoadingChange?.(loading)
  })

  const { setPlaybackRate, handleRateChange, prepareForLoad, applyTargetRate } = useAudioPlaybackRate({
    audioRef,
    playbackRate,
    defaultPlaybackRate,
    preservePlaybackRateOnSourceChange,
    minRate,
    maxRate,
    onPlaybackRateChange,
    onActualRateChange: (rate) => setState({ playbackRate: rate }),
  })

  const play = useLatestCallback(async (options?: AudioPlayOptions) => {
    const audio = audioRef.current
    if (!audio) throw new Error('Audio element is unavailable')
    await audio.play()
    try {
      options?.onStarted?.()
    }
    catch { /* 可选观察不影响播放结果 */ }
  })

  const pause = useLatestCallback(() => audioRef.current?.pause())
  const toggle = useLatestCallback(async (options?: AudioPlayOptions) => {
    if (!audioRef.current) throw new Error('Audio element is unavailable')
    if (audioRef.current.paused) await play(options)
    else pause()
  })

  const stop = useLatestCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setState({ currentTime: 0 })
  })

  const seek = useLatestCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    const duration = Number.isFinite(audio.duration)
      ? audio.duration
      : Infinity
    audio.currentTime = Math.max(0, Math.min(time, duration))
    setState({ currentTime: audio.currentTime })
  })
  const setVolume = useLatestCallback((volume: number) => {
    if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(volume, 1))
  })

  const setMuted = useLatestCallback((muted: boolean) => {
    if (audioRef.current) audioRef.current.muted = muted
  })
  const toggleMute = useLatestCallback(() => {
    if (audioRef.current) audioRef.current.muted = !audioRef.current.muted
  })

  const setLoop = useLatestCallback((loop: boolean) => {
    if (!audioRef.current) return
    audioRef.current.loop = loop
    setState({ loop })
  })

  const reload = useLatestCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    prepareForLoad()
    setState({ playing: false, currentTime: 0, duration: 0 })
    updateLoading(false)
    audio.load()
  })

  useImperativeHandle(ref, () => ({
    get element() {
      return audioRef.current
    },
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
    getState: () => setState.getLatest(),
  }), [play, pause, toggle, stop, seek, setPlaybackRate, setVolume, toggleMute, setMuted, setLoop, reload, setState])

  const handlePlay: ReactEventHandler<HTMLAudioElement> = (event) => {
    setState({ playing: true })
    onPlay?.(event)
  }
  const handlePause: ReactEventHandler<HTMLAudioElement> = (event) => {
    setState({ playing: false })
    onPause?.(event)
  }
  const handleEnded: ReactEventHandler<HTMLAudioElement> = (event) => {
    setState({ playing: false, currentTime: event.currentTarget.currentTime })
    onEnded?.(event)
  }

  const handleTimeUpdate: ReactEventHandler<HTMLAudioElement> = (event) => {
    setState({ currentTime: event.currentTarget.currentTime })
    onTimeUpdate?.(event)
  }

  const handleLoadedMetadata: ReactEventHandler<HTMLAudioElement> = (event) => {
    applyTargetRate()
    setState({ duration: event.currentTarget.duration })
    updateLoading(false)
    onLoadedMetadata?.(event)
  }
  const handleLoadedData: ReactEventHandler<HTMLAudioElement> = (event) => {
    updateLoading(false)
    onLoadedData?.(event)
  }
  const handleLoadStart: ReactEventHandler<HTMLAudioElement> = (event) => {
    updateLoading(true)
    onLoadStart?.(event)
  }

  const handleAbort: ReactEventHandler<HTMLAudioElement> = (event) => {
    updateLoading(false)
    onAbort?.(event)
  }

  const handleEmptied: ReactEventHandler<HTMLAudioElement> = (event) => {
    updateLoading(false)
    setState({ playing: false, currentTime: 0, duration: 0 })
    onEmptied?.(event)
  }

  const handleError: ReactEventHandler<HTMLAudioElement> = (event) => {
    updateLoading(false)
    setState({ playing: false })
    onError?.(event)
  }
  const handleVolumeChange: ReactEventHandler<HTMLAudioElement> = (event) => {
    setState({ volume: event.currentTarget.volume, muted: event.currentTarget.muted })
    onVolumeChange?.(event)
  }
  const handleNativeRateChange: ReactEventHandler<HTMLAudioElement> = (event) => {
    handleRateChange()
    onRateChange?.(event)
  }

  useEffect(() => {
    prepareForLoad()
    const audio = audioRef.current
    // 缓存命中时元数据可能在节点接入 React 事件系统前已就绪
    const duration = audio && audio.readyState >= HTMLMediaElement.HAVE_METADATA
      ? audio.duration
      : 0
    setState({ playing: false, currentTime: 0, duration })
    updateLoading(false)
  }, [src, prepareForLoad, setState, updateLoading])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
      audio?.removeAttribute('src')
      audio?.load()
    }
  }, [])

  return (
    <audio
      { ...restProps }
      ref={ audioRef }
      src={ src }
      preload={ preload }
      className={ cn('AudioContainer', className) }
      onPlay={ handlePlay }
      onPause={ handlePause }
      onEnded={ handleEnded }
      onTimeUpdate={ handleTimeUpdate }
      onLoadedMetadata={ handleLoadedMetadata }
      onLoadedData={ handleLoadedData }
      onLoadStart={ handleLoadStart }
      onAbort={ handleAbort }
      onEmptied={ handleEmptied }
      onError={ handleError }
      onVolumeChange={ handleVolumeChange }
      onRateChange={ handleNativeRateChange }
    />
  )
})

InnerAudio.displayName = 'Audio'
export const Audio = memo(InnerAudio) as typeof InnerAudio
