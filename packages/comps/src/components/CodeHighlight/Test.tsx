'use client'

import type { ShikiTheme } from './types'
import { CodeHighlight } from '.'
import { NumberInput, Select } from '..'
import { sampleHtml } from '../HtmlPreview/test.data'
import { CODE_HIGHLIGHT_THEME_LIST } from './constants'

export default function CodeHighlightDemo() {
  const [theme, setTheme] = useState<ShikiTheme>('vitesse-dark')
  const [lineHeight, setLineHeight] = useState<number>(0.5)

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold dark:text-white">代码高亮示例</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-full md:w-[calc(50%-0.5rem)]">
          <label className="mb-2 block text-sm font-medium dark:text-white">选择主题：</label>
          <Select
            options={ CODE_HIGHLIGHT_THEME_LIST.map(t => ({ value: t, label: t })) }
            value={ theme }
            onChange={ val => setTheme(val as ShikiTheme) }
            className="w-full"
          />
        </div>

        <div className="w-full md:w-[calc(50%-0.5rem)]">
          <label className="mb-2 block text-sm font-medium dark:text-white">行高设置：</label>
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
          <h2 className="mb-2 text-lg font-medium dark:text-white">HTML示例</h2>
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
          <h2 className="mb-2 text-lg font-medium dark:text-white">JavaScript示例</h2>
          <CodeHighlight
            code={ `function hello(name) {\n  console.log(\`Hello, \${name}!\`);\n  return name;\n}` }
            language="javascript"
            theme={ theme }
            lineHeight={ lineHeight }
            className="h-48"
          />
        </div>

        <div>
          <h2 className="mb-2 text-lg font-medium dark:text-white">无行号示例</h2>
          <CodeHighlight
            code={ `import React from 'react';\n\nconst App = () => {\n  return <div>Hello World</div>;\n};\n\nexport default App;` }
            language="jsx"
            showLineNumbers={ false }
            theme={ theme }
            lineHeight={ lineHeight }
          />
        </div>

        <div>
          <h2 className="mb-2 text-lg font-medium dark:text-white">TypeScript示例</h2>
          <CodeHighlight
            code={ `interface User {\n  name: string;\n  age: number;\n}\n\nfunction greet(user: User): string {\n  return \`Hello, \${user.name}! You are \${user.age} years old.\`;\n}\n\nconst user: User = {\n  name: 'Alice',\n  age: 30\n};\n\nconsole.log(greet(user));` }
            language="typescript"
            theme={ theme }
            lineHeight={ lineHeight }
          />
        </div>
      </div>
    </div>
  )
}
