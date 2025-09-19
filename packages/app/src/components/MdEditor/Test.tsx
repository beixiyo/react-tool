'use client'

import type { MdEditorRef } from '.'
import { useRef, useState } from 'react'
import { MdEditor } from '.'
import { Button } from '../Button'
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

---

**开始编辑体验吧！** 点击右上角的编辑按钮。`
  const [content, setContent] = useState(defaultContent)
  const editorRef = useRef<MdEditorRef>(null)

  return (
    <div className="h-screen overflow-auto from-blue-50 via-white to-purple-50 bg-linear-to-br p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* 主编辑器 */ }
          <div className="border border-gray-200 rounded-xl bg-white/60 p-6 dark:border-gray-700 dark:bg-gray-800/60">
            <h3 className="mb-4 text-lg text-gray-800 font-semibold dark:text-gray-200">主编辑器 (Ref 控制)</h3>
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
              defaultEditMode={ false }
              showFullscreen
              className="h-xl"
            />
          </div>

          {/* 功能演示区域 */ }
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border border-gray-200 rounded-xl bg-white/60 p-6 dark:border-gray-700 dark:bg-gray-800/60">
              <h3 className="mb-4 text-lg text-gray-800 font-semibold dark:text-gray-200">水平布局演示</h3>
              <MdEditor
                content="# 水平布局\n\n这是一个水平布局的示例，适合宽屏显示。\n\n**特点：**\n- 左右分屏\n- 编辑和预览并排显示"
                layout="horizontal"
                defaultEditMode
                showFullscreen={ false }
                className="h-xl"
              />
            </div>

            <div className="border border-gray-200 rounded-xl bg-white/60 p-6 dark:border-gray-700 dark:bg-gray-800/60">
              <h3 className="mb-4 text-lg text-gray-800 font-semibold dark:text-gray-200">垂直布局演示</h3>
              <MdEditor
                content="# 垂直布局\n\n这是一个垂直布局的示例，适合移动设备。\n\n**特点：**\n- 上下分屏\n- 节省水平空间"
                layout="vertical"
                defaultEditMode
                showFullscreen={ false }
                className="h-xl"
              />
            </div>
          </div>
          {/* 自定义 Header 演示 */ }
          <div className="border border-gray-200 rounded-xl bg-white/60 p-6 dark:border-gray-700 dark:bg-gray-800/60">
            <h3 className="mb-4 text-lg text-gray-800 font-semibold dark:text-gray-200">自定义 Header 演示</h3>
            <MdEditor
              content="# 自定义 Header\n\n这个编辑器的头部是完全自定义的。"
              className="h-xl"
              defaultEditMode
              renderHeader={ ({ isEditMode, toggleEditMode, isFullscreen, toggleFullscreen }) => (
                <div
                  className="flex items-center justify-between rounded-t-lg from-teal-400/20 to-cyan-400/20 bg-linear-to-r p-3 dark:from-teal-800/30 dark:to-cyan-800/30"
                  style={ {
                    height: 56,
                  } }
                >
                  <span className="text-teal-800 font-bold dark:text-teal-200">✨ 我的自定义标题 ✨</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      designStyle="neumorphic"
                      onClick={ toggleEditMode }
                    >
                      { isEditMode
                        ? '预览'
                        : '编辑' }
                    </Button>
                    <Button
                      size="sm"
                      designStyle="neumorphic"
                      onClick={ toggleFullscreen }
                    >
                      { isFullscreen
                        ? '退出全屏'
                        : '全屏' }
                    </Button>
                  </div>
                </div>
              ) }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
