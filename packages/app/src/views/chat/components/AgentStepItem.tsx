import type { AgentStep } from '../types'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, CircleAlert, Clock } from 'lucide-react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { Checkmark } from '@/components/Checkbox'
import { LoadingIcon } from '@/components/Loading/LoadingIcon'

export const AgentStepItem = memo<{ step: AgentStep, level?: number }>(({
  step,
  level = 0,
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  }
  const [expanded, setExpanded] = useState(step.expanded ?? false)

  const getStatusIcon = (status: AgentStep['status']) => {
    switch (status) {
      case 'completed':
        return <Checkmark size={ 18 } strokeWidth={ 3 } color="var(--color-success)" />
      case 'running':
        return <LoadingIcon size={ 18 } />
      case 'pending':
        return <Clock className="h-4 w-4 text-slate-400" />
      case 'error':
        return <CircleAlert className="h-4 w-4 text-danger" />
    }
  }

  const getStatusColor = (status: AgentStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-l-3 border-slate-200/50 bg-slate-50/50 text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-300 border-l-emerald-400 dark:border-l-emerald-400'
      case 'running':
        return 'border-l-3 border-slate-200/50 bg-slate-50/50 text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-300 border-l-blue-400 dark:border-l-blue-400'
      case 'pending':
        return 'border-l-3 border-slate-200/50 bg-slate-50/30 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/20 dark:text-slate-400 border-l-slate-500 dark:border-l-slate-500'
      case 'error':
        return 'border-l-3 border-slate-200/50 bg-slate-50/50 text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-300 border-l-red-400 dark:border-l-red-400'
    }
  }

  const getTypeIcon = (type: AgentStep['type']) => {
    switch (type) {
      case 'thinking':
        return '🤔'
      case 'planning':
        return '📝'
      case 'executing':
        return '⚙️'
      case 'result':
        return '🎯'
    }
  }

  return (
    <motion.div
      variants={ itemVariants }
      className={ cn(
        'mb-2 rounded-lg border overflow-hidden',
        getStatusColor(step.status),
      ) }
    >
      {/* 步骤头部 */ }
      <div
        className={ cn(
          'flex items-center p-2 cursor-pointer',
          step.children && 'border-b border-slate-200 dark:border-slate-700',
        ) }
        onClick={ () => setExpanded(!expanded) }
        style={ { paddingLeft: `${(level * 8) + 8}px` } }
      >
        { step.children && (
          expanded
            ? (
                <ChevronDown className="mr-1 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
              )
            : (
                <ChevronRight className="mr-1 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
              )
        ) }

        <div className="mr-2 shrink-0">{ getTypeIcon(step.type) }</div>
        <div className="flex-1 text-sm font-medium">{ step.title }</div>
        <div className="shrink-0">{ getStatusIcon(step.status) }</div>
      </div>

      {/* 步骤内容 */ }
      <AnimatePresence>
        { expanded && (
          <motion.div
            initial={ { height: 0, opacity: 0 } }
            animate={ { height: 'auto', opacity: 1 } }
            exit={ { height: 0, opacity: 0 } }
            transition={ { duration: 0.3, ease: 'easeInOut' } }
            className="overflow-hidden"
          >
            <div className="whitespace-pre-wrap p-2 text-sm text-slate-700 dark:text-slate-300">{ step.content }</div>
          </motion.div>
        ) }
      </AnimatePresence>

      {/* 子步骤 */ }
      { expanded && step.children && (
        <div className="px-2 pb-2">
          { step.children.map(childStep => (
            <AgentStepItem
              key={ childStep.id }
              step={ childStep }
              level={ level + 1 }
            />
          )) }
        </div>
      ) }
    </motion.div>
  )
})

AgentStepItem.displayName = 'AgentStepItem'
