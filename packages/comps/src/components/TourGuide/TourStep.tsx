import type { TourStepData } from '.'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

const TourStep = memo(
  ({
    step,
    stepIndex,
    totalSteps,
    onNext,
    onPrev,
    onSkip,
    onComplete,
    goToStep,
    isFirstStep,
    isLastStep,
    showStepIndicators = true,
    showSkip = true,
    showClose = true,
    accentColor,
  }: TourStepProps) => {
    const {
      title,
      content,
      nextButtonText = 'Next',
      prevButtonText = 'Back',
      skipButtonText = 'Skip',
      doneButtonText = 'Done',
      showNextButton = true,
      showPrevButton = true,
      showSkipButton,
      className,
      style,
    } = step

    const shouldShowSkip = showSkipButton !== undefined
      ? showSkipButton
      : showSkip

    return (
      <div className={ cn('flex flex-col h-full', className) } style={ style }>
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-medium text-text">{title}</div>
          {showClose && (
            <button
              onClick={ onSkip }
              className="rounded-full p-1 text-text2 transition-colors hover:bg-background2 hover:text-text"
              aria-label="Close tour"
            >
              <X size={ 18 } />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mb-4 grow text-text">
          {typeof content === 'string'
            ? <p>{content}</p>
            : content}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showPrevButton && !isFirstStep && (
              <button
                onClick={ onPrev }
                className="flex items-center justify-center p-2 text-sm text-text2 transition-colors hover:text-text"
                aria-label="Previous step"
              >
                <ChevronLeft size={ 16 } className="mr-1" />
                {prevButtonText}
              </button>
            )}

            {shouldShowSkip && !isLastStep && (
              <button
                onClick={ onSkip }
                className="p-2 text-sm text-text2 transition-colors hover:text-text"
                aria-label="Skip tour"
              >
                {skipButtonText}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Step indicators */}
            {showStepIndicators && totalSteps > 1 && (
              <div className="mx-2 flex items-center gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <button
                    key={ i }
                    onClick={ () => goToStep(i) }
                    className={ cn(
                      'w-2 h-2 rounded-full transition-all duration-200',
                      i === stepIndex
                        ? 'bg-(--tour-accent-color)'
                        : 'bg-background3 hover:bg-background3',
                    ) }
                    style={ {
                      transform: i === stepIndex
                        ? 'scale(1.3)'
                        : 'scale(1)',
                    } }
                    aria-label={ `Go to step ${i + 1}` }
                  />
                ))}
              </div>
            )}

            {/* Next/Done button */}
            {showNextButton && (
              <button
                onClick={ isLastStep
                  ? onComplete
                  : onNext }
                className="flex items-center justify-center rounded-md px-4 py-2 text-white transition-colors"
                style={ { backgroundColor: accentColor } }
                aria-label={ isLastStep
                  ? 'Complete tour'
                  : 'Next step' }
              >
                {isLastStep
                  ? (
                      <>
                        {doneButtonText}
                        <Check size={ 16 } className="ml-1" />
                      </>
                    )
                  : (
                      <>
                        {nextButtonText}
                        <ChevronRight size={ 16 } className="ml-1" />
                      </>
                    )}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  },
)

TourStep.displayName = 'TourStep'

export { TourStep }

export type TourStepProps = {
  /**
   * Current step data
   */
  step: TourStepData

  /**
   * Current step index
   */
  stepIndex: number

  /**
   * Total number of steps
   */
  totalSteps: number

  /**
   * Function to go to next step
   */
  onNext: () => void

  /**
   * Function to go to previous step
   */
  onPrev: () => void

  /**
   * Function to skip the tour
   */
  onSkip: () => void

  /**
   * Function to complete the tour
   */
  onComplete: () => void

  /**
   * Function to go to a specific step
   */
  goToStep: (stepIndex: number) => void

  /**
   * Whether this is the first step
   */
  isFirstStep: boolean

  /**
   * Whether this is the last step
   */
  isLastStep: boolean

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
   * Accent color for buttons
   */
  accentColor?: string
}
