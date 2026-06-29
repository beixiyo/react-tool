'use client'

import { IMG_URLS } from 'config'
import { useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { Guide } from './index'

const steps = [
  {
    title: '访问 Chrome 扩展',
    description: '打开 Chrome 浏览器，地址栏输入 "chrome://extensions/"，进入扩展管理页面',
    links: ['chrome://extensions/'],
    image: IMG_URLS[0],
  },
  {
    title: '下载插件',
    description: '打开链接下载插件，并解压',
    links: ['https://pixly.art/auto-release.zip'],
  },
  {
    title: '安装扩展',
    description: '打开开发者模式，找到解压的文件夹安装',
    links: ['chrome://extensions/'],
    image: IMG_URLS[1],
  },
  {
    title: '开始使用',
    description: '插件检测到内容，就会显示按钮，点击等待加载后，即可自动发布（首次需要登录）',
    links: ['https://pixly.art/p/chat'],
    image: IMG_URLS[2],
  },
]

const shortSteps = [
  {
    title: '第一步',
    description: '仅含标题与说明的纯文本引导步骤，不带图片与链接',
  },
  {
    title: '第二步',
    description: '引导也可以只用两步快速完成，适合轻量提示场景',
  },
]

function Demo() {
  const [isOpen, setIsOpen] = useState(false)
  const [isShortOpen, setIsShortOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guide 引导弹窗</h1>
            <p className="mt-1 text-sm text-text2">多步骤安装引导，支持标题、说明、链接与配图</p>
          </div>
          <ThemeToggle />
        </header>

        <Card title="完整引导（含配图与链接）">
          <Button variant="primary" onClick={ () => setIsOpen(true) }>
            查看安装指南
          </Button>
        </Card>

        <Card title="精简引导（仅文本，两步）">
          <Button variant="secondary" onClick={ () => setIsShortOpen(true) }>
            查看精简引导
          </Button>
        </Card>
      </div>

      <Guide
        isOpen={ isOpen }
        steps={ steps }
        onClose={ () => setIsOpen(false) }
      />

      <Guide
        isOpen={ isShortOpen }
        steps={ shortSteps }
        onClose={ () => setIsShortOpen(false) }
      />

      <GithubSourceLink />
    </div>
  )
}

export default Demo
