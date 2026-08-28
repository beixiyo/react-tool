/** ChatInput 演示页使用的外部音量光效，只负责把 capture 音量映射到 BottomGlow。 */

'use client'

import { useLatestCallback } from 'hooks'
import { memo, useEffect, useState } from 'react'
import { BottomGlow } from '../BottomGlow'
import type { VoiceRecorderPanelRenderContext } from '../LiveWaveAudio'

const SAMPLE_INTERVAL_MS = 70

export const VoiceGlowPreview = memo<VoiceRecorderPanelRenderContext>((props) => {
  const { visible, status, waveform, getAudioLevel } = props
  const active = visible && status === 'recording'
  const [level, setLevel] = useState(0)
  const readLevel = useLatestCallback(() => getAudioLevel?.() ?? 0)

  useEffect(() => {
    if (!active || !getAudioLevel) {
      setLevel(0)
      return
    }

    const timer = window.setInterval(() => setLevel(readLevel()), SAMPLE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [active, getAudioLevel, readLevel])

  if (!visible) return null

  return (
    <>
      <div className="pointer-events-none absolute size-0 overflow-hidden opacity-0" aria-hidden="true">
        { waveform }
      </div>

      <BottomGlow
        level={ level }
        active={ active }
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 size-full rounded-3xl"
        baseColor="rgb(var(--background))"
      />
    </>
  )
})

VoiceGlowPreview.displayName = 'VoiceGlowPreview'
