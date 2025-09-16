'use client'

import { Bell, Download, MessageSquareWarning, PanelRight, Settings, User } from 'lucide-react'
import { memo, useState } from 'react'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { ThemeToggle } from '../ThemeToggle'
import { Tabs } from './index'

/**
 * Tabs组件测试页面
 *
 * Tabs组件特点：
 * 1. KeepAlive支持 - 切换标签时保持组件状态，不会重新渲染
 * 2. 动画过渡 - 使用framer-motion实现平滑的标签切换动画
 * 3. 自定义样式 - 支持自定义标签头部和内容区样式
 * 4. 内容滚动 - 当内容超出容器高度时自动显示滚动条
 * 5. 深色模式兼容 - 完全支持明/暗主题切换
 *
 * 用法：
 * ```jsx
 * <Tabs
 *   items={[
 *     { value: '标签1', children: <内容1 /> },
 *     { value: '标签2', children: <内容2 /> }
 *   ]}
 *   activeKey={当前激活标签}
 *   onChange={item => 切换标签处理函数}
 *   colors={['#颜色1', '#颜色2']} // 可选，标签底部指示器渐变色
 *   maxVisibleTabs={3} // 可选，最大可见标签数
 * />
 * ```
 */

const Report = memo(() => {
  console.log('reload report')

  return <div className="p-4 dark:text-gray-200">
    <h2 className="mb-4 text-gray-600 dark:text-gray-300">统计数据</h2>
    <h3 className="mb-6 font-medium dark:text-gray-200">每周室内设计服务需求模式</h3>

    <div className="h-64 flex items-end justify-between gap-4">
      { ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, i) => (
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
    value: '报告',
    label: '报告',
    icon: <MessageSquareWarning size={ 16 } strokeWidth={ 1.5 } />,
    children: <Report />,
  },
  {
    value: '分析',
    label: '分析',
    children: <Analysis />,
  },
  {
    value: '通知',
    label: '通知',
    icon: <Bell size={ 16 } strokeWidth={ 1.5 } />,
    children: <div className="p-4">通知内容</div>,
  },
  {
    value: '设置',
    label: '设置',
    icon: <Settings size={ 16 } strokeWidth={ 1.5 } />,
    children: <div className="p-4">设置内容</div>,
  },
  {
    value: '用户',
    label: '用户',
    icon: <User size={ 16 } strokeWidth={ 1.5 } />,
    children: <div className="p-4">用户管理</div>,
  },
]

export default function TabsTest() {
  const [activeKey, setActiveKey] = useState('报告')

  return (
    <div className="w-full overflow-auto p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl rounded-lg p-6 shadow-xs dark:bg-gray-800 dark:shadow-gray-700">
        <div className="mb-6 flex justify-between">
          <div className="text-lg font-medium dark:text-white">Tabs组件展示</div>
          <ThemeToggle />
        </div>

        <div className="mb-6 border border-gray-200 rounded-lg bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 text-base font-medium dark:text-white">Tabs 组件特点</h3>
          <ul className="ml-4 list-disc text-sm space-y-1 dark:text-gray-300">
            <li>
              <span className="font-medium">KeepAlive 支持</span>
              { ' ' }
              - 切换标签时保持组件状态，不会重新渲染
            </li>
            <li>
              <span className="font-medium">动画过渡</span>
              { ' ' }
              - 使用 framer-motion 实现平滑的标签切换动画
            </li>
            <li>
              <span className="font-medium">自定义样式</span>
              { ' ' }
              - 支持自定义标签头部和内容区样式
            </li>
            <li>
              <span className="font-medium">内容滚动</span>
              { ' ' }
              - 当内容超出容器高度时自动显示滚动条
            </li>
            <li>
              <span className="font-medium">深色模式兼容</span>
              { ' ' }
              - 完全支持明/暗主题切换
            </li>
          </ul>

          <div className="mt-3">
            <div className="text-sm font-medium dark:text-white">基本用法</div>
            <pre className="mt-2 block rounded-sm bg-gray-100 p-3 text-xs dark:bg-gray-800 dark:text-gray-300">
              { `<Tabs
  items={[
    { value: '标签1', children: <内容1 /> },
    { value: '标签2', children: <内容2 /> }
  ]}
  activeKey={当前激活标签}
  onChange={item => 切换标签处理函数}
  colors={['#颜色1', '#颜色2']} // 可选，标签底部指示器渐变色
  maxVisibleTabs={3} // 可选，最大可见标签数
/>`}
            </pre>
          </div>
        </div>

        <Tabs
          items={ tabItems }
          activeKey={ activeKey }
          onChange={ (item) => {
            console.log(item)
            setActiveKey(item.value)
          } }
          activeClassName="text-purple-600 font-medium dark:text-purple-400"
          inactiveClassName="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          headerClass="px-6"
          className="h-96"
          colors={ ['#ec4899', '#8b5cf6', '#3b82f6'] }
          maxVisibleTabs={ 2 }
          headerAfter={ <div className="h-full w-full flex items-center justify-end gap-2">
            <Icon icon={ Download }></Icon>
            <Button
              rightIcon={ <PanelRight size={ 16 } strokeWidth={ 1.5 } /> }
              size="sm"
              rounded="full"
            />
          </div> }
        />
      </div>
    </div>
  )
}
