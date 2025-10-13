import type { FeedItem } from './types'
import { useState } from 'react'
import { InfiniteFeed } from './InfiniteFeed'

/** 示例: 基础使用 */
function BasicExample() {
  return <div className="space-y-4">
    <h2 className="text-2xl font-bold text-textPrimary">基础示例</h2>
    <InfiniteFeed />
  </div>
}

/** 示例: 自定义渲染 */
function CustomRenderExample() {
  return <div className="space-y-4">
    <h2 className="text-2xl font-bold text-textPrimary">自定义渲染示例</h2>
    <InfiniteFeed
      renderCard={ item => (
        <div
          className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-transform"
          style={ { boxShadow: '0 10px 30px rgba(0,0,0,0.3)' } }
        >
          <h3 className="text-xl font-bold mb-2">{ item.title }</h3>
          <p className="text-sm opacity-90">{ item.content }</p>
          <div className="mt-4 flex justify-between items-center text-xs">
            <span>{ item.author }</span>
            <span>{ item.timestamp }</span>
          </div>
        </div>
      ) }
      renderDetail={ item => (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-textPrimary">{ item.title }</h1>
          <p className="text-lg text-textSecondary">{ item.content }</p>
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={ { backgroundColor: item.color } }
              >
                { item.author[0] }
              </div>
              <span className="text-sm text-textPrimary">{ item.author }</span>
            </div>
            <span className="text-sm text-textSecondary">{ item.timestamp }</span>
          </div>
        </div>
      ) }
    />
  </div>
}

/** 自定义初始数据 */
const customItems: FeedItem[] = [
  {
    id: 1,
    title: '🎉 欢迎使用 InfiniteFeed',
    content: '这是一个高度可定制的无限滚动信息流组件，支持丰富的配置选项和自定义渲染。',
    timestamp: new Date().toLocaleTimeString('zh-CN'),
    author: '开发者',
    color: '#3b82f6',
  },
  {
    id: 2,
    title: '✨ 功能特性',
    content: '支持自动生成、受控组件、自定义渲染、动画配置、主题适配等多种特性。',
    timestamp: new Date().toLocaleTimeString('zh-CN'),
    author: '系统',
    color: '#8b5cf6',
  },
  {
    id: 3,
    title: '🚀 开始使用',
    content: '通过简单的配置即可快速上手，也可以深度定制以满足复杂需求。',
    timestamp: new Date().toLocaleTimeString('zh-CN'),
    author: '团队',
    color: '#ec4899',
  },
]

/** 示例: 自定义初始数据 */
function CustomDataExample() {
  return <div className="space-y-4">
    <h2 className="text-2xl font-bold text-textPrimary">自定义初始数据</h2>
    <InfiniteFeed initialItems={ customItems } autoGenerateInterval={ 3 } />
  </div>
}

/**
 * InfiniteFeed 组件测试页面
 * 展示了各种配置和自定义选项
 */
export default function InfiniteFeedTest() {
  const [activeExample, setActiveExample] = useState<string>('basic')

  const examples = [
    { id: 'basic', name: '基础示例', component: BasicExample },
    { id: 'custom-render', name: '自定义渲染', component: CustomRenderExample },
    { id: 'custom-data', name: '自定义数据', component: CustomDataExample },
  ]

  const ActiveComponent = examples.find(ex => ex.id === activeExample)?.component || BasicExample

  return (
    <div className="min-h-screen bg-background text-textPrimary">
      {/* 导航栏 */ }
      <div className="fixed top-0 left-0 right-0 z-40 bg-backgroundSubtle border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold mb-3">InfiniteFeed 组件测试</h1>
          <div className="flex gap-2 overflow-x-auto hide-scroll">
            { examples.map(example => (
              <button
                key={ example.id }
                onClick={ () => setActiveExample(example.id) }
                className={ `px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeExample === example.id
                  ? 'bg-primary text-white'
                  : 'bg-background text-textSecondary hover:bg-border'
                }` }
              >
                { example.name }
              </button>
            )) }
          </div>
        </div>
      </div>

      {/* 内容区域 */ }
      <div className="pt-32">
        <ActiveComponent />
      </div>
    </div>
  )
}
