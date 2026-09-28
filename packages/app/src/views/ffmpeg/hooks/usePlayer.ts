import { useState } from 'react'

export function usePlayer() {
  /** 播放器播放源的URL (通常是Blob URL) */
  const [playerSrc, setPlayerSrc] = useState<string | null>(null)
  /** 控制播放器跳转到的时间点 (秒) */
  const [playerSeekTime, setPlayerSeekTime] = useState<number>(0)

  return {
    playerSrc,
    playerSeekTime,
    setPlayerSeekTime,
    setPlayerSrc,
  }
}
