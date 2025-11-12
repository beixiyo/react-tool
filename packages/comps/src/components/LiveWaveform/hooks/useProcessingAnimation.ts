import type { HookProps } from './types'
import { useEffect } from 'react'

export function useProcessingAnimation({
  processing,
  active,
  barWidth,
  barGap,
  mode,
  refs,
}: HookProps) {
  const {
    containerRef,
    transitionProgressRef,
    lastActiveDataRef,
    staticBarsRef,
    historyRef,
    needsRedrawRef,
    processingAnimationRef,
  } = refs

  useEffect(() => {
    if (processing && !active) {
      let time = 0
      transitionProgressRef.current = 0

      const animateProcessing = () => {
        time += 0.03
        transitionProgressRef.current = Math.min(
          1,
          transitionProgressRef.current + 0.02,
        )

        const barCount = Math.floor(
          (containerRef.current?.getBoundingClientRect().width || 200)
          / (barWidth! + barGap!),
        )

        if (mode === 'static') {
          const processingData = []
          const halfCount = Math.floor(barCount / 2)

          for (let i = 0; i < barCount; i++) {
            const normalizedPosition = (i - halfCount) / halfCount
            const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4

            const wave1 = Math.sin(time * 1.5 + normalizedPosition * 3) * 0.25
            const wave2 = Math.sin(time * 0.8 - normalizedPosition * 2) * 0.2
            const wave3 = Math.cos(time * 2 + normalizedPosition) * 0.15
            const combinedWave = wave1 + wave2 + wave3
            const processingValue = (0.2 + combinedWave) * centerWeight

            let finalValue = processingValue
            if (
              lastActiveDataRef.current.length > 0
              && transitionProgressRef.current < 1
            ) {
              const lastDataIndex = Math.min(
                i,
                lastActiveDataRef.current.length - 1,
              )
              const lastValue = lastActiveDataRef.current[lastDataIndex] || 0
              finalValue
                = lastValue * (1 - transitionProgressRef.current)
                  + processingValue * transitionProgressRef.current
            }

            processingData.push(Math.max(0.05, Math.min(1, finalValue)))
          }
          staticBarsRef.current = processingData
        }
        else {
          const processingData = []
          for (let i = 0; i < barCount; i++) {
            const normalizedPosition = (i - barCount / 2) / (barCount / 2)
            const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4

            const wave1 = Math.sin(time * 1.5 + i * 0.15) * 0.25
            const wave2 = Math.sin(time * 0.8 - i * 0.1) * 0.2
            const wave3 = Math.cos(time * 2 + i * 0.05) * 0.15
            const combinedWave = wave1 + wave2 + wave3
            const processingValue = (0.2 + combinedWave) * centerWeight

            let finalValue = processingValue
            if (
              lastActiveDataRef.current.length > 0
              && transitionProgressRef.current < 1
            ) {
              const lastDataIndex = Math.floor(
                (i / barCount) * lastActiveDataRef.current.length,
              )
              const lastValue = lastActiveDataRef.current[lastDataIndex] || 0
              finalValue
                = lastValue * (1 - transitionProgressRef.current)
                  + processingValue * transitionProgressRef.current
            }

            processingData.push(Math.max(0.05, Math.min(1, finalValue)))
          }
          historyRef.current = processingData
        }

        needsRedrawRef.current = true
        processingAnimationRef.current
          = requestAnimationFrame(animateProcessing)
      }

      animateProcessing()

      return () => {
        if (processingAnimationRef.current) {
          cancelAnimationFrame(processingAnimationRef.current)
        }
      }
    }
    else if (!active && !processing) {
      const hasData
        = mode === 'static'
          ? staticBarsRef.current.length > 0
          : historyRef.current.length > 0

      if (hasData) {
        let fadeProgress = 0
        const fadeToIdle = () => {
          fadeProgress += 0.03
          if (fadeProgress < 1) {
            if (mode === 'static') {
              staticBarsRef.current = staticBarsRef.current.map(
                value => value * (1 - fadeProgress),
              )
            }
            else {
              historyRef.current = historyRef.current.map(
                value => value * (1 - fadeProgress),
              )
            }
            needsRedrawRef.current = true
            requestAnimationFrame(fadeToIdle)
          }
          else {
            if (mode === 'static') {
              staticBarsRef.current = []
            }
            else {
              historyRef.current = []
            }
          }
        }
        fadeToIdle()
      }
    }
  }, [processing, active, barWidth, barGap, mode, containerRef, transitionProgressRef, lastActiveDataRef, staticBarsRef, historyRef, needsRedrawRef, processingAnimationRef])
}
