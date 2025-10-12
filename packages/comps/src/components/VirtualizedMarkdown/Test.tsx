'use client'

import { timer } from '@jl-org/tool'
import { Plus, RefreshCw, StopCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { VirtualizedMarkdown } from '.'
import { Button } from '../Button'

const markdownContent = `
# 标题1
这是一个段落。

## 标题2
这是另一个段落，包含一些**加粗文本**和*斜体文本*。

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

- 列表项1
- 列表项2
- 列表项3

> 这是一个引用
`

export default function VirtualizedMarkdownTest() {
  const stopRef = useRef<VoidFunction>(null)
  const [content, setContent] = useState(markdownContent)

  const resetContent = () => {
    setContent(markdownContent)
  }

  function addContent() {
    stopRef.current?.()
    stopRef.current = timer(() => {
      setContent(prev => prev + markdownContent)
    }, 500)
  }

  useEffect(
    () => {
      addContent()
      return stopRef.current || (() => {})
    },
    [],
  )

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold">VirtualizedMarkdown 测试</h1>
        <p className="mb-4 text-gray-600">
          这个组件用于测试VirtualizedMarkdown的功能。
        </p>

        <div className="flex items-center gap-2">
          <Button
            onClick={ resetContent }
            variant="warning"
            leftIcon={ <RefreshCw size={ 16 } /> }
          >
            重置内容
          </Button>

          <Button
            onClick={ () => stopRef.current?.() }
            variant="info"
            leftIcon={ <StopCircleIcon size={ 16 } /> }
          >
            停止
          </Button>

          <Button
            onClick={ addContent }
            variant="success"
            leftIcon={ <Plus size={ 16 } /> }
          >
            开始自动添加内容
          </Button>
        </div>
      </div>

      <VirtualizedMarkdown
        content={ content }
        className="h-96 border border-gray-300 rounded-lg p-4 shadow-xs dark:border-gray-700"
      />
    </div>
  )
}
