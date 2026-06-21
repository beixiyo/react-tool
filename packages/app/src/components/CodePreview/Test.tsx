'use client'

import { BarChart3, Code2 } from 'lucide-react'
import { useState } from 'react'
import { CodePreview } from '.'
import { echartsHtml } from '../../../../comps/src/components/HtmlPreview/test.data'
import { Switch } from '../../../../comps/src/components/Switch'

export function CodePreviewTest() {
  const [htmlCode, setHtmlCode] = useState(echartsHtml)

  const handleHtmlCodeChange = (code: string) => {
    setHtmlCode(code)
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        <h1 className="text-2xl font-bold">CodePreview 组件测试</h1>

        <div className="flex flex-1 flex-col">
          <h2 className="mb-2 text-xl text-text2 font-semibold">HTML 预览 (默认头部)</h2>
          <div className="h-[500px] w-full">
            <CodePreview
              code={ htmlCode }
              language="html"
              title="HTML 示例"
              editable
              onCodeChange={ handleHtmlCodeChange }
              className="h-full"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-1 flex-col">
          <h2 className="mb-2 text-xl text-text2 font-semibold">HTML 预览 (自定义头部 + Switch)</h2>
          <div className="h-[500px] w-full">
            <CodePreview
              code={ htmlCode }
              language="html"
              title="HTML 示例"
              onCodeChange={ handleHtmlCodeChange }
              className="h-full"
              customHeader={ ({ activeTab, setActiveTab, isHtml, title }) => (
                <div className="flex items-center justify-between border-b border-border bg-background2 px-4 py-3">
                  <div className="text-sm text-text2 font-semibold">
                    { title }
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text3">代码</span>
                    <Switch
                      checked={ activeTab === 'preview' }
                      onChange={ checked => setActiveTab(checked
                        ? 'preview'
                        : 'code') }
                      disabled={ !isHtml }
                      size="md"
                      background="#e5e7eb"
                      withGradient={ false }
                      checkedIcon={ <BarChart3 size={ 12 } /> }
                      uncheckedIcon={ <Code2 size={ 12 } /> }
                      thumbClassName="bg-linear-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 text-white"
                    />
                    <span className="text-xs text-text3">预览</span>
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

export default CodePreviewTest
