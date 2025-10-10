'use client'

import { useState } from 'react'
import { Button } from '../Button'
import { Guide } from './index'

const steps = [
  {
    title: '访问 Chrome 扩展',
    description: '打开 Chrome 浏览器，地址栏输入 "chrome://extensions/"，进入扩展管理页面',
    links: ['chrome://extensions/'],
    image: new URL('./assets/p1.png', import.meta.url).href,
  },
  {
    title: '下载插件',
    description: '打开链接下载插件，并解压',
    links: ['https://photog.art/auto-release.zip'],
  },
  {
    title: '安装扩展',
    description: '打开开发者模式，找到解压的文件夹安装',
    links: ['chrome://extensions/'],
    image: new URL('./assets/p2.png', import.meta.url).href,
  },
  {
    title: '开始使用',
    description: '插件检测到内容，就会显示按钮，点击等待加载后，即可自动发布（首次需要登录）',
    links: ['https://photog.art/p/chat'],
    image: new URL('./assets/p3.png', import.meta.url).href,
  },
]

export default function Demo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-8">
      <Button
        onClick={ () => setIsOpen(true) }
        variant="primary"
      >
        查看安装指南
      </Button>

      <Guide
        isOpen={ isOpen }
        steps={ steps }
        onClose={ () => setIsOpen(false) }
      />
    </div>
  )
}
