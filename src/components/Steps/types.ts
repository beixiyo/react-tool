export type StepStatus = 'process' | 'wait' | 'finish' | 'error'

export interface StepProps {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  status: StepStatus
  disabled?: boolean
  className?: string
}

export interface StepsProps {
  showLinkLine?: boolean
  direction?: 'horizontal' | 'vertical'
  labelPlacement?: 'horizontal' | 'vertical'
  progressDot?:
    | boolean
    | ((iconDot: React.ReactNode, { status, index }: { status: StepStatus, index: number }) => React.ReactNode)
  size?: number
  items: StepProps[]
  className?: string
  slotClassName?: string
  showProgress?: boolean
  expandable?: boolean
  children?: React.ReactNode
  expandDirection?: 'up' | 'down'
}
