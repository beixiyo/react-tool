'use client'

import type React from 'react'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { TourHighlight } from './TourHighlight'
import { TourStep } from './TourStep'

export const TourGuide = memo(
  ({
    steps,
    initialStep = 0,
    onStepChange,
    onComplete,
    onSkip,
    isOpen = false,
    closeOnEsc = true,
    closeOnOutsideClick = true,
    showStepIndicators = true,
    showSkip = true,
    showClose = true,
    accentColor = 'rgb(var(--systemBlue) / 1)',
    backdropColor = 'rgb(var(--shadow) / 0.5)',
    className,
    zIndex = 50,
    animationDuration = 300,
    padding = 10,
    borderRadius,
    borderWidth,
  }: TourGuideProps) => {
    const [currentStep, setCurrentStep] = useState(initialStep)
    const [isVisible, setIsVisible] = useState(isOpen)
    const [targetElement, setTargetElement] = useState<Element | null>(null)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const tourRef = useRef<HTMLDivElement>(null)

    // Handle opening and closing the tour
    useEffect(() => {
      setIsVisible(isOpen)
      if (isOpen) {
        setCurrentStep(initialStep)
      }
    }, [isOpen, initialStep])

    // Find target element and calculate its position
    useEffect(() => {
      if (!isVisible || !steps[currentStep]) {
        /** 如果不可见或步骤无效，确保清除 target 和 rect */
        setTargetElement(null)
        updateTargetRect(null)
        return
      }

      const selector = steps[currentStep].selector
      if (!selector) {
        setTargetElement(null)
        setTargetRect(null)
        return
      }

      const element = document.querySelector(selector)
      if (element) {
        setTargetElement(element)

        // Scroll element into view if needed
        if (steps[currentStep].scrollIntoView !== false) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }

        setTimeout(() => {
          updateTargetRect(element)
        }, 100)
      }
      else {
        console.warn(`Element with selector "${selector}" not found.`)
        setTargetElement(null)
        setTargetRect(null)
      }
    }, [currentStep, steps, isVisible])

    // Update target rect on window resize
    useEffect(() => {
      const handleResize = () => {
        if (targetElement) {
          updateTargetRect(targetElement)
        }
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [targetElement])

    // Handle keyboard events
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isVisible)
          return

        if (e.key === 'Escape' && closeOnEsc) {
          handleSkip()
        }
        else if (e.key === 'ArrowRight') {
          handleNext()
        }
        else if (e.key === 'ArrowLeft') {
          handlePrev()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isVisible, currentStep, closeOnEsc])

    // Handle outside clicks
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          !isVisible
          || !closeOnOutsideClick
          || !tourRef.current
          || tourRef.current.contains(e.target as Node)
          || (targetElement && targetElement.contains(e.target as Node))
        ) {
          return
        }
        handleSkip()
      }

      if (closeOnOutsideClick) {
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
      }
    }, [isVisible, closeOnOutsideClick, targetElement])

    const updateTargetRect = (element: Element | null) => {
      if (!element) {
        setTargetRect(null)
        return
      }

      const rect = element.getBoundingClientRect()
      setTargetRect({
        ...rect,
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom + window.scrollY,
        right: rect.right + window.scrollX,
      })
    }

    const handleNext = () => {
      if (currentStep < steps.length - 1) {
        goToStep(currentStep + 1)
      }
      else {
        handleComplete()
      }
    }

    const handlePrev = () => {
      if (currentStep > 0) {
        goToStep(currentStep - 1)
      }
    }

    const goToStep = (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setCurrentStep(stepIndex)
        onStepChange?.(stepIndex, steps[stepIndex])
      }
    }

    const handleComplete = () => {
      setIsVisible(false)
      onComplete?.()
    }

    const handleSkip = () => {
      setIsVisible(false)
      onSkip?.()
    }

    if (!isVisible || steps.length === 0) {
      return null
    }

    const currentStepData = steps[currentStep]
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === steps.length - 1

    // Calculate tooltip position
    const getTooltipPosition = () => {
      if (!targetRect) {
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      }

      const position = currentStepData.position || 'bottom'
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      // Get tooltip dimensions from ref if available, otherwise use estimates
      const tooltipEl = tourRef.current
      const tooltipWidth = tooltipEl
        ? tooltipEl.offsetWidth
        : 300
      const tooltipHeight = tooltipEl
        ? tooltipEl.offsetHeight
        : 200

      let top
      let left
      let transform = ''

      // Calculate base position based on the specified position
      switch (position) {
        // Top positions
        case 'top':
          top = targetRect.top - tooltipHeight - padding + window.scrollY
          left = targetRect.left + targetRect.width / 2
          transform = 'translateX(-50%)'
          break
        case 'top-left':
          top = targetRect.top - tooltipHeight - padding + window.scrollY
          left = targetRect.left
          transform = ''
          break
        case 'top-right':
          top = targetRect.top - tooltipHeight - padding + window.scrollY
          left = targetRect.right - tooltipWidth
          transform = ''
          break

        // Right positions
        case 'right':
          top = targetRect.top + targetRect.height / 2 + window.scrollY
          left = targetRect.right + padding + window.scrollX
          transform = 'translateY(-50%)'
          break
        case 'right-top':
          top = targetRect.top + window.scrollY
          left = targetRect.right + padding + window.scrollX
          transform = ''
          break
        case 'right-bottom':
          top = targetRect.bottom - tooltipHeight + window.scrollY
          left = targetRect.right + padding + window.scrollX
          transform = ''
          break

        // Bottom positions
        case 'bottom':
          top = targetRect.bottom + padding + window.scrollY
          left = targetRect.left + targetRect.width / 2
          transform = 'translateX(-50%)'
          break
        case 'bottom-left':
          top = targetRect.bottom + padding + window.scrollY
          left = targetRect.left
          transform = ''
          break
        case 'bottom-right':
          top = targetRect.bottom + padding + window.scrollY
          left = targetRect.right - tooltipWidth
          transform = ''
          break

        // Left positions
        case 'left':
          top = targetRect.top + targetRect.height / 2 + window.scrollY
          left = targetRect.left - tooltipWidth - padding + window.scrollX
          transform = 'translateY(-50%)'
          break
        case 'left-top':
          top = targetRect.top + window.scrollY
          left = targetRect.left - tooltipWidth - padding + window.scrollX
          transform = ''
          break
        case 'left-bottom':
          top = targetRect.bottom - tooltipHeight + window.scrollY
          left = targetRect.left - tooltipWidth - padding + window.scrollX
          transform = ''
          break

        // Center
        case 'center':
          top = '50%'
          left = '50%'
          transform = 'translate(-50%, -50%)'
          break

        // Default to bottom
        default:
          top = targetRect.bottom + padding + window.scrollY
          left = targetRect.left + targetRect.width / 2
          transform = 'translateX(-50%)'
      }

      // Ensure tooltip stays within viewport
      if (position !== 'center') {
        // Convert percentage values to numbers for boundary checking
        const topValue = typeof top === 'string'
          ? Number.parseInt(top)
          : top
        const leftValue = typeof left === 'string'
          ? Number.parseInt(left)
          : left

        // Adjust horizontal position if needed
        if (leftValue < 20) {
          left = 20
          transform = transform.replace('translateX(-50%)', '')
        }
        else if (leftValue + tooltipWidth > windowWidth - 20) {
          left = windowWidth - tooltipWidth - 20
          transform = transform.replace('translateX(-50%)', '')
        }

        // Adjust vertical position if needed
        if (topValue < 20) {
          top = 20
          transform = transform.replace('translateY(-50%)', '')
        }
        else if (topValue + tooltipHeight > windowHeight - 20) {
          top = windowHeight - tooltipHeight - 20
          transform = transform.replace('translateY(-50%)', '')
        }
      }

      return {
        top: typeof top === 'number'
          ? `${top}px`
          : top,
        left: typeof left === 'number'
          ? `${left}px`
          : left,
        transform,
      }
    }

    const tooltipPosition = getTooltipPosition()

    return (
      <div
        className={ cn('fixed inset-0 z-(--tour-z-index)', className) }
        style={
          {
            '--tour-accent-color': accentColor,
            '--tour-backdrop-color': backdropColor,
            '--tour-z-index': zIndex,
            '--tour-animation-duration': `${animationDuration}ms`,
          } as React.CSSProperties
        }
      >
        {/* 遮罩/高亮逻辑 */ }
        { targetRect
          ? <TourHighlight
              rect={ targetRect }
              padding={ padding }
              animationDuration={ animationDuration }
              backdropColor={ backdropColor }
              borderColor={ accentColor }
              borderRadius={ borderRadius }
              borderWidth={ borderWidth }
            />

          : <div
              className="absolute inset-0 transition-opacity duration-(--tour-animation-duration)"
              style={ {
                backgroundColor: 'var(--tour-backdrop-color)',
                opacity: 0.9,
              } }
            /> }

        {/* Tooltip */ }
        <div
          ref={ tourRef }
          className={ cn(
            'absolute bg-background rounded-lg shadow-xl p-5 max-w-md w-full',
            'transition-all duration-(--tour-animation-duration) ease-in-out',
          ) }
          style={ {
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: tooltipPosition.transform,
          } }
        >
          <TourStep
            step={ currentStepData }
            stepIndex={ currentStep }
            totalSteps={ steps.length }
            onNext={ handleNext }
            onPrev={ handlePrev }
            onSkip={ handleSkip }
            onComplete={ handleComplete }
            goToStep={ goToStep }
            isFirstStep={ isFirstStep }
            isLastStep={ isLastStep }
            showStepIndicators={ showStepIndicators }
            showSkip={ showSkip }
            showClose={ showClose }
            accentColor={ accentColor }
          />
        </div>
      </div>
    )
  },
)

TourGuide.displayName = 'TourGuide'

export type TourGuideProps = {
  /**
   * Array of tour steps
   */
  steps: TourStepData[]

  /**
   * Initial step index to show
   * @default 0
   */
  initialStep?: number

  /**
   * Callback fired when step changes
   */
  onStepChange?: (stepIndex: number, step: TourStepData) => void

  /**
   * Callback fired when tour is completed
   */
  onComplete?: () => void

  /**
   * Callback fired when tour is skipped
   */
  onSkip?: () => void

  /**
   * Whether the tour is open
   * @default false
   */
  isOpen?: boolean

  /**
   * Whether to close the tour when Escape key is pressed
   * @default true
   */
  closeOnEsc?: boolean

  /**
   * Whether to close the tour when clicking outside
   * @default true
   */
  closeOnOutsideClick?: boolean

  /**
   * Whether to show step indicators
   * @default true
   */
  showStepIndicators?: boolean

  /**
   * Whether to show skip button
   * @default true
   */
  showSkip?: boolean

  /**
   * Whether to show close button
   * @default true
   */
  showClose?: boolean

  /**
   * Accent color for buttons and highlights
   * @default 'rgb(var(--systemBlue) / 1)'
   */
  accentColor?: string

  /**
   * Backdrop color
   * @default 'rgb(var(--shadow) / 0.5)'
   */
  backdropColor?: string

  /**
   * Additional CSS class name
   */
  className?: string

  /**
   * Z-index for the tour
   * @default 9999
   */
  zIndex?: number

  /**
   * Animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number

  /**
   * Padding around highlighted elements in pixels
   * @default 10
   */
  padding?: number

  /**
   * Border radius for the highlight cutout
   * @default 4
   */
  borderRadius?: number

  /**
   * Width of the optional border in pixels (applied via inset shadow)
   * @default 1.5
   */
  borderWidth?: number
}

export type TourStepData = {
  /**
   * Title of the step
   */
  title?: React.ReactNode

  /**
   * Content of the step
   */
  content: React.ReactNode

  /**
   * CSS selector for the target element to highlight
   */
  selector?: string

  /**
   * Position of the tooltip relative to the target
   * @default 'bottom'
   */
  position?:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'right'
    | 'right-top'
    | 'right-bottom'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right'
    | 'left'
    | 'left-top'
    | 'left-bottom'
    | 'center'

  /**
   * Whether to scroll the target element into view
   * @default true
   */
  scrollIntoView?: boolean

  /**
   * Custom next button text
   */
  nextButtonText?: React.ReactNode

  /**
   * Custom prev button text
   */
  prevButtonText?: React.ReactNode

  /**
   * Custom skip button text
   */
  skipButtonText?: React.ReactNode

  /**
   * Custom done button text
   */
  doneButtonText?: React.ReactNode

  /**
   * Whether to show the next button
   * @default true
   */
  showNextButton?: boolean

  /**
   * Whether to show the prev button
   * @default true
   */
  showPrevButton?: boolean

  /**
   * Whether to show the skip button for this step
   */
  showSkipButton?: boolean

  /**
   * Additional CSS class name for this step
   */
  className?: string

  /**
   * Additional styles for this step
   */
  style?: React.CSSProperties
}
