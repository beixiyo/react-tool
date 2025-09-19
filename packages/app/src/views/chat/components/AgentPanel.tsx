import type { Agent } from '../types'
import type { DropdownSection } from '@/components/Dropdown'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Dropdown } from '@/components/Dropdown'
import { AgentStepItem } from './AgentStepItem'

export const AgentPanel = memo<AgentPanelProps>((
  {
    agent,
    className,
    style,
  },
) => {
  if (!agent)
    return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const sections: DropdownSection[] = [
    {
      name: agent.name,
      header: (isExpanded) => {
        return (
          <div
            className="flex cursor-pointer items-center border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mr-2 text-xl">{ agent.icon }</div>
            <div className="flex-1">
              <div className="text-slate-800 font-medium dark:text-slate-100">{ agent.name }</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{ agent.description }</div>
            </div>
            { isExpanded
              ? (
                  <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                )
              : (
                  <ChevronRight className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                ) }
          </div>
        )
      },
      items: (
        <motion.div
          className="overflow-hidden py-2"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={ containerVariants }
        >
          { agent.steps.map(step => (
            <AgentStepItem key={ step.id } step={ step } />
          )) }
        </motion.div>
      ),
    },
  ]

  return (
    <motion.div
      initial={ { opacity: 0, x: -50 } }
      animate={ { opacity: 1, x: 0 } }
      exit={ { opacity: 0, x: -50 } }
      transition={ { duration: 0.3, ease: 'easeInOut' } }
      className={ cn(
        'AgentPanel shrink-0 border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col',
        'dark:bg-slate-900 dark:border-slate-800',
        className,
      ) }
      style={ style }
    >
      <Dropdown
        items={ sections }
        accordion={ false }
        defaultExpanded={ [agent.name] }
        itemClassName="w-full"
      />
    </motion.div>
  )
})

AgentPanel.displayName = 'AgentPanel'

export type AgentPanelProps = {
  agent?: Agent
  className?: string
  style?: React.CSSProperties
}
