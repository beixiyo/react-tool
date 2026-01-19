'use client'

import type { Action } from '.'
import { AudioLines, BarChart2, Globe, PlaneTakeoff, Video } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { SearchBar } from '.'
import { ThemeToggle } from '../ThemeToggle'

const allActions = [
  {
    id: '1',
    label: 'Book tickets',
    icon: <PlaneTakeoff className="h-4 w-4 text-blue-500" />,
    description: 'Operator',
    short: '⌘K',
    end: 'Agent',
  },
  {
    id: '2',
    label: 'Summarize',
    icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
    description: 'gpt-4o',
    short: '⌘cmd+p',
    end: 'Command',
  },
  {
    id: '3',
    label: 'Screen Studio',
    icon: <Video className="h-4 w-4 text-purple-500" />,
    description: 'gpt-4o',
    short: '',
    end: 'Application',
  },
  {
    id: '4',
    label: 'Talk to Jarvis',
    icon: <AudioLines className="h-4 w-4 text-green-500" />,
    description: 'gpt-4o voice',
    short: '',
    end: 'Active',
  },
  {
    id: '5',
    label: 'Translate',
    icon: <Globe className="h-4 w-4 text-blue-500" />,
    description: 'gpt-4o',
    short: '',
    end: 'Command',
  },
]

export default function Test() {
  const [query, setQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [submittedValue, setSubmittedValue] = useState<string | null>(null)

  useEffect(
    () => {
      selectedAction && setQuery(selectedAction.label)
    },
    [selectedAction],
  )

  const handleSubmit = () => {
    if (query.trim()) {
      setSubmittedValue(query)
      // 2秒后清除提交状态，模拟操作完成
      setTimeout(() => {
        setSubmittedValue(null)
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="mb-6 flex justify-end">
        <ThemeToggle className="shadow-md" />
      </div>

      <div className="flex grow flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <h1 className="mb-2 text-center text-2xl text-gray-800 font-bold dark:text-gray-100">搜索工具</h1>
          <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">输入关键词或选择操作</p>

          <div className="w-full rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <SearchBar
              value={ query }
              selectedAction={ selectedAction }
              onSelect={ setSelectedAction as any }
              onChange={ setQuery }
              onSubmit={ handleSubmit }
              actions={ allActions }
              placeholder="搜索或选择操作..."
            />

            {selectedAction && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                {selectedAction.icon}
                <span className="text-sm font-medium">{selectedAction.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{selectedAction.description}</span>
              </div>
            )}

            <AnimatePresence>
              {submittedValue && (
                <motion.div
                  initial={ { opacity: 0, y: 10 } }
                  animate={ { opacity: 1, y: 0 } }
                  exit={ { opacity: 0 } }
                  className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                >
                  <span className="text-sm">
                    已提交:
                    {submittedValue}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            按 ⌘K 打开命令面板 | ESC 取消
          </div>
        </div>
      </div>
    </div>
  )
}
