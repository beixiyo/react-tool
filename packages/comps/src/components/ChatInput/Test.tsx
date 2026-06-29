'use client'

import type {
  ASRConfig,
  AutoCompleteSuggestion,
  ChatInputAutocompleteAdapter,
  ChatInputHistoryAdapter,
  ChatInputPromptTemplatesAdapter,
  ChatInputShortcuts,
  ChatSubmitPayload,
  InputHistory,
  PromptTemplate,
  TextInsertController,
  VoiceRecordingResult,
} from './types'
import { useLatestCallback } from 'hooks'
import { Code, FileText, History, Search, Sparkles, Zap } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { Checkbox, ThemeToggle } from '..'
import { GithubSourceLink } from '../GithubSourceLink'
import { ChatInput } from './ChatInput'
import { formatChatInputShortcut } from './shortcuts'

const shortcuts: ChatInputShortcuts = {
  send: 'Enter',
  wrap: 'Shift+Enter',
  openPrompt: 'Mod+/',
  openHistory: 'Mod+H',
}

const mockASRSteps = [
  '这是',
  '这是 mock',
  '这是 mock ASR',
  '这是 mock ASR 流式',
  '这是 mock ASR 流式识别结果',
]

function Test() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', text: string, images?: string[] }>>([])
  const [histories, setHistories] = useState<InputHistory[]>(initialHistories)
  const [enablePromptTemplates, setEnablePromptTemplates] = useState(true)
  const [enableHistory, setEnableHistory] = useState(true)
  const [enableAutocomplete, setEnableAutocomplete] = useState(true)
  const [enableVoiceRecorder, setEnableVoiceRecorder] = useState(false)
  const [enableMockASR, setEnableMockASR] = useState(true)
  const [enableMockASRStream, setEnableMockASRStream] = useState(true)
  const mockASRTimerRef = useRef<number | null>(null)
  const mockASRProgressRef = useRef(0)
  const mockASRControllerRef = useRef<TextInsertController | null>(null)

  const clearMockASRTimer = useLatestCallback(() => {
    if (!mockASRTimerRef.current)
      return

    window.clearInterval(mockASRTimerRef.current)
    mockASRTimerRef.current = null
  })

  const promptTemplates = useMemo<PromptTemplate[]>(() => [
    {
      id: 'test-write-component',
      title: '创建 React 组件',
      content: '请帮我创建一个 React 组件，要求：\n\n- TypeScript\n- memo 优化\n- props 从 types.ts 引入',
      description: '生成组件骨架',
      category: 'code',
      icon: <Code size={ 16 } />,
      tags: ['React', 'TypeScript', '组件'],
      usageCount: 2,
    },
    {
      id: 'test-review-api',
      title: '审查 API 设计',
      content: '请从可组合性、受控能力、默认行为、扩展性审查这个 API：\n\n{api}',
      description: '用于组件 API review',
      category: 'document',
      icon: <FileText size={ 16 } />,
      tags: ['API', 'Review'],
      usageCount: 1,
    },
  ], [])

  const promptAdapter = useMemo<ChatInputPromptTemplatesAdapter>(() => ({
    load: () => [],
    touch: id => console.log('[prompt.touch]', id),
  }), [])

  const historyAdapter = useMemo<ChatInputHistoryAdapter>(() => ({
    search: (query) => {
      const lowerQuery = query.trim().toLowerCase()
      if (!lowerQuery)
        return histories

      return histories.filter(item => item.content.toLowerCase().includes(lowerQuery))
    },
    save: (content) => {
      const nextHistory: InputHistory = {
        id: `history-${Date.now()}`,
        content,
        timestamp: Date.now(),
      }

      setHistories(prev => [
        nextHistory,
        ...prev.filter(item => item.content !== content),
      ].slice(0, 20))

      return nextHistory
    },
    remove: id => setHistories(prev => prev.filter(item => item.id !== id)),
    clear: () => setHistories([]),
  }), [histories])

  const autocompleteAdapter = useMemo<ChatInputAutocompleteAdapter>(() => ({
    search: (query, context) => {
      const lowerQuery = query.trim().toLowerCase()
      if (!lowerQuery)
        return []

      const templateSuggestions: AutoCompleteSuggestion[] = context.templates
        .filter(template => `${template.title} ${template.content}`.toLowerCase().includes(lowerQuery))
        .map(template => ({
          text: template.title,
          type: 'template',
          source: template,
          score: 90,
        }))

      const historySuggestions: AutoCompleteSuggestion[] = context.histories
        .filter(history => history.content.toLowerCase().includes(lowerQuery))
        .map(history => ({
          text: history.content.length > 50
            ? `${history.content.slice(0, 50)}...`
            : history.content,
          type: 'history',
          source: history,
          score: 70,
        }))

      return [...templateSuggestions, ...historySuggestions].slice(0, 8)
    },
  }), [])

  const mockASRConfig = useMemo<ASRConfig | undefined>(() => {
    if (!enableMockASR)
      return undefined

    return {
      callbacks: {
        onStartRecord: async (controller: TextInsertController) => {
          clearMockASRTimer()
          mockASRProgressRef.current = 0
          mockASRControllerRef.current = controller

          console.log('[mock-asr.start]', {
            currentText: controller.currentText,
            textBeforeRecord: controller.textBeforeRecord,
            stream: enableMockASRStream,
          })

          if (!enableMockASRStream)
            return

          controller.insertText(mockASRSteps[0], true)

          mockASRTimerRef.current = window.setInterval(() => {
            mockASRProgressRef.current += 1
            const nextText = mockASRSteps[mockASRProgressRef.current]

            if (!nextText) {
              clearMockASRTimer()
              return
            }

            mockASRControllerRef.current?.insertText(nextText, true)
            console.log('[mock-asr.stream]', nextText)
          }, 350)
        },

        onEndRecord: async (audioData: VoiceRecordingResult, controller: TextInsertController) => {
          clearMockASRTimer()
          mockASRControllerRef.current = null

          console.log('[mock-asr.end]', {
            audioSize: audioData.audioBlob.size,
            chunks: audioData.chunks.length,
          })

          if (enableMockASRStream) {
            controller.insertText(mockASRSteps.at(-1) ?? '', true)
            return
          }

          await new Promise(resolve => window.setTimeout(resolve, 500))
          controller.appendText(mockASRSteps.at(-1) ?? '')
        },

        onTranscriptUpdate: (text: string, controller: TextInsertController) => {
          if (enableMockASRStream)
            controller.insertText(text, true)
        },

        onError: (error: Error) => {
          clearMockASRTimer()
          mockASRControllerRef.current = null
          console.error('[mock-asr.error]', error)
        },
      },
    }
  }, [clearMockASRTimer, enableMockASR, enableMockASRStream])

  const features = useMemo(() => ({
    promptTemplates: {
      enabled: enablePromptTemplates,
      templates: promptTemplates,
      includeDefaults: true,
      adapter: promptAdapter,
    },
    history: {
      enabled: enableHistory,
      items: histories,
      adapter: historyAdapter,
      maxCount: 20,
    },
    autocomplete: {
      enabled: enableAutocomplete,
      adapter: autocompleteAdapter,
    },
  }), [
    autocompleteAdapter,
    enableAutocomplete,
    enableHistory,
    enablePromptTemplates,
    histories,
    historyAdapter,
    promptAdapter,
    promptTemplates,
  ])

  const handleSubmit = useLatestCallback((data: ChatSubmitPayload) => {
    const text = data.text?.trim() ?? ''
    const images = data.images ?? []

    if (!text && images.length === 0)
      return

    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', text, images }])
    setUploadedFiles([])

    window.setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `已收到：${text || `${images.length} 张图片`}`,
      }])
      setLoading(false)
    }, 600)
  })

  const handleFilesChange = useLatestCallback((files: string[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  })

  const handleFileRemove = useLatestCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  })

  return (
    <div className="min-h-screen overflow-auto bg-background p-6">
      <main className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl text-text font-semibold">ChatInput 新 API 测试</h1>
            <p className="text-sm text-text2">
              当前测试页使用外部受控 history / autocomplete / prompt adapter，不依赖组件内部存储。
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <GithubSourceLink className="static" />
          </div>
        </section>

        <section className="grid gap-3 rounded-lg border border-border bg-background2 p-4 md:grid-cols-3 lg:grid-cols-6">
          <Checkbox
            checked={ enablePromptTemplates }
            onChange={ setEnablePromptTemplates }
            label="Prompt"
            labelClassName="text-sm text-text"
          />
          <Checkbox
            checked={ enableHistory }
            onChange={ setEnableHistory }
            label="History"
            labelClassName="text-sm text-text"
          />
          <Checkbox
            checked={ enableAutocomplete }
            onChange={ setEnableAutocomplete }
            label="Autocomplete"
            labelClassName="text-sm text-text"
          />
          <Checkbox
            checked={ enableVoiceRecorder }
            onChange={ setEnableVoiceRecorder }
            label="Voice"
            labelClassName="text-sm text-text"
          />
          <Checkbox
            checked={ enableMockASR }
            onChange={ setEnableMockASR }
            label="Mock ASR"
            labelClassName="text-sm text-text"
          />
          <Checkbox
            checked={ enableMockASRStream }
            onChange={ setEnableMockASRStream }
            label="Stream ASR"
            labelClassName="text-sm text-text"
          />
        </section>

        { enableVoiceRecorder && (
          <section className="rounded-lg border border-border bg-background2 p-4 text-sm text-text2">
            <div className="mb-2 text-text font-medium">Mock ASR 测试方式</div>
            <div className="space-y-1">
              <div>1. 打开 Voice 和 Mock ASR。</div>
              <div>2. 在输入框左侧语音按钮里切到 Text 模式。</div>
              <div>3. 开始录音后说什么都无所谓，Mock ASR 会自动把识别文本写回输入框。</div>
              <div>4. Stream ASR 开启时会边录边更新；关闭时会在停止录音后一次性写入。</div>
            </div>
          </section>
        ) }

        <section className="rounded-lg border border-border bg-background2 p-4">
          <div className="mb-3 grid gap-2 text-xs text-text2 md:grid-cols-4">
            <ShortcutTip icon={ <Zap size={ 14 } /> } label="发送" value={ formatChatInputShortcut(['Enter']) } />
            <ShortcutTip icon={ <FileText size={ 14 } /> } label="换行" value={ formatChatInputShortcut(['Shift+Enter']) } />
            <ShortcutTip icon={ <Sparkles size={ 14 } /> } label="Prompt" value={ formatChatInputShortcut(['Mod+/']) } />
            <ShortcutTip icon={ <History size={ 14 } /> } label="History" value={ formatChatInputShortcut(['Mod+H']) } />
          </div>

          <ChatInput
            value={ value }
            onChange={ setValue }
            onSubmit={ handleSubmit }
            onFilesChange={ handleFilesChange }
            onFileRemove={ handleFileRemove }
            uploadedFiles={ uploadedFiles }
            loading={ loading }
            minRows={ 1 }
            maxRows={ 8 }
            shortcuts={ shortcuts }
            features={ features }
            enableUploader
            enableVoiceRecorder={ enableVoiceRecorder }
            voiceModes={ ['text', 'audio'] }
            asrConfig={ mockASRConfig }
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-border bg-background2 p-4">
            <h2 className="mb-3 text-sm text-text font-semibold">消息</h2>
            { messages.length === 0
              ? (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-text2">
                    发送一条消息后这里会展示结果
                  </div>
                )
              : (
                  <div className="max-h-80 space-y-3 overflow-auto">
                    { messages.map((message, index) => (
                      <div
                        key={ `${message.role}-${index}` }
                        className={ cn(
                          'rounded-lg border border-border px-3 py-2 text-sm',
                          message.role === 'user'
                            ? 'bg-infoBg/25 text-text'
                            : 'bg-background text-text2',
                        ) }
                      >
                        <div className="mb-1 text-xs text-text2">
                          { message.role === 'user'
                            ? 'User'
                            : 'Assistant' }
                        </div>
                        { message.text && <div>{ message.text }</div> }
                        { message.images && message.images.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            { message.images.map((src, imageIndex) => (
                              <img
                                key={ `${index}-${imageIndex}` }
                                src={ src }
                                alt={ `uploaded-${imageIndex + 1}` }
                                className="size-14 rounded-md border border-border object-cover"
                              />
                            )) }
                          </div>
                        ) }
                      </div>
                    )) }
                  </div>
                ) }
          </div>

          <div className="rounded-lg border border-border bg-background2 p-4">
            <h2 className="mb-3 text-sm text-text font-semibold">外部数据</h2>
            <div className="space-y-4 text-xs text-text2">
              <DataBlock
                icon={ <Sparkles size={ 14 } /> }
                title="Prompt templates"
                items={ promptTemplates.map(item => item.title) }
              />
              <DataBlock
                icon={ <Search size={ 14 } /> }
                title="Histories"
                items={ histories.map(item => item.content) }
              />
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}

function ShortcutTip(props: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  const { icon, label, value } = props

  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-background px-2 py-1.5">
      <span className="flex items-center gap-1">
        { icon }
        { label }
      </span>
      <kbd className="rounded-sm bg-background2 px-1.5 py-0.5 text-text">{ value }</kbd>
    </div>
  )
}

function DataBlock(props: {
  icon: React.ReactNode
  title: string
  items: string[]
}) {
  const { icon, title, items } = props

  return (
    <div>
      <div className="mb-2 flex items-center gap-1 text-text">
        { icon }
        { title }
      </div>
      <div className="space-y-1">
        { items.map((item, index) => (
          <div key={ `${title}-${index}` } className="line-clamp-2 rounded-md bg-background px-2 py-1">
            { item }
          </div>
        )) }
      </div>
    </div>
  )
}

const initialHistories: InputHistory[] = [
  {
    id: 'history-1',
    content: '帮我审查 ChatInput 的快捷键 API 是否足够灵活',
    timestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'history-2',
    content: '写一个支持外部存储 adapter 的输入历史功能',
    timestamp: Date.now() - 1000 * 60 * 30,
  },
]

export default Test
