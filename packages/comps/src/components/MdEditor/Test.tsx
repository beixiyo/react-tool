'use client'

import type { MdEditorRef } from '.'
import { useRef, useState } from 'react'
import { MdEditor } from '.'
import { Button } from '../Button'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

function App() {
  const defaultContent = `# Welcome to Markdown Editor

这是一个功能强大的 **Markdown 编辑器**，具有以下特性：

## 主要功能

- ✨ **实时预览** - 边写边看效果
- 🎨 **智能布局** - 根据屏幕尺寸自动调整
- 🔄 **模式切换** - 一键切换编辑/预览模式
- 📱 **响应式设计** - 完美适配各种设备
- 🚀 **流畅动画** - 精心设计的过渡效果
- 外部 Ref 控制
- 自定义 Header

## 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, Markdown Editor!')
}
\`\`\`

## 链接和引用

访问 [GitHub](https://github.com) 了解更多开源项目。

> 这是一个引用块，用来突出重要信息。

## 列表

### 有序列表
1. 第一项
2. 第二项
3. 第三项

### 无序列表
- 项目一
- 项目二
- 项目三

### 任务列表
- [x] 已完成的任务
- [ ] 待办任务一
- [ ] 待办任务二

---

**开始编辑体验吧！** 点击右上角的编辑按钮。`
  const [content, setContent] = useState(defaultContent)
  const editorRef = useRef<MdEditorRef>(null)

  return (
    <div className="min-h-screen overflow-auto bg-background p-4 text-text">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MdEditor 组件</h1>
            <p className="mt-1 text-sm text-text2">支持编辑/预览/全屏切换的 Markdown 编辑器</p>
          </div>
          <ThemeToggle />
        </header>

        {/* 主编辑器 */ }
        <div className="border border-border rounded-xl bg-background2 p-6">
          <h3 className="mb-4 text-lg text-text font-semibold">主编辑器 (Ref 控制)</h3>
          <div className="mb-4 flex flex-wrap gap-4">
            <Button onClick={ () => editorRef.current?.toggleEditMode() }>
              切换编辑/预览模式
            </Button>
            <Button onClick={ () => editorRef.current?.toggleFullscreen() }>切换全屏</Button>
          </div>

          <MdEditor
            ref={ editorRef }
            content={ content }
            onChange={ setContent }
            layout="auto"
            className="h-96 bg-background2"
            defaultEditMode={ false }
            showFullscreen
          />
        </div>

        {/* 自定义 Header（语义 token，适配明暗） */ }
        <div className="border border-border rounded-xl bg-background2 p-6">
          <h3 className="mb-4 text-lg text-text font-semibold">自定义 Header</h3>
          <MdEditor
            content={ '# 自定义 Header\n\n通过 `renderHeader` 自定义顶栏，使用语义 token 自动适配明暗主题。' }
            layout="auto"
            className="h-72 bg-background3"
            defaultEditMode
            renderHeader={ controls => (
              <div className="h-14 flex items-center justify-between border-b border-border bg-background2 px-5 text-text">
                <span className="font-semibold">{ controls.title ?? '自定义编辑器' }</span>
                <Button size="sm" onClick={ controls.toggleEditMode }>
                  { controls.isEditMode
                    ? '预览'
                    : '编辑' }
                </Button>
              </div>
            ) }
          />
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default App
