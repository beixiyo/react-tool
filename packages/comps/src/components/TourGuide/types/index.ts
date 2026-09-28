/**
 * TourGuide 类型声明
 */

import type * as React from 'react'

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

  /**
   * 组件级统一的按钮文案。每个 step 仍可通过 nextButtonText 等单独覆盖
   * @default { next: 'Next', back: 'Back', skip: 'Skip', done: 'Done' }
   */
  labels?: TourLabels
}

export type TourLabels = {
  /**
   * 下一步按钮文案
   * @default 'Next'
   */
  next?: React.ReactNode
  /**
   * 上一步按钮文案
   * @default 'Back'
   */
  back?: React.ReactNode
  /**
   * 跳过按钮文案
   * @default 'Skip'
   */
  skip?: React.ReactNode
  /**
   * 完成按钮文案
   * @default 'Done'
   */
  done?: React.ReactNode
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
