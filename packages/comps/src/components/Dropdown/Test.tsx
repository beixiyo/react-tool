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

  /** 示例 5: 使用自定义 ReactNode 作为内容 */

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
    'Q3: Can I customize AI marketing workflows?': [
      {
        id: uniqueId(),
        customContent: (
          <div className="flex flex-col pl-4 space-y-3">
            <div className="text-blue-500 font-medium">Upcoming 「Agent Workshop」features:</div>
            <ul className="pl-2 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                AI role combinations: SEO Specialist × Visual Designer × Social Media Manager
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Preset templates: "Amazon Best Seller Kit", "Shopify Conversion Booster"
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Custom analytics dimensions and automation frequency configurations
              </li>
            </ul>
          </div>
        ),
      },
    ],
    'Q4: How do you ensure platform compliance?': [
      {
        id: uniqueId(),
        customContent: (
          <div className="flex flex-col pl-4 space-y-2">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Amazon A+ Content Standards
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                TikTok's 3-Second Hook Principle
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Google's E-E-A-T Framework
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Monthly SEO algorithm updates
              </li>
            </ul>
          </div>
        ),
      },
    ],
    'Q5: How is multimodal content quality controlled?': [
      {
        id: uniqueId(),
        customContent: (
          <div className="flex flex-col pl-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="mr-2 font-medium">1.</span>
                Aesthetic Evaluation matching Pinterest's visual trends
              </div>
              <div className="flex items-start">
                <span className="mr-2 font-medium">2.</span>
                Conversion Prediction for CTR and add-to-cart rates
              </div>
              <div className="flex items-start">
                <span className="mr-2 font-medium">3.</span>
                Optional professional designer refinement
              </div>
            </div>
          </div>
        ),
      },
    ],
    'Q6: Can I create Temu\'s minimalist-style assets?': [
      {
        id: uniqueId(),
        customContent: (
          <div className="flex flex-col pl-4 space-y-2">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">→</span>
                "Temu Mode" platform adaptation
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                Pure white background + USP-highlighted images
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                Title keyword density optimization (Temu search algorithm alignment)
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                Batch production of spec sheets/QC reports
              </li>
            </ul>
          </div>
        ),
      },
    ],
  }

  return (
    <div className="h-screen overflow-auto bg-white p-8 space-y-8 dark:bg-gray-900">
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

      <div className="p-4">
        <Faq
          items={ faqItems }
        />
      </div>

    </div>
  )
}
