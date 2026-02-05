'use client'

import type { DropdownItem, DropdownSection } from '.'
import { uniqueId } from '@jl-org/tool'
import { useState } from 'react'
import { Dropdown } from '.'
import { ThemeToggle } from '../ThemeToggle'
import { Faq } from './Faq'

function customRenderer(item: DropdownItem) {
  return <div
    className="flex items-center gap-4 border border-purple-400 rounded-lg border-dashed p-2 dark:border-purple-500"
  >
    <div className="text-2xl">✨</div>
    <div className="flex flex-col">
      <span className="text-purple-600 font-bold dark:text-purple-400">{ item.label }</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{ item.desc }</span>
    </div>
  </div>
}

export default function TestDropdownPage() {
  const [selectedId, setSelectedId] = useState<string | null>('1-1')

  /** 示例 1: 基本用法，展示 label, desc, tag, timestamp */
  const sections1: Record<string, DropdownItem[]> = {
    '基本用法 (手风琴模式)': [
      {
        id: '1-1',
        label: '🤖 AI 聊天',
        desc: '关于最新GPT-4的讨论',
        timestamp: new Date(),
        tag: 'AI',
        tagColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
      },
      {
        id: '1-2',
        label: '⚛️ React 组件',
        desc: 'Dropdown组件的实现',
        timestamp: new Date(Date.now() - 3600 * 1000),
        tag: '编程',
        tagColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
      },
    ],
    '昨天': [
      {
        id: '1-3',
        label: '🎨 设计评审',
        desc: '新版UI的设计稿',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        tag: '设计',
        tagColor: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
      },
    ],
  }

  /** 示例 2: 非手风琴模式，可同时展开多个 */
  const sections2: DropdownSection[] = [
    {
      name: '非手风琴模式',
      items: [
        {
          id: '2-1',
          label: '前端学习',
          desc: '学习 Vue 3 新特性',
        },
        {
          id: '2-2',
          label: '后端架构',
          desc: '微服务架构探讨',
        },
      ],
    },
    {
      name: '可以同时展开',
      items: [
        {
          id: '2-3',
          label: '项目管理',
          desc: '敏捷开发流程',
        },
      ],
    },
  ]

  /** 示例 3: 使用自定义项目渲染器 */
  const sections3: Record<string, DropdownItem[]> = {
    自定义渲染器: [
      { id: '3-1', label: '重要通知', desc: '这是一个非常重要的通知内容' },
      { id: '3-2', label: '次要信息', desc: '这是一个次要信息' },
    ],
  }

  /** 示例 4: 使用自定义 ReactNode 作为内容 */
  const sections4: DropdownSection[] = [
    {
      name: '自定义 ReactNode',
      items: (
        <div className="rounded-lg bg-gray-50 p-4 text-center space-y-2">
          <p className="font-semibold">这是一个完全自定义的区域</p>
          <p className="text-sm">你可以在这里放置任何React组件。</p>
          <button className="rounded bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600">
            一个按钮
          </button>
        </div>
      ),
    },
  ]

  /** 示例 5: 区域高度设置功能测试 - 不同区域不同高度 */
  const sections5: DropdownSection[] = [
    {
      name: '区域 A - 高度 150px',
      items: Array.from({ length: 12 }, (_, i) => ({
        id: `6-a-${i + 1}`,
        label: `项目 ${i + 1}`,
        desc: `区域 A 的第 ${i + 1} 个项目`,
        tag: `A${i + 1}`,
        tagColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
      })),
    },
    {
      name: '区域 B - 高度 300px',
      items: Array.from({ length: 20 }, (_, i) => ({
        id: `6-b-${i + 1}`,
        label: `项目 ${i + 1}`,
        desc: `区域 B 的第 ${i + 1} 个项目，这个区域高度更大`,
        tag: `B${i + 1}`,
        tagColor: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
      })),
    },
    {
      name: '区域 C - 高度 100px',
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `6-c-${i + 1}`,
        label: `项目 ${i + 1}`,
        desc: `区域 C 的第 ${i + 1} 个项目`,
        tag: `C${i + 1}`,
        tagColor: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
      })),
    },
  ]

  /** 示例 6: 使用自定义 ReactNode 作为内容 */

  const faqItems: Record<string, DropdownItem[]> = {
    'Q1: Which e-commerce sellers benefit most from PhotoG?': [
      {
        id: uniqueId(),
        customContent: (
          <div className="flex flex-col pl-4 space-y-3">
            <ul className="space-y-2">
              <li className="flex">
                <span className="mr-2">▸</span>
                <div>
                  <span className="font-medium">Platform sellers:</span>
                  Amazon brand sellers / Shopify store owners / TikTok social commerce entrepreneurs
                </div>
              </li>
              <li className="flex">
                <span className="mr-2">▸</span>
                <div>
                  <span className="font-medium">Product categories:</span>
                  Fashion and electronics to home goods
                </div>
              </li>
              <li className="flex">
                <span className="mr-2">▸</span>
                <div>
                  <span className="font-medium">Operations model:</span>
                  Supports both single-product launches and multi-platform operations
                </div>
              </li>
            </ul>
          </div>
        ),
      },
    ],
    'Q2: How does one product image enable full-cycle marketing?': [
      {
        id: uniqueId(),
        customContent: (
          <div className="flex flex-col pl-4 space-y-3">
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <span className="font-medium">Market Intelligence:</span>
                <span className="ml-2 text-gray-500">Competitor pricing analysis / Consumer trend prediction</span>
              </li>
              <li>
                <span className="font-medium">Smart Content Production:</span>
                <span className="ml-2 text-gray-500">SEO-optimized titles / Multilingual descriptions</span>
              </li>
              <li>
                <span className="font-medium">Visual Asset Creation:</span>
                <span className="ml-2 text-gray-500">A+ content / Short videos / 3D models</span>
              </li>
              <li>
                <span className="font-medium">Cross-Platform Deployment:</span>
                <span className="ml-2 text-gray-500">Automated publishing to Amazon/Shopify/TikTok</span>
              </li>
            </ol>
          </div>
        ),
      },
    ],
  }

  return (
    <div className="h-screen overflow-auto bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-center text-3xl font-bold dark:text-white">Dropdown 组件功能测试</h1>
          <ThemeToggle />
        </div>

        {/* 测试1 */ }
        <div className="border rounded-lg bg-white p-4 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold dark:text-white">示例 1: 基本功能与样式</h2>
          <p className="mb-2 text-sm dark:text-gray-300">
            测试选中效果 (平滑、无形变), 默认展开, 手风琴模式。
          </p>
          <Dropdown
            items={ sections1 }
            defaultExpanded={ ['基本用法 (手风琴模式)'] }
            selectedId={ selectedId }
            onClick={ setSelectedId }
            className="border rounded-md dark:border-gray-600"
            itemActiveClassName="font-semibold"
          />
        </div>

        {/* 测试2 */ }
        <div className="border rounded-lg bg-white p-4 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold dark:text-white">示例 2: 非手风琴模式</h2>
          <p className="mb-2 text-sm dark:text-gray-300">
            测试:
            <code className="dark:text-gray-300">accordion=false</code>
            ,
            <code className="dark:text-gray-300">DropdownSection[]</code>
            { ' ' }
            类型数据源。
          </p>
          <Dropdown
            items={ sections2 }
            accordion={ false }
            defaultExpanded={ ['非手风琴模式'] }
            className="border border-gray-200 rounded-md dark:border-gray-600"
          />
        </div>

        {/* 测试3 */ }
        <div className="border rounded-lg bg-white p-4 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold dark:text-white">示例 3: 自定义项目渲染器</h2>
          <p className="mb-2 text-sm dark:text-gray-300">
            测试:
            <code className="dark:text-gray-300">renderItem</code>
            { ' ' }
            属性。
          </p>
          <Dropdown
            items={ sections3 }
            renderItem={ customRenderer }
            className="border border-gray-200 rounded-md dark:border-gray-600"
          />
        </div>

        {/* 测试4 */ }
        <div className="border rounded-lg bg-white p-4 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold dark:text-white">示例 4: 自定义 ReactNode 内容</h2>
          <p className="mb-2 text-sm dark:text-gray-300">
            测试: 将
            <code className="dark:text-gray-300">React.ReactNode</code>
            { ' ' }
            作为分区内容。
          </p>
          <Dropdown
            items={ sections4 }
            className="border border-gray-200 rounded-md dark:border-gray-600"
          />
        </div>

        {/* 测试5: 区域高度设置 - 不同区域不同高度 */ }
        <div className="border rounded-lg bg-white p-4 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold dark:text-white">示例 5: 区域高度设置 - 不同区域不同高度</h2>
          <p className="mb-2 text-sm dark:text-gray-300">
            测试:
            <code className="dark:text-gray-300">sectionMaxHeight</code>
            { ' ' }
            使用对象形式，为不同区域设置不同高度。
          </p>
          <Dropdown
            items={ sections5 }
            sectionMaxHeight={ {
              '区域 A - 高度 150px': '150px',
              '区域 B - 高度 300px': '300px',
              '区域 C - 高度 100px': '100px',
            } }
            accordion={ false }
            defaultExpanded={ ['区域 A - 高度 150px', '区域 B - 高度 300px'] }
            className="border border-gray-200 rounded-md dark:border-gray-600"
          />
        </div>

        <div className="p-4">
          <Faq
            items={ faqItems }
          />
        </div>
      </div>
    </div>
  )
}
