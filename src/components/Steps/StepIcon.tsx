import type { StepsProps, StepStatus } from './types'
import { Check, Loader2, X } from 'lucide-react'
import { FONT_SIZE_MULTIPLE } from './constants'

export const StepIcon = memo<{
  status: StepStatus
  index: number
  icon?: React.ReactNode
  progressDot?: StepsProps['progressDot']
  size?: StepsProps['size']
}>((
  {
    status,
    index,
    icon,
    progressDot,
    size = 18,
  },
) => {
  // Handle progress dot rendering
  if (progressDot) {
    const dotNode = <span className="h-2 w-2 rounded-full bg-white" />
    if (typeof progressDot === 'function') {
      return progressDot(dotNode, { status, index })
    }
    return dotNode
  }

  if (icon)
    return <>{ icon }</>

  const fontSize = { fontSize: size * FONT_SIZE_MULTIPLE }

  if (status === 'finish') {
    return <Check size={ size } />
  }

  if (status === 'error') {
    return <X size={ size } />
  }

  if (status === 'process') {
    return <Loader2 className="animate-spin" size={ size } />
  }

  return <span style={ fontSize }>
    { index + 1 }
  </span>
})

StepIcon.displayName = 'StepIcon'
