'use client'

import type { DropdownItem, DropdownSection } from '.'
import { uniqueId } from '@jl-org/tool'
import { useState } from 'react'
import { Dropdown } from '.'
import { ThemeToggle } from '../ThemeToggle'
import { Faq } from './Faq'

function customRenderer(item: DropdownItem) {
  return <div
    className="flex items-center gap-4 border border-border/50 rounded-xl p-3 bg-backgroundSecondary/50 hover:bg-backgroundSecondary transition-all duration-200 group"
  >
    <div className="w-10 h-10 rounded-full bg-systemPurple/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">✨</div>
    <div className="flex flex-col">
      <span className="text-textPrimary font-medium group-hover:text-systemPurple transition-colors">{ item.label }</span>
      <span className="text-xs text-textTertiary leading-tight">{ item.desc }</span>
    </div>
  </div>
}

export default function TestDropdownPage() {
  const [selectedId, setSelectedId] = useState<string | null>('1-1')
  const [collapsedSelectedId, setCollapsedSelectedId] = useState<string | null>('7-2')

  /** 示例 1: 基本用法，展示 label, desc, tag, timestamp */
  const sections1: Record<string, DropdownItem[]> = {
    '基本用法 (手风琴模式)': [
      {
        id: '1-1',
        label: '🤖 AI 聊天',
        desc: '关于最新GPT-4的讨论',
        timestamp: new Date(),
        tag: 'AI', // 使用系统蓝色 Token
        tagColor: 'bg-systemBlue/10 text-systemBlue',
      },
      {
        id: '1-2',
        label: '⚛️ React 组件',
        desc: 'Dropdown组件的实现',
        timestamp: new Date(Date.now() - 3600 * 1000),
        tag: '编程', // 使用系统绿色 Token
        tagColor: 'bg-systemGreen/10 text-systemGreen',
      },
    ],
    '昨天': [
      {
        id: '1-3',
        label: '🎨 设计评审',
        desc: '新版UI的设计稿',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        tag: '设计', // 映射为系统紫色 Token
        tagColor: 'bg-systemPurple/10 text-systemPurple',
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
      name: 'Custom Interactive Nodes',
      items: (
        <div className="rounded-2xl bg-backgroundSecondary/50 border border-border/50 p-6 text-center space-y-4 backdrop-blur-sm">
          <div className="space-y-1">
            <p className="font-semibold text-lg text-textPrimary">Fully Extensible</p>
            <p className="text-sm text-textSecondary leading-relaxed">
              Inject any React component into the dropdown flow. Perfect for settings, complex forms, or interactive cards.
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-full bg-textPrimary px-6 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity active:scale-95 duration-200">
            Action Trigger
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
        tagColor: 'bg-systemPurple/10 text-systemPurple',
      })),
    },
    {
      name: '区域 B - 高度 300px',
      items: Array.from({ length: 20 }, (_, i) => ({
        id: `6-b-${i + 1}`,
        label: `项目 ${i + 1}`,
        desc: `区域 B 的第 ${i + 1} 个项目，这个区域高度更大`,
        tag: `B${i + 1}`,
        tagColor: 'bg-systemOrange/10 text-systemOrange',
      })),
    },
    {
      name: '区域 C - 高度 100px',
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `6-c-${i + 1}`,
        label: `项目 ${i + 1}`,
        desc: `区域 C 的第 ${i + 1} 个项目`,
        tag: `C${i + 1}`,
        tagColor: 'bg-systemPurple/10 text-systemPurple',
      })),
    },
  ]

  /** 示例 6: 收起态堆叠预览 */
  const sections6: Record<string, DropdownItem[]> = {
    待处理: [
      {
        id: '7-1',
        label: '版本更新',
        desc: '准备发布说明与变更摘要',
        tag: '产品',
        tagColor: 'bg-systemBlue/10 text-systemBlue',
      },
      {
        id: '7-2',
        label: '体验回访',
        desc: '整理三条高优先级反馈',
        tag: '研究',
        tagColor: 'bg-systemGreen/10 text-systemGreen',
      },
      {
        id: '7-3',
        label: '设计同步',
        desc: '确认视觉稿走查结果',
        tag: '设计',
        tagColor: 'bg-systemOrange/10 text-systemOrange',
      },
    ],
    本周完成: [
      {
        id: '7-4',
        label: '组件联调',
        desc: 'Dropdown 与列表数据对齐',
        tag: '前端',
        tagColor: 'bg-systemBlue/10 text-systemBlue',
      },
      {
        id: '7-5',
        label: '验收回归',
        desc: '修复 2 个 UI 细节',
        tag: 'QA',
        tagColor: 'bg-systemRed/10 text-systemRed',
      },
    ],
    已归档: [
      {
        id: '7-6',
        label: '导航方案',
        desc: '最终视觉确认',
        tag: '完成',
        tagColor: 'bg-backgroundSecondary text-textSecondary',
      },
    ],
  }

  /** 示例 7: 使用自定义 ReactNode 作为内容 */

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
    <div className="min-h-screen bg-background text-textPrimary selection:bg-brand/10">
      <div className="max-w-4xl mx-auto px-6 py-24 space-y-32">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-widest uppercase text-textSecondary opacity-50">Components / Dropdown</span>
            <ThemeToggle />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Dropdown</h1>
          <p className="text-xl text-textSecondary max-w-xl leading-relaxed">
            A minimalist, highly customizable dropdown component with smooth animations and flexible data structures.
          </p>
        </header>

        {/* Section 1: Basic */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Standard Usage</h2>
            <p className="text-textSecondary">Smooth selection with accordion mode and metadata support.</p>
          </div>
          <div className="bg-backgroundSecondary/30 border border-border rounded-2xl overflow-hidden p-1">
            <Dropdown
              items={ sections1 }
              defaultExpanded={ ['基本用法 (手风琴模式)'] }
              selectedId={ selectedId }
              onClick={ setSelectedId }
              className="border-none bg-transparent"
              itemActiveClassName="font-medium bg-backgroundSecondary"
            />
          </div>
        </section>

        {/* Section 2: Configurable Modes */}
        <section className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Multiple Expansion</h2>
              <p className="text-textSecondary">Disable accordion for independent section control.</p>
            </div>
            <div className="bg-backgroundSecondary/30 border border-border rounded-2xl overflow-hidden p-1">
              <Dropdown
                items={ sections2 }
                accordion={ false }
                defaultExpanded={ ['非手风琴模式'] }
                className="border-none bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Custom Rendering</h2>
              <p className="text-textSecondary">Inject custom components for complete item control.</p>
            </div>
            <div className="bg-backgroundSecondary/30 border border-border rounded-2xl overflow-hidden p-1">
              <Dropdown
                items={ sections3 }
                renderItem={ customRenderer }
                className="border-none bg-transparent"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Advanced Layouts */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Dynamic Content & Virtualization</h2>
            <p className="text-textSecondary">Handle large datasets with individual section height limits.</p>
          </div>
          <div className="bg-backgroundSecondary/30 border border-border rounded-2xl overflow-hidden p-1">
            <Dropdown
              items={ sections5 }
              sectionMaxHeight={ {
                '区域 A - 高度 150px': '150px',
                '区域 B - 高度 300px': '300px',
                '区域 C - 高度 100px': '100px',
              } }
              accordion={ false }
              defaultExpanded={ ['区域 A - 高度 150px', '区域 B - 高度 300px'] }
              className="border-none bg-transparent"
            />
          </div>
        </section>

        {/* Section 4: Collapsed Preview & Rich Content */}
        <section className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Stacked Preview</h2>
              <p className="text-textSecondary">Visual depth for collapsed sections showing item counts.</p>
            </div>
            <div className="bg-backgroundSecondary/30 border border-border rounded-2xl overflow-hidden p-1">
              <Dropdown
                items={ sections6 }
                collapsedPreview
                collapsedStackedCards={ { layers: 3, offsetX: 0, offsetY: 7, variant: 'border' } }
                selectedId={ collapsedSelectedId }
                onClick={ setCollapsedSelectedId }
                className="border-none bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Rich Content</h2>
              <p className="text-textSecondary">Embed complex React nodes directly within dropdown sections.</p>
            </div>
            <div className="bg-backgroundSecondary/30 border border-border rounded-2xl overflow-hidden p-1">
              <Dropdown
                items={ sections4 }
                className="border-none bg-transparent"
              />
            </div>
          </div>
        </section>

        {/* Section 5: FAQ & Custom Node */}
        <section className="space-y-8">
          <div className="space-y-2 text-center py-12">
            <h2 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <Faq items={ faqItems } className="py-0" />
        </section>

        {/* Footer info */}
        <footer className="pt-24 pb-12 text-center">
          <p className="text-sm text-textSecondary opacity-40">
            Designed with precision. Built for performance.
          </p>
        </footer>
      </div>
    </div>
  )
}
