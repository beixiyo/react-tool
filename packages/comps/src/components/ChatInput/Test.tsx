'use client'

import type { ChatSubmitPayload, InputHistory, PromptTemplate } from './types'
import { Bug, Code, FileText, Zap } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '..'
import { ChatInput } from './ChatInput'

export default function Test() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickMode, setQuickMode] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [messages, setMessages] = useState<string[]>([])

  /** 自定义提示词模板示例 */
  const customTemplates: PromptTemplate[] = [
    {
      id: 'custom-react-component',
      title: '创建 React 组件',
      content: '请帮我创建一个 React 组件，要求如下：\n\n组件名称：{componentName}\n功能描述：{description}\n\n请使用 TypeScript + memo 优化，并提供完整的 Props 接口定义。',
      description: '快速创建 React 组件模板',
      category: 'code',
      icon: <Code size={ 16 } />,
      isCustom: true,
      createdAt: Date.now(),
      usageCount: 5,
      tags: ['React', '组件', 'TypeScript'],
    },
    {
      id: 'custom-api-design',
      title: 'API 接口设计',
      content: '请帮我设计一个 RESTful API 接口：\n\n接口用途：{purpose}\n数据模型：{dataModel}\n\n请提供完整的接口文档，包括请求参数、响应格式和错误处理。',
      description: '设计 RESTful API 接口',
      category: 'document',
      icon: <FileText size={ 16 } />,
      isCustom: true,
      createdAt: Date.now() - 86400000,
      usageCount: 3,
      tags: ['API', 'RESTful', '接口设计'],
    },
  ]

  /** 处理消息发送 */
  const handleSubmit = async (data: ChatSubmitPayload) => {
    const message = data.text || ''
    if (!message.trim())
      return

    setLoading(true)
    setMessages(prev => [...prev, `用户: ${message}`])

    /** 模拟 AI 响应 */
    setTimeout(() => {
      const responses = [
        '我理解您的需求，让我来帮您解决这个问题。',
        '这是一个很好的问题，我会详细为您分析。',
        '根据您提供的信息，我建议采用以下方案：',
        '让我为您提供一个完整的解决方案。',
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      setMessages(prev => [...prev, `AI: ${randomResponse}`])
      setLoading(false)
      setValue('')
    }, 1000 + Math.random() * 2000)
  }

  /** 处理模板选择 */
  const handleTemplateSelect = (template: PromptTemplate) => {
    console.log('选择了模板:', template.title)
  }

  /** 处理历史记录选择 */
  const handleHistorySelect = (history: InputHistory) => {
    console.log('选择了历史记录:', `${history.content.substring(0, 50)}...`)
  }

  /** 处理文件上传 */
  const handleFilesChange = (files: string[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  /** 处理文件删除 */
  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="h-screen overflow-auto bg-background p-8">
      {/* 主题切换 */ }
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* 标题 */ }
        <div className="text-center">
          <p className="text-textSecondary">
            支持提示词模板、输入历史、自动补全、快捷键等功能
          </p>
        </div>

        <ChatInput
          value={ value }
          onChange={ setValue }
          onSubmit={ handleSubmit }
          onTemplateSelect={ handleTemplateSelect }
          onHistorySelect={ handleHistorySelect }
          onQuickModeChange={ setQuickMode }
          onFilesChange={ handleFilesChange }
          onFileRemove={ handleFileRemove }
          loading={ loading }
          quickMode={ quickMode }
          uploadedFiles={ uploadedFiles }
          customTemplates={ customTemplates }
          placeholder="输入您的问题，或使用 Ctrl+/ 打开提示词模板... 试试输入 '创建' 或 '设计' 来测试光标跟随功能"
          className="h-34"
          enablePromptTemplates
          enableHistory
          enableAutoComplete
          enableVoiceRecorder
          showUploader
          showQuickMode
        />

        {/* 功能特性 */ }
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
          <div className="border border-border rounded-lg bg-backgroundSubtle p-4 shadow-xs">
            <div className="mb-2 flex items-center gap-2">
              <Code size={ 20 } className="text-blue-500" />
              <h3 className="text-textPrimary font-semibold">提示词模板</h3>
            </div>
            <p className="text-sm text-textSecondary">
              预设和自定义模板，快速生成常用提示词
            </p>
          </div>

          <div className="border border-border rounded-lg bg-backgroundSubtle p-4 shadow-xs">
            <div className="mb-2 flex items-center gap-2">
              <Bug size={ 20 } className="text-green-500" />
              <h3 className="text-textPrimary font-semibold">输入历史</h3>
            </div>
            <p className="text-sm text-textSecondary">
              自动保存输入历史，支持搜索和快速重用
            </p>
          </div>

          <div className="border border-border rounded-lg bg-backgroundSubtle p-4 shadow-xs">
            <div className="mb-2 flex items-center gap-2">
              <FileText size={ 20 } className="text-purple-500" />
              <h3 className="text-textPrimary font-semibold">自动补全</h3>
            </div>
            <p className="text-sm text-textSecondary">
              智能建议模板和历史记录，提高输入效率
            </p>
          </div>

          <div className="border border-border rounded-lg bg-backgroundSubtle p-4 shadow-xs">
            <div className="mb-2 flex items-center gap-2">
              <Zap size={ 20 } className="text-yellow-500" />
              <h3 className="text-textPrimary font-semibold">快捷键</h3>
            </div>
            <p className="text-sm text-textSecondary">
              丰富的键盘快捷键，提升操作体验
            </p>
          </div>
        </div>

        {/* 聊天消息历史 */ }
        { messages.length > 0 && (
          <div className="max-h-64 overflow-y-auto border border-border rounded-lg bg-backgroundSubtle p-4 shadow-xs">
            <h3 className="mb-3 text-textPrimary font-semibold">对话历史</h3>
            <div className="space-y-2">
              { messages.map((message, index) => (
                <div
                  key={ `message-${index}-${message.slice(0, 10)}` }
                  className={ `p-2 rounded ${message.startsWith('用户:')
                    ? 'toning-blue text-textPrimary'
                    : 'bg-backgroundSubtle text-textPrimary'
                  }` }
                >
                  { message }
                </div>
              )) }
            </div>
          </div>
        ) }

        {/* 主要组件演示 */ }
        <div className="border border-border rounded-lg bg-backgroundSubtle p-6 shadow-xs">
          <h3 className="mb-4 text-textPrimary font-semibold">
            ChatInput 统一组件 - 光标跟随自动补全
          </h3>

          <div className="mb-4 rounded-lg toning-blue p-3">
            <p className="text-sm toning-blue-text">
              <strong>光标跟随功能测试：</strong>
              <br />
              1. 在输入框中输入文字，自动补全面板会跟随光标位置显示
              <br />
              2. 使用方向键移动光标，面板位置会实时更新
              <br />
              3. 滚动页面或调整窗口大小，面板会自动调整位置防止超出边界
              <br />
              4. 输入 "创建" 或 "设计" 等关键词可以触发自动补全建议
            </p>
          </div>
        </div>

        {/* 快捷键说明 */ }
        <div className="border border-border rounded-lg bg-backgroundSubtle p-6 shadow-xs">
          <h3 className="mb-4 text-textPrimary font-semibold">
            快捷键说明
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">打开提示词模板</span>
                <kbd className="rounded bg-backgroundSubtle px-2 py-1 text-xs border border-border">Ctrl + /</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">打开输入历史</span>
                <kbd className="rounded bg-backgroundSubtle px-2 py-1 text-xs border border-border">Ctrl + H</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">发送消息</span>
                <kbd className="rounded bg-backgroundSubtle px-2 py-1 text-xs border border-border">Ctrl + Enter</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">清空输入</span>
                <kbd className="rounded bg-backgroundSubtle px-2 py-1 text-xs border border-border">Ctrl + K</kbd>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">上一个历史</span>
                <kbd className="rounded bg-backgroundSubtle px-2 py-1 text-xs border border-border">↑</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">下一个历史</span>
                <kbd className="rounded bg-backgroundSubtle px-2 py-1 text-xs border border-border">↓</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">选择当前项</span>
                <kbd className="rounded bg-backgroundSubtle px-2 py-1 text-xs border border-border">Enter</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">关闭面板</span>
                <kbd className="rounded bg-backgroundSubtle px-2 py-1 text-xs border border-border">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */ }
        <div className="border border-border rounded-lg bg-backgroundSubtle p-6 shadow-xs">
          <h3 className="mb-4 text-textPrimary font-semibold">
            使用说明
          </h3>

          <div className="prose dark:prose-invert max-w-none">
            <ol className="text-sm text-textSecondary space-y-2">
              <li>点击输入框开始输入，或使用快捷键快速操作</li>
              <li>
                使用
                <code>Ctrl+/</code>
                { ' ' }
                打开提示词模板面板，选择预设模板
              </li>
              <li>
                使用
                <code>Ctrl+H</code>
                { ' ' }
                查看和重用输入历史
              </li>
              <li>输入时会自动显示相关的补全建议</li>
              <li>支持拖拽上传图片文件</li>
              <li>多行输入会自动调整高度</li>
              <li>所有数据都保存在本地存储中</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
