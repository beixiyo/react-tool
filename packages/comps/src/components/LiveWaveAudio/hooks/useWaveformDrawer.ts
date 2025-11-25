import type { HookProps } from './types'
import { useEffect } from 'react'

export function useWaveformDrawer({
  state,
  sensitivity,
  updateRate,
  historySize,
  barWidth,
  barGap,
  barRadius,
  barColor,
  fadeEdges,
  fadeWidth,
  mode,
  refs,
  theme,
}: HookProps) {
  const {
    canvasRef,
    lastUpdateRef,
    analyserRef,
    staticBarsRef,
    lastActiveDataRef,
    historyRef,
    needsRedrawRef,
    gradientCacheRef,
    lastWidthRef,
  } = refs

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    gradientCacheRef.current = null
    let rafId: number

    const animate = (currentTime: number) => {
      const rect = canvas.getBoundingClientRect()

      const isRecordingActive = (state === 'recording' && !!analyserRef.current)

      if (isRecordingActive && currentTime - lastUpdateRef.current > updateRate!) {
        lastUpdateRef.current = currentTime

        if (analyserRef.current) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount,
          )
          analyserRef.current.getByteFrequencyData(dataArray)

          if (mode === 'static') {
            const startFreq = Math.floor(dataArray.length * 0.05)
            const endFreq = Math.floor(dataArray.length * 0.4)
            const relevantData = dataArray.slice(startFreq, endFreq)

            const barCount = Math.floor(rect.width / (barWidth! + barGap!))
            const halfCount = Math.floor(barCount / 2)
            const newBars: number[] = []

            for (let i = halfCount - 1; i >= 0; i--) {
              const dataIndex = Math.floor(
                (i / halfCount) * relevantData.length,
              )
              const value = Math.min(
                1,
                (relevantData[dataIndex] / 255) * sensitivity!,
              )
              newBars.push(Math.max(0.05, value))
            }

            for (let i = 0; i < halfCount; i++) {
              const dataIndex = Math.floor(
                (i / halfCount) * relevantData.length,
              )
              const value = Math.min(
                1,
                (relevantData[dataIndex] / 255) * sensitivity!,
              )
              newBars.push(Math.max(0.05, value))
            }

            staticBarsRef.current = newBars
            lastActiveDataRef.current = newBars
          }
          else {
            let sum = 0
            const startFreq = Math.floor(dataArray.length * 0.05)
            const endFreq = Math.floor(dataArray.length * 0.4)
            const relevantData = dataArray.slice(startFreq, endFreq)

            for (let i = 0; i < relevantData.length; i++) {
              sum += relevantData[i]
            }
            const average = (sum / relevantData.length / 255) * sensitivity!

            historyRef.current.push(Math.min(1, Math.max(0.05, average)))
            lastActiveDataRef.current = [...historyRef.current]

            if (historyRef.current.length > historySize!) {
              historyRef.current.shift()
            }
          }
          needsRedrawRef.current = true
        }
      }

      if (!needsRedrawRef.current && !isRecordingActive) {
        rafId = requestAnimationFrame(animate)
        return
      }

      needsRedrawRef.current = !!isRecordingActive
      ctx.clearRect(0, 0, rect.width, rect.height)

      const computedBarColor
        = barColor
          || (() => {
            /** 优先根据主题设置颜色 */
            if (theme === 'dark') {
              return '#ffffff' // 深色模式使用白色
            }
            /** 浅色模式尝试从计算样式获取，否则使用黑色 */
            const style = getComputedStyle(canvas)
            const color = style.color
            return color || '#000000'
          })()

      const step = barWidth! + barGap!
      const barCount = Math.floor(rect.width / step)
      const centerY = rect.height / 2

      if (mode === 'static') {
        const dataToRender = staticBarsRef.current

        for (let i = 0; i < barCount && i < dataToRender.length; i++) {
          const value = dataToRender[i] || 0.1
          const x = i * step
          const barHeight = Math.max(4, value * rect.height * 0.8)
          const y = centerY - barHeight / 2

          ctx.fillStyle = computedBarColor
          ctx.globalAlpha = 0.4 + value * 0.6

          if (barRadius! > 0) {
            ctx.beginPath()
            ctx.roundRect(x, y, barWidth!, barHeight, barRadius!)
            ctx.fill()
          }
          else {
            ctx.fillRect(x, y, barWidth!, barHeight)
          }
        }
      }
      else {
        for (let i = 0; i < barCount && i < historyRef.current.length; i++) {
          const dataIndex = historyRef.current.length - 1 - i
          const value = historyRef.current[dataIndex] || 0.1
          const x = rect.width - (i + 1) * step
          const barHeight = Math.max(4, value * rect.height * 0.8)
          const y = centerY - barHeight / 2

          ctx.fillStyle = computedBarColor
          ctx.globalAlpha = 0.4 + value * 0.6

          if (barRadius! > 0) {
            ctx.beginPath()
            ctx.roundRect(x, y, barWidth!, barHeight, barRadius!)
            ctx.fill()
          }
          else {
            ctx.fillRect(x, y, barWidth!, barHeight)
          }
        }
      }

      if (fadeEdges && fadeWidth! > 0 && rect.width > 0) {
        if (!gradientCacheRef.current || lastWidthRef.current !== rect.width) {
          const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)
          const fadePercent = Math.min(0.3, fadeWidth! / rect.width)
          const fadeColorBase = theme === 'dark'
            ? 'rgba(0,0,0'
            : 'rgba(255,255,255'

          gradient.addColorStop(0, `${fadeColorBase},1)`)
          gradient.addColorStop(fadePercent, `${fadeColorBase},0)`)
          gradient.addColorStop(1 - fadePercent, `${fadeColorBase},0)`)
          gradient.addColorStop(1, `${fadeColorBase},1)`)

          gradientCacheRef.current = gradient
          lastWidthRef.current = rect.width
        }

        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = gradientCacheRef.current
        ctx.fillRect(0, 0, rect.width, rect.height)
        ctx.globalCompositeOperation = 'source-over'
      }

      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [
    state,
    sensitivity,
    updateRate,
    historySize,
    barWidth,
    barGap,
    barRadius,
    barColor,
    fadeEdges,
    fadeWidth,
    mode,
    canvasRef,
    lastUpdateRef,
    analyserRef,
    staticBarsRef,
    lastActiveDataRef,
    historyRef,
    needsRedrawRef,
    gradientCacheRef,
    lastWidthRef,
    theme,
  ])
}
