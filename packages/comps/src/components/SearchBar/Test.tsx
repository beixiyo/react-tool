'use client'

import type { Action } from '.'
import { AudioLines, BarChart2, Globe, PlaneTakeoff, Video } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { SearchBar } from '.'
import { GithubSourceLink } from '../GithubSourceLink'
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

function Test() {
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
          <h1 className="mb-2 text-center text-2xl text-text font-bold">搜索工具</h1>
          <p className="mb-6 text-center text-sm text-text3">输入关键词或选择操作</p>

          <div className="w-full rounded-xl bg-background2 p-6 shadow-lg">
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
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-background3 p-3">
                {selectedAction.icon}
                <span className="text-sm font-medium">{selectedAction.label}</span>
                <span className="text-xs text-text3">{selectedAction.description}</span>
              </div>
            )}

            <AnimatePresence>
              {submittedValue && (
                <motion.div
                  initial={ { opacity: 0, y: 10 } }
                  animate={ { opacity: 1, y: 0 } }
                  exit={ { opacity: 0 } }
                  className="mt-4 flex items-center gap-2 rounded-lg bg-systemBlue/10 p-3 text-systemBlue"
                >
                  <span className="text-sm">
                    已提交:
                    {submittedValue}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 text-center text-xs text-text3">
            按 ⌘K 打开命令面板 | ESC 取消
          </div>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default Test
