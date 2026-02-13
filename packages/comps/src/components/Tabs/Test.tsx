'use client'

import { Bell, MessageSquareWarning, Settings, User } from 'lucide-react'
import { memo, useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { Tabs } from './Tabs'

const Report = memo(() => {
  console.log('reload report')

  return <div className="p-4 dark:text-gray-200">
    <h2 className="mb-4 text-gray-600 dark:text-gray-300">统计数据</h2>
    <h3 className="mb-6 font-medium dark:text-gray-200">每周室内设计服务需求模式</h3>

    <div className="h-64 flex items-end justify-between gap-4">
      { ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
        <div key={ day } className="w-full flex flex-col items-center">
          <div className="relative w-full">
            <div
              className="w-full bg-blue-500 dark:bg-blue-600"
              style={ {
                height: `${30 + Math.random() * 40}px`,
              } }
            ></div>
            <div
              className="w-full bg-violet-200 dark:bg-violet-300"
              style={ {
                height: `${40 + Math.random() * 60}px`,
              } }
            ></div>
            <div
              className="w-full bg-violet-400 dark:bg-violet-500"
              style={ {
                height: `${50 + Math.random() * 70}px`,
              } }
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{ day }</div>
        </div>
      )) }
    </div>

    <div className="mt-4 flex justify-center gap-8">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-violet-400 dark:bg-violet-500"></span>
        <span className="text-sm dark:text-gray-300">直接</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-violet-200 dark:bg-violet-300"></span>
        <span className="text-sm dark:text-gray-300">间接</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-600"></span>
        <span className="text-sm dark:text-gray-300">广告</span>
      </div>
    </div>
  </div>
})

const Analysis = memo(() => {
  console.log('reload analysis')
  return <div className="p-4 dark:text-gray-200">
    <h2 className="mb-4 text-gray-600 dark:text-gray-300">分析数据</h2>
  </div>
})

const tabItems = [
  {
    value: 'report',
    label: '报告',
    icon: <MessageSquareWarning size={ 16 } strokeWidth={ 1.5 } />,
    children: <Report />,
  },
  {
    value: 'analysis',
    label: '分析',
    children: <Analysis />,
  },
  {
    value: 'notice',
    label: '通知',
    icon: <Bell size={ 16 } strokeWidth={ 1.5 } />,
    children: <div className="p-4">通知内容</div>,
  },
  {
    value: 'settings',
    label: '设置',
    icon: <Settings size={ 16 } strokeWidth={ 1.5 } />,
    children: <div className="p-4">设置内容</div>,
  },
  {
    value: 'user',
    label: '用户',
    icon: <User size={ 16 } strokeWidth={ 1.5 } />,
    children: <div className="p-4">用户管理</div>,
  },
]

export default function TabsTest() {
  const [activeValue, setActiveValue] = useState('report')

  return (
    <div className="w-full overflow-auto bg-background2 p-8">
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-backgroundPrimary p-6">
        <div className="mb-6 flex justify-between">
          <div className="text-lg font-medium text-text">Tabs 组件展示</div>
          <ThemeToggle />
        </div>

        <div className="mb-6 rounded-lg border border-border bg-background2 p-4">
          <h3 className="mb-2 text-base font-medium text-text">Tabs 组件特点</h3>
          <ul className="ml-4 list-disc text-sm space-y-1 text-text2">
            <li>
              <span className="font-medium text-text">KeepAlive 支持</span>
              { ' ' }
              - 切换标签时保持组件状态，不会重新渲染
            </li>
            <li>
              <span className="font-medium text-text">动画过渡</span>
              { ' ' }
              - 通过滑动切换实现平滑过渡
            </li>
            <li>
              <span className="font-medium text-text">可组合</span>
              { ' ' }
              - Content 可单独使用，也可通过 Tabs 调用
            </li>
          </ul>
        </div>

        <Tabs
          items={ tabItems }
          activeKey={ activeValue }
          onChange={ item => setActiveValue(item.value) }
          className="h-96"
          itemClass="h-96"
        />
      </div>
    </div>
  )
}
