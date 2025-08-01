'use client'

import { BarChart3, Code2 } from 'lucide-react'
import { useState } from 'react'
import { CodePreview } from '.'
import { echartsHtml } from '../HtmlPreview/test.data'
import { Switch } from '../Switch'

export function CodePreviewTest() {
  const [htmlCode, setHtmlCode] = useState(echartsHtml)

  const handleHtmlCodeChange = (code: string) => {
    setHtmlCode(code)
    console.log('HTML 代码已更新')
  }

  return (
    <div className="min-h-screen flex flex-col gap-8 p-6">
      <h1 className="text-2xl text-gray-800 font-bold dark:text-gray-200">CodePreview 组件测试</h1>

      <div className="flex flex-1 flex-col">
        <h2 className="mb-2 text-xl text-gray-700 font-semibold dark:text-gray-300">HTML 预览 (默认头部)</h2>
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
        <h2 className="mb-2 text-xl text-gray-700 font-semibold dark:text-gray-300">HTML 预览 (自定义头部 + Switch)</h2>
        <div className="h-[500px] w-full">
          <CodePreview
            code={ htmlCode }
            language="html"
            title="HTML 示例"
            onCodeChange={ handleHtmlCodeChange }
            className="h-full"
            customHeader={ ({ activeTab, setActiveTab, isHtml, title }) => (
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                <div className="text-sm text-gray-700 font-semibold dark:text-gray-300">
                  { title }
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">代码</span>
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
                    iconClassName="bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 text-white"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">预览</span>
                </div>
              </div>
            ) }
          />
        </div>
      </div>
    </div>
  )
}

export default CodePreviewTest
