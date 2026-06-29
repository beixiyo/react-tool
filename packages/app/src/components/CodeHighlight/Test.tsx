'use client'

import type { ShikiTheme } from './types'
import { NumberInput, Select, ThemeToggle } from 'comps'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { CodeHighlight } from '.'
import { sampleHtml } from '../../../../comps/src/components/HtmlPreview/test.data'
import { CODE_HIGHLIGHT_THEME_LIST } from './constants'

function CodeHighlightDemo() {
  const [theme, setTheme] = useState<ShikiTheme>('vitesse-dark')
  const [lineHeight, setLineHeight] = useState<number>(0.5)

  return (
    <div className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto max-w-4xl">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">代码高亮示例</h1>
          <ThemeToggle />
        </header>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="w-full md:w-[calc(50%-0.5rem)]">
            <label className="mb-2 block text-sm font-medium">选择主题：</label>
            <Select
              options={ CODE_HIGHLIGHT_THEME_LIST.map(t => ({ value: t, label: t })) }
              value={ theme }
              onChange={ val => setTheme(val as ShikiTheme) }
              className="w-full"
            />
          </div>

          <div className="w-full md:w-[calc(50%-0.5rem)]">
            <label className="mb-2 block text-sm font-medium">行高设置：</label>
            <NumberInput
              min={ 0.5 }
              max={ 3 }
              step={ 0.1 }
              value={ lineHeight }
              onChange={ setLineHeight }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-lg font-medium">HTML示例</h2>
            <CodeHighlight
              code={ sampleHtml }
              language="html"
              theme={ theme }
              lineHeight={ lineHeight }
              throttleUpdateTime={ 100 }
              className="h-72"
            />
          </div>

          <div>
            <h2 className="mb-2 text-lg font-medium">JavaScript示例</h2>
            <CodeHighlight
              code={ `function hello(name) {\n  console.log(\`Hello, \${name}!\`);\n  return name;\n}` }
              language="javascript"
              theme={ theme }
              lineHeight={ lineHeight }
              className="h-48"
            />
          </div>

          <div>
            <h2 className="mb-2 text-lg font-medium">无行号示例</h2>
            <CodeHighlight
              code={ `import React from 'react';\n\nconst App = () => {\n  return <div>Hello World</div>;\n};\n\nexport default App;` }
              language="jsx"
              showLineNumbers={ false }
              theme={ theme }
              lineHeight={ lineHeight }
            />
          </div>

          <div>
            <h2 className="mb-2 text-lg font-medium">TypeScript示例</h2>
            <CodeHighlight
              code={ `interface User {\n  name: string;\n  age: number;\n}\n\nfunction greet(user: User): string {\n  return \`Hello, \${user.name}! You are \${user.age} years old.\`;\n}\n\nconst user: User = {\n  name: 'Alice',\n  age: 30\n};\n\nconsole.log(greet(user));` }
              language="typescript"
              theme={ theme }
              lineHeight={ lineHeight }
            />
          </div>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default CodeHighlightDemo
