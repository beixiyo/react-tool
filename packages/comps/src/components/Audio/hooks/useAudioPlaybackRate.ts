import { clamp } from '@jl-org/tool'
import { useLatestCallback } from 'hooks'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { AudioProps } from '../types'

/** 将调用方的目标倍速与媒体元素的实际倍速分开管理，避免插件的临时写入污染换源策略 */
export function useAudioPlaybackRate(options: PlaybackRateOptions) {
  const {
    audioRef,
    playbackRate,
    defaultPlaybackRate = 1,
    preservePlaybackRateOnSourceChange = false,
    minRate = 0.25,
    maxRate = 4,
    onPlaybackRateChange,
    onActualRateChange,
  } = options

  const initialRateRef = useRef(defaultPlaybackRate)
  const targetRateRef = useRef(defaultPlaybackRate)
  const reportedRateRef = useRef(1)

  /** 只观察，不在原生事件中回写，避免和浏览器插件反复争抢控制权 */
  const handleRateChange = useLatestCallback(() => {
    const audio = audioRef.current
    if (!audio || audio.playbackRate === reportedRateRef.current) return

    reportedRateRef.current = audio.playbackRate
    onActualRateChange(audio.playbackRate)
  })

  const applyRate = useLatestCallback((rate: number) => {
    const audio = audioRef.current
    if (!audio) return

    const validRate = clamp(rate, minRate, maxRate)
    // 加载算法会恢复默认倍速；仅由明确的配置/控制动作更新默认值
    if (audio.defaultPlaybackRate !== validRate) audio.defaultPlaybackRate = validRate
    if (audio.playbackRate !== validRate) audio.playbackRate = validRate
    handleRateChange()
  })

  const applyTargetRate = useLatestCallback(() => {
    applyRate(playbackRate ?? targetRateRef.current)
  })

  const prepareForLoad = useLatestCallback(() => {
    if (playbackRate === undefined && !preservePlaybackRateOnSourceChange) {
      targetRateRef.current = initialRateRef.current
    }
    applyTargetRate()
  })

  const setPlaybackRate = useLatestCallback((rate: number) => {
    const validRate = clamp(rate, minRate, maxRate)
    if (playbackRate !== undefined) {
      onPlaybackRateChange?.(validRate)
      return
    }

    targetRateRef.current = validRate
    applyRate(validRate)
  })

  // 不依赖实际状态：外部临时修改只通知，在 prop/限制变化或加载时才重新应用目标值
  useEffect(() => {
    applyTargetRate()
  }, [playbackRate, minRate, maxRate, applyTargetRate])

  return { setPlaybackRate, handleRateChange, prepareForLoad, applyTargetRate }
}

type PlaybackRateOptions =
  & Pick<
    AudioProps,
    | 'playbackRate'
    | 'defaultPlaybackRate'
    | 'preservePlaybackRateOnSourceChange'
    | 'minRate'
    | 'maxRate'
    | 'onPlaybackRateChange'
  >
  & {
    audioRef: RefObject<HTMLAudioElement | null>
    onActualRateChange: (rate: number) => void
  }
