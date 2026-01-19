import { ProgressBar as ProgressBarComp } from 'comps'
import { motion } from 'motion/react'
import React, { memo } from 'react'
import { cn } from 'utils'

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  label,
  visible = true,
  className,
}) => {
  if (!visible)
    return null

  return (
    <motion.div
      initial={ { opacity: 0 } }
      animate={ { opacity: 1 } }
      exit={ { opacity: 0 } }
      className={ cn('w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md relative', className) }
    >
      { label && <p className="mb-1.5 text-sm text-gray-700 dark:text-gray-300">
        { label }
        { ' ' }
        { (progress).toFixed(2) }
        %
      </p> }

      <ProgressBarComp className="h-2" value={ progress / 100 } />
    </motion.div>
  )
}

export default memo(ProgressBar)

export type ProgressBarProps = {
  /**
   * Current progress percentage (0-100).
   * @default 0
   */
  progress?: number
  /**
   * Label to display on the progress bar.
   */
  label?: string
  /**
   * Is the progress bar visible?
   * @default true
   */
  visible?: boolean
  /**
   * Additional CSS classes for the container.
   */
  className?: string
}
