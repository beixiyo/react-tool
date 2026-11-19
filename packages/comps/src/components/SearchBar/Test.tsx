'use client'

import { AudioLines, BarChart2, Globe, PlaneTakeoff, Video } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import type { Action } from '.'
import { SearchBar } from '.'

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
  const [customQuery, setCustomQuery] = useState('')
  const [scopedQuery, setScopedQuery] = useState('')
  const [disabledQuery, setDisabledQuery] = useState('')
  const [scopeEl, setScopeEl] = useState<HTMLDivElement | null>(null)

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

            { selectedAction && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-background3 p-3">
                { selectedAction.icon }
                <span className="text-sm font-medium">{ selectedAction.label }</span>
                <span className="text-xs text-text3">{ selectedAction.description }</span>
              </div>
            ) }

            <AnimatePresence>
              { submittedValue && (
                <motion.div
                  initial={ { opacity: 0, y: 10 } }
                  animate={ { opacity: 1, y: 0 } }
                  exit={ { opacity: 0 } }
                  className="mt-4 flex items-center gap-2 rounded-lg bg-systemBlue/10 p-3 text-systemBlue"
                >
                  <span className="text-sm">
                    已提交:
                    { submittedValue }
                  </span>
                </motion.div>
              ) }
            </AnimatePresence>
          </div>

          <div className="mt-6 text-center text-xs text-text3">
            按 Mod+K 聚焦上方搜索框（同页多实例时只有先挂载的实例响应） | ESC 取消
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-xl bg-background2 p-6">
            <h2 className="text-sm text-text font-semibold">快捷键配置</h2>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text3">自定义快捷键：shortcut=Mod+Shift+J</span>
              <SearchBar
                value={ customQuery }
                onChange={ setCustomQuery }
                actions={ allActions }
                shortcut={ { key: 'j', mod: true, shift: true } }
                placeholder="Mod+Shift+J 聚焦"
              />
            </div>

            <div
              ref={ setScopeEl }
              tabIndex={ 0 }
              className="flex flex-col gap-2 rounded-lg border border-border p-3 outline-hidden focus-within:border-border3"
            >
              <span className="text-xs text-text3">限定作用域：先点击本区域使其获得焦点，再按 Mod+Shift+L</span>
              <SearchBar
                value={ scopedQuery }
                onChange={ setScopedQuery }
                actions={ allActions }
                shortcut={ { key: 'l', mod: true, shift: true } }
                shortcutTarget={ scopeEl }
                placeholder="仅本区域内 Mod+Shift+L 聚焦"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text3">关闭快捷键：shortcut=false，底部不再展示快捷键提示</span>
              <SearchBar
                value={ disabledQuery }
                onChange={ setDisabledQuery }
                actions={ allActions }
                shortcut={ false }
                placeholder="无快捷键"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Test
