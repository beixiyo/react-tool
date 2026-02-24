'use client'

import type { ChatSubmitPayload, InputHistory, PromptTemplate, TextInsertController, VoiceRecordingResult } from './types'
import { Bug, Code, FileText, Zap } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Checkbox, ThemeToggle } from '..'
import { ChatInput } from './ChatInput'
import { formatShortcut } from './constants'

const testResults = [
  '你好',
  '你好，这是',
  '你好，这是自定义',
  '你好，这是自定义 ASR',
  '你好，这是自定义 ASR 提供者',
  '你好，这是自定义 ASR 提供者的测试',
]

export default function Test() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [messages, setMessages] = useState<string[]>([])
  const [useCustomASR, setUseCustomASR] = useState(false)
  const [useContinuousRecognition, setUseContinuousRecognition] = useState(false)

  /** 用于存储识别定时器的引用 */
  const recognitionTimerRef = useRef<number | null>(null)
  /** 用于存储当前识别进度的引用 */
  const recognitionProgressRef = useRef<number>(0)
  /** 用于存储当前的 controller 引用 */
  const controllerRef = useRef<TextInsertController | null>(null)

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

  /** 处理语音提交 */
  const handleVoiceSubmit = (voice: VoiceRecordingResult) => {
    console.log('语音提交:', voice)

    /** 这里可以处理语音上传到服务器、播放语音等逻辑 */
    setMessages(prev => [...prev, `用户: [语音消息 - ${voice.audioBlob.size} bytes]`])

    /** 模拟AI响应 */
    setTimeout(() => {
      setMessages(prev => [...prev, `AI: 我收到了您的语音消息，大小为 ${voice.audioBlob.size} bytes`])
    }, 1000)
  }

  /** 自定义 ASR 回调方式 */
  const customASRCallbacks = useMemo(() => ({
    onStartRecord: async (controller: TextInsertController) => {
      console.log('🎤 开始录音')
      console.log('当前文本:', controller.currentText)
      console.log('录音前文本:', controller.textBeforeRecord)
      console.log('连续识别模式:', useContinuousRecognition
        ? '开启'
        : '关闭')

      /** 保存 controller 引用 */
      controllerRef.current = controller

      /** 重置识别进度 */
      recognitionProgressRef.current = 0

      /** 如果开启连续识别，模拟流式返回识别结果 */
      if (useContinuousRecognition) {
        /** 清除之前的定时器 */
        if (recognitionTimerRef.current) {
          clearInterval(recognitionTimerRef.current)
        }

        /** 立即处理第一个识别结果 */
        if (testResults.length > 0) {
          const firstText = testResults[0]
          const currentController = controllerRef.current

          if (currentController) {
            const textBefore = currentController.textBeforeRecord
            currentController.insertText(textBefore + firstText, true)
            console.log('📝 实时识别结果:', firstText)
            console.log('🔄 实时更新已应用')
          }
        }

        /** 模拟流式识别结果 */
        recognitionTimerRef.current = window.setInterval(() => {
          recognitionProgressRef.current += 1
          if (recognitionProgressRef.current < testResults.length) {
            const currentText = testResults[recognitionProgressRef.current]
            const currentController = controllerRef.current

            if (currentController) {
              /** 实时更新识别结果 */
              const textBefore = currentController.textBeforeRecord
              /** 替换模式：将录音前的文本 + 当前识别结果插入 */
              currentController.insertText(textBefore + currentText, true)
              console.log('📝 实时识别结果:', currentText)
              console.log('🔄 实时更新已应用')
            }
          }
          else {
            /** 识别完成，清除定时器 */
            if (recognitionTimerRef.current) {
              clearInterval(recognitionTimerRef.current)
              recognitionTimerRef.current = null
            }
          }
        }, 300)
      }
      else {
        /** 模拟初始化外部 ASR 服务 */
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    },

    onEndRecord: async (audioData: VoiceRecordingResult, controller: TextInsertController) => {
      console.log('🎙️ 录音结束，音频数据:', {
        audioUrl: audioData.audioUrl,
        audioBlob: {
          size: audioData.audioBlob.size,
          type: audioData.audioBlob.type,
        },
      })

      /** 清除识别定时器 */
      if (recognitionTimerRef.current) {
        clearInterval(recognitionTimerRef.current)
        recognitionTimerRef.current = null
      }

      /** 清除 controller 引用 */
      controllerRef.current = null

      /** 如果关闭连续识别，在录音结束后一次性插入识别结果 */
      if (!useContinuousRecognition) {
        /** 模拟调用外部 ASR 服务识别音频 */
        const transcript = await new Promise<string>((resolve) => {
          /** 模拟识别延迟 */
          setTimeout(() => {
            /** 模拟识别结果 */
            resolve(testResults[testResults.length - 1])
          }, 500)
        })

        /** 使用 controller 插入识别结果 */
        controller.appendText(transcript)
        console.log('✅ 识别结果已插入:', transcript)
      }
      else {
        /** 连续识别模式下，最终结果已经在流式更新中插入 */
        const finalTranscript = testResults[testResults.length - 1]
        console.log('✅ 连续识别完成，最终结果:', finalTranscript)
      }
    },

    onTranscriptUpdate: (text: string, controller: TextInsertController) => {
      /** 实时流式识别结果更新 */
      console.log('📝 实时识别结果:', text)

      /** 如果开启连续识别，实时更新识别结果 */
      if (useContinuousRecognition) {
        /** 获取录音前的文本 */
        const textBefore = controller.textBeforeRecord
        /** 替换模式：将录音前的文本 + 当前识别结果插入 */
        controller.insertText(textBefore + text, true)
        console.log('🔄 实时更新已应用')
      }
      /** 如果关闭连续识别，不执行任何操作，等待录音结束后一次性插入 */
    },

    onError: (error: Error) => {
      console.error('❌ ASR 错误:', error)
      /** 清除定时器 */
      if (recognitionTimerRef.current) {
        clearInterval(recognitionTimerRef.current)
        recognitionTimerRef.current = null
      }
    },
  }), [useContinuousRecognition])

  return (
    <div className="h-screen overflow-auto bg-background p-8">
      {/* 主题切换 */ }
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* 标题 */ }
        <div className="text-center">
          <p className="text-text2">
            支持提示词模板、输入历史、自动补全、快捷键等功能
          </p>
        </div>

        {/* 自定义 ASR 配置 */ }
        <div className="mb-4 space-y-3 rounded-lg border border-border bg-background2 p-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={ useCustomASR }
              onChange={ checked => setUseCustomASR(checked) }
              label="使用自定义 ASR（测试模式）"
              labelClassName="text-sm text-text"
            />
            { useCustomASR && (
              <span className="text-xs text-info">
                自定义 ASR 会模拟识别过程
              </span>
            ) }
          </div>

          { useCustomASR && (
            <div className="flex items-center gap-3 border-t border-border pt-3">
              <Checkbox
                checked={ useContinuousRecognition }
                onChange={ checked => setUseContinuousRecognition(checked) }
                label="使用连续识别（实时流式返回）"
                labelClassName="text-sm text-text"
              />
              { useContinuousRecognition && (
                <span className="text-xs text-info">
                  开启后实时显示识别结果，关闭后录音结束一次性返回
                </span>
              ) }
            </div>
          ) }
        </div>

        <ChatInput
          value={ value }
          onChange={ setValue }
          onSubmit={ handleSubmit }
          onTemplateSelect={ handleTemplateSelect }
          onHistorySelect={ handleHistorySelect }
          onFilesChange={ handleFilesChange }
          onFileRemove={ handleFileRemove }
          loading={ loading }
          uploadedFiles={ uploadedFiles }
          customTemplates={ customTemplates }
          className="h-34"
          enablePromptTemplates
          enableHistory
          enableAutoComplete
          enableVoiceRecorder
          enableUploader
          voiceModes={ ['audio', 'text'] }
          asrConfig={ useCustomASR
            ? { callbacks: customASRCallbacks }
            : undefined }
          onVoiceSubmit={ handleVoiceSubmit }
        />

        {/* 功能特性 */ }
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
          <div className="border border-border rounded-lg bg-background2 p-4 shadow-2xs">
            <div className="mb-2 flex items-center gap-2">
              <Code size={ 20 } className="text-blue-500" />
              <h3 className="text-text font-semibold">提示词模板</h3>
            </div>
            <p className="text-sm text-text2">
              预设和自定义模板，快速生成常用提示词
            </p>
          </div>

          <div className="border border-border rounded-lg bg-background2 p-4 shadow-2xs">
            <div className="mb-2 flex items-center gap-2">
              <Bug size={ 20 } className="text-green-500" />
              <h3 className="text-text font-semibold">输入历史</h3>
            </div>
            <p className="text-sm text-text2">
              自动保存输入历史，支持搜索和快速重用
            </p>
          </div>

          <div className="border border-border rounded-lg bg-background2 p-4 shadow-2xs">
            <div className="mb-2 flex items-center gap-2">
              <FileText size={ 20 } className="text-purple-500" />
              <h3 className="text-text font-semibold">自动补全</h3>
            </div>
            <p className="text-sm text-text2">
              智能建议模板和历史记录，提高输入效率
            </p>
          </div>

          <div className="border border-border rounded-lg bg-background2 p-4 shadow-2xs">
            <div className="mb-2 flex items-center gap-2">
              <Zap size={ 20 } className="text-yellow-500" />
              <h3 className="text-text font-semibold">快捷键</h3>
            </div>
            <p className="text-sm text-text2">
              丰富的键盘快捷键，提升操作体验
            </p>
          </div>
        </div>

        {/* 聊天消息历史 */ }
        { messages.length > 0 && (
          <div className="max-h-64 overflow-y-auto border border-border rounded-lg bg-background2 p-4 shadow-2xs">
            <h3 className="mb-3 text-text font-semibold">对话历史</h3>
            <div className="space-y-2">
              { messages.map((message, index) => (
                <div
                  key={ `message-${index}-${message.slice(0, 10)}` }
                  className={ `p-2 rounded ${message.startsWith('用户:')
                    ? 'toning-blue text-text'
                    : 'bg-background2 text-text'
                  }` }
                >
                  { message }
                </div>
              )) }
            </div>
          </div>
        ) }

        {/* 主要组件演示 */ }
        <div className="border border-border rounded-lg bg-background2 p-6 shadow-2xs">
          <h3 className="mb-4 text-text font-semibold">
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
        <div className="border border-border rounded-lg bg-background2 p-6 shadow-2xs">
          <h3 className="mb-4 text-text font-semibold">
            快捷键说明
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text2">打开提示词模板</span>
                <kbd className="rounded-sm bg-background2 px-2 py-1 border border-border">{ formatShortcut('/') }</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text2">打开输入历史</span>
                <kbd className="rounded-sm bg-background2 px-2 py-1 border border-border">{ formatShortcut('H') }</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text2">发送消息</span>
                <kbd className="rounded-sm bg-background2 px-2 py-1 border border-border">{ formatShortcut('Enter') }</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text2">清空输入</span>
                <kbd className="rounded-sm bg-background2 px-2 py-1 border border-border">{ formatShortcut('K') }</kbd>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text2">上一个历史</span>
                <kbd className="rounded-sm bg-background2 px-2 py-1 border border-border">↑</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text2">下一个历史</span>
                <kbd className="rounded-sm bg-background2 px-2 py-1 border border-border">↓</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text2">选择当前项</span>
                <kbd className="rounded-sm bg-background2 px-2 py-1 border border-border">Enter</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text2">关闭面板</span>
                <kbd className="rounded-sm bg-background2 px-2 py-1 border border-border">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */ }
        <div className="border border-border rounded-lg bg-background2 p-6 shadow-2xs">
          <h3 className="mb-4 text-text font-semibold">
            使用说明
          </h3>

          <div className="prose dark:prose-invert max-w-none">
            <ol className="text-sm text-text2 space-y-2">
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
