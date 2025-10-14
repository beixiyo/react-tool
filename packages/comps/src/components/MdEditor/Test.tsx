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
    <div className="from-blue-50 via-white to-purple-50 bg-gradient-to-br p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl">
        <ThemeToggle />

        <div className="">
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
              className="h-96"
              defaultEditMode={ false }
              showFullscreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
