'use client'

import type { StepData } from './types'
import { getRandomNum, uniqueId } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ThinkingStep } from '.'
import { reason } from './test.data'

export default function ThinkingStepDemoPage() {

  const [currentSteps, setCurrentSteps] = useState<StepData[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [thinkDone, setThinkDone] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    /** 重置所有状态 */
    setCurrentSteps([])
    setIsAnimating(true)
    setThinkDone(false)

    let reasonArrayIndex = 0 // Index for the `reason` array
    let currentCharIndexInReason = 0 // Index for characters within the current reason[reasonArrayIndex]

    intervalRef.current = setInterval(() => {
      if (reasonArrayIndex >= reason.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsAnimating(false)
        return
      }

      const { markdown, title } = reason[reasonArrayIndex]

      // If we are starting a new reason string from the `reason` array
      if (currentCharIndexInReason === 0) {
        setCurrentSteps(prevSteps => [
          ...prevSteps,
          {
            id: `reason-step-${uniqueId()}-${reasonArrayIndex}`,
            thinkDoneText: title,
            thinkingText: title,
            markdown: '',
          },
        ])
      }

      // Determine the chunk of text to add
      const chunkSize = getRandomNum(5, 30)
      const endOfChunk = Math.min(currentCharIndexInReason + chunkSize, markdown.length)
      const textChunk = markdown.substring(currentCharIndexInReason, endOfChunk)

      // Update the markdown of the *current* step (the last one in currentSteps)
      setCurrentSteps((prevSteps) => {
        const newSteps = [...prevSteps]
        if (newSteps.length > 0) {
          const lastStepIndex = newSteps.length - 1
          newSteps[lastStepIndex] = {
            ...newSteps[lastStepIndex],
            markdown: (newSteps[lastStepIndex].markdown || '') + textChunk,
          }
        }
        return newSteps
      })

      currentCharIndexInReason = endOfChunk

      // If the current reason string is fully processed, move to the next one
      if (currentCharIndexInReason >= markdown.length) {
        reasonArrayIndex++
        currentCharIndexInReason = 0 // Reset for the next reason string

        if (reasonArrayIndex >= reason.length) {
          setThinkDone(true)
        }
      }
    }, 8) // Interval for streaming chunks (e.g., 100ms)
  }, [reason])

  useEffect(() => {
    startAnimation()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startAnimation])

  return (
    <div className="h-screen flex items-center justify-center overflow-auto bg-gray-100 p-4 dark:bg-gray-900 md:p-8 sm:p-6">
      <ThinkingStep
        thinkDone={ thinkDone }
        currentSteps={ currentSteps }
        isAnimating={ isAnimating }
        onReplay={ startAnimation }
      />
    </div>
  )
}
