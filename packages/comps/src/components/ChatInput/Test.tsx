'use client'

import { useLatestCallback } from 'hooks'
import { AudioLines, Code, FileText, History, Mic2, Radio, Search, Sparkles, Waves, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from 'utils'
import { Button, Card, Switch, ThemeToggle } from '..'
import { GithubSourceLink } from '../GithubSourceLink'
import { createMediaRecorderASRCapture } from './adapters'
import type { MediaRecorderASRCaptureStatus, MediaRecorderASRRecording } from './adapters'
import { ChatInput } from './ChatInput'
import { formatChatInputShortcut } from './shortcuts'
import type {
  ASRConfig,
  AutoCompleteSuggestion,
  BottomBarRenderContext,
  ChatInputAutocompleteAdapter,
  ChatInputHistoryAdapter,
  ChatInputPromptTemplatesAdapter,
  ChatInputShortcuts,
  ChatSubmitPayload,
  InputHistory,
  PromptTemplate,
  TextInsertController,
  VoiceControlRenderContext,
  VoiceControlStatus,
  VoiceRecordingResult,
} from './types'
import { VoiceGlowPreview } from './VoiceGlowPreview'

const shortcuts: ChatInputShortcuts = {
  send: 'Enter',
  wrap: 'Shift+Enter',
  openPrompt: 'Mod+/',
  openHistory: 'Mod+H',
}

const CHAT_INPUT_PREVIEW_WIDTH = 372
const MOCK_TRANSCRIPT_DELAY_MS = 650
const DEMO_VOICE_ERROR = '无法启动麦克风：当前设备权限已被系统策略拒绝，请前往系统设置检查麦克风权限后重新尝试'
const mockTranscriptSteps = ['这是', '这是模拟', '这是模拟流式', '这是模拟流式转写结果']

function Test() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [histories, setHistories] = useState<InputHistory[]>(initialHistories)
  const [enablePromptTemplates, setEnablePromptTemplates] = useState(true)
  const [enableHistory, setEnableHistory] = useState(true)
  const [enableAutocomplete, setEnableAutocomplete] = useState(true)
  const [enableMockStream, setEnableMockStream] = useState(true)
  const [customActionIcons, setCustomActionIcons] = useState(false)
  const [showVoiceError, setShowVoiceError] = useState(false)
  const [voiceDriver, setVoiceDriver] = useState<VoiceDriver>('audio')
  const [voiceStatus, setVoiceStatus] = useState<VoiceControlStatus>('idle')
  const [externalStatus, setExternalStatus] = useState<MediaRecorderASRCaptureStatus>('idle')
  const [recordingPreview, setRecordingPreview] = useState<RecordingPreview | null>(null)
  const [voiceError, setVoiceError] = useState('')
  const mockTimerRef = useRef<number | null>(null)
  const mockProgressRef = useRef(0)
  const previewUrlRef = useRef('')

  const clearMockTimer = useLatestCallback(() => {
    if (mockTimerRef.current === null) return

    window.clearInterval(mockTimerRef.current)
    mockTimerRef.current = null
  })

  const updateRecordingPreview = useLatestCallback(
    (recording: VoiceRecordingResult, source: RecordingPreview['source'], metadata?: Pick<MediaRecorderASRRecording, 'durationMs' | 'mimeType'>) => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }

      const previewBlob = new Blob([recording.audioBlob], {
        type: metadata?.mimeType || recording.audioBlob.type,
      })
      const previewUrl = URL.createObjectURL(previewBlob)
      previewUrlRef.current = previewUrl
      setRecordingPreview({
        url: previewUrl,
        size: previewBlob.size,
        mimeType: previewBlob.type || 'unknown',
        durationMs: metadata?.durationMs,
        source,
      })
    },
  )

  const handleVoiceError = useLatestCallback((error: Error) => {
    clearMockTimer()
    setVoiceError(error.message)
  })

  const externalCapture = useMemo(
    () =>
      createMediaRecorderASRCapture({
        onStatusChange: setExternalStatus,
        onError: handleVoiceError,
        onRecordingReady: (recording) => updateRecordingPreview(recording, '外部 capture：真实 MediaRecorder', recording),
        transcribe: async (_recording, { signal }) => {
          await waitForDelay(MOCK_TRANSCRIPT_DELAY_MS, signal)
          return '外部 capture 已录到真实音频；这段文本由演示页模拟生成'
        },
      }),
    [handleVoiceError, updateRecordingPreview],
  )

  useEffect(() => {
    return () => {
      clearMockTimer()
      void externalCapture.destroy?.()
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [clearMockTimer, externalCapture])

  const callbackASRConfig = useMemo<ASRConfig>(
    () => ({
      callbacks: {
        onStartRecord: (controller: TextInsertController) => {
          setVoiceError('')
          clearMockTimer()
          mockProgressRef.current = 0

          if (!enableMockStream) return

          controller.insertText(mockTranscriptSteps[0], true)
          mockTimerRef.current = window.setInterval(() => {
            mockProgressRef.current += 1
            const nextText = mockTranscriptSteps[mockProgressRef.current]
            if (!nextText) {
              clearMockTimer()
              return
            }
            controller.insertText(nextText, true)
          }, 380)
        },
        onEndRecord: async (audioData, controller) => {
          clearMockTimer()
          updateRecordingPreview(audioData, 'Callback：内建真实 MediaRecorder')
          await waitForDelay(MOCK_TRANSCRIPT_DELAY_MS)

          if (enableMockStream) {
            controller.insertText(mockTranscriptSteps.at(-1) ?? '', true)
          }
          else {
            controller.appendText('Callback 已录到真实音频；这段文本由演示页模拟生成')
          }
        },
        onError: handleVoiceError,
      },
    }),
    [clearMockTimer, enableMockStream, handleVoiceError, updateRecordingPreview],
  )

  const asrConfig = useMemo<ASRConfig | undefined>(() => {
    if (voiceDriver === 'callback') return callbackASRConfig
    if (voiceDriver === 'external') {
      return {
        capture: externalCapture,
        callbacks: { onError: handleVoiceError },
      }
    }
    return undefined
  }, [callbackASRConfig, externalCapture, handleVoiceError, voiceDriver])

  const promptTemplates = useMemo<PromptTemplate[]>(
    () => [
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
    ],
    [],
  )

  const promptAdapter = useMemo<ChatInputPromptTemplatesAdapter>(
    () => ({
      load: () => [],
      touch: () => {},
    }),
    [],
  )

  const historyAdapter = useMemo<ChatInputHistoryAdapter>(
    () => ({
      search: (query) => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return histories
        return histories.filter((item) => item.content.toLowerCase().includes(normalizedQuery))
      },
      save: (content) => {
        const nextHistory = {
          id: `history-${Date.now()}`,
          content,
          timestamp: Date.now(),
        }
        setHistories((previous) => [nextHistory, ...previous.filter((item) => item.content !== content)].slice(0, 20))
        return nextHistory
      },
      remove: (id) => setHistories((previous) => previous.filter((item) => item.id !== id)),
      clear: () => setHistories([]),
    }),
    [histories],
  )

  const autocompleteAdapter = useMemo<ChatInputAutocompleteAdapter>(
    () => ({
      search: (query, context) => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return []

        const templateSuggestions: AutoCompleteSuggestion[] = context.templates
          .filter((template) => `${template.title} ${template.content}`.toLowerCase().includes(normalizedQuery))
          .map((template) => ({
            text: template.title,
            type: 'template',
            source: template,
            score: 90,
          }))
        const historySuggestions: AutoCompleteSuggestion[] = context.histories
          .filter((history) => history.content.toLowerCase().includes(normalizedQuery))
          .map((history) => ({
            text: history.content.length > 50
              ? `${history.content.slice(0, 50)}...`
              : history.content,
            type: 'history',
            source: history,
            score: 70,
          }))

        return [...templateSuggestions, ...historySuggestions].slice(0, 8)
      },
    }),
    [],
  )

  const features = useMemo(
    () => ({
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
    }),
    [autocompleteAdapter, enableAutocomplete, enableHistory, enablePromptTemplates, histories, historyAdapter, promptAdapter, promptTemplates],
  )

  const handleDriverChange = useLatestCallback((nextDriver: VoiceDriver) => {
    if (voiceStatus !== 'idle' || externalStatus !== 'idle') return

    clearMockTimer()
    if (voiceDriver === 'external') {
      void externalCapture.destroy?.()
    }
    setVoiceDriver(nextDriver)
    setValue('')
    setVoiceError('')
  })

  const handleSubmit = useLatestCallback((data: ChatSubmitPayload) => {
    const text = data.text?.trim() ?? ''
    const images = data.images ?? []
    if (!text && images.length === 0) return

    setLoading(true)
    setMessages((previous) => [...previous, { role: 'user', text, images }])
    setUploadedFiles([])
    window.setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          text: `已收到：${text || `${images.length} 张图片`}`,
        },
      ])
      setLoading(false)
    }, 600)
  })

  const handleFilesChange = useLatestCallback((files: string[]) => {
    setUploadedFiles((previous) => [...previous, ...files])
  })

  const handleFileRemove = useLatestCallback((index: number) => {
    setUploadedFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
  })

  const isVoiceBusy = voiceStatus !== 'idle' || externalStatus !== 'idle'
  const selectedDriver = voiceDriverDetails[voiceDriver]
  const renderVoiceControl = useMemo(
    () => (context: VoiceControlRenderContext) => {
      const { DefaultVoiceControl, props } = context
      return (
        <DefaultVoiceControl
          { ...props }
          errorMessage={ showVoiceError
            ? DEMO_VOICE_ERROR
            : props.errorMessage }
        />
      )
    },
    [showVoiceError],
  )
  const renderActions = useLatestCallback((context: BottomBarRenderContext) => {
    const {
      VoiceControl,
      HelperButton,
      PromptButton,
      HistoryButton,
      UploaderButton,
      SendButton,
    } = context

    return (
      <>
        <div className="flex items-center gap-1">
          <VoiceControl icon={ <Waves /> } />
          <HelperButton icon={ <Code /> } />
        </div>

        <div className="flex items-center gap-1">
          { enablePromptTemplates && <PromptButton icon={ <Zap /> } /> }
          { enableHistory && <HistoryButton icon={ <Search /> } /> }
          <UploaderButton icon={ <FileText /> } />
          <SendButton icon={ <Radio /> } />
        </div>
      </>
    )
  })

  return (
    <div className="min-h-screen overflow-auto bg-background p-4 sm:p-6">
      <main className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background2 px-3 py-1 text-xs text-text2">
              <Mic2 size={ 14 } />
              Browser microphone lab
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">ChatInput 录音与外部 ASR</h1>
            <p className="text-sm leading-6 text-text2">三种驱动单选。界面会明确区分真实录音、模拟转写与真实 WebSocket，避免把视觉演示误当成协议验证</p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <GithubSourceLink className="static" />
          </div>
        </header>

        <section aria-labelledby="driver-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="driver-title" className="text-base font-semibold text-text">
                选择语音数据路径
              </h2>
              <p className="mt-1 text-sm text-text2">录音或回放期间锁定切换，防止跨驱动串写状态。</p>
            </div>
            <StatusPill voiceStatus={ voiceStatus } externalStatus={ externalStatus } />
          </div>

          <div className="grid gap-3 lg:grid-cols-3" role="radiogroup" aria-label="语音数据路径">
            { voiceDriverOrder.map((driver) => {
              const item = voiceDriverDetails[driver]
              const selected = voiceDriver === driver
              return (
                <Button
                  key={ driver }
                  type="button"
                  role="radio"
                  aria-checked={ selected }
                  disabled={ isVoiceBusy }
                  variant="ghost"
                  onClick={ () => handleDriverChange(driver) }
                  className={ cn(
                    'h-auto min-h-36 items-start justify-start rounded-2xl border p-4 text-left whitespace-normal',
                    selected
                      ? 'border-brand bg-brand/10 text-text shadow-sm'
                      : 'border-border bg-background2 text-text hover:border-border2',
                  ) }
                >
                  <span className="flex w-full flex-col items-start gap-3">
                    <span className="flex w-full items-center justify-between gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-background text-brand">{ item.icon }</span>
                      <span
                        className={ cn(
                          'rounded-full px-2 py-1 text-[11px] font-medium',
                          selected
                            ? 'bg-brand text-white'
                            : 'bg-background text-text2',
                        ) }
                      >
                        { selected
                          ? '当前路径'
                          : item.badge }
                      </span>
                    </span>
                    <span>
                      <span className="block font-semibold text-text">{ item.title }</span>
                      <span className="mt-1 block text-xs leading-5 text-text2">{ item.summary }</span>
                    </span>
                  </span>
                </Button>
              )
            }) }
          </div>
        </section>

        <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card padding="lg" shadow="none" hoverEffect={ false } title="交互预览" titleTag="h2" className="min-w-0">
            <div className="mb-4 grid gap-2 text-xs text-text2 sm:grid-cols-2 xl:grid-cols-4">
              <ShortcutTip icon={ <Zap size={ 14 } /> } label="发送" value={ formatChatInputShortcut(['Enter']) } />
              <ShortcutTip icon={ <FileText size={ 14 } /> } label="换行" value={ formatChatInputShortcut(['Shift+Enter']) } />
              <ShortcutTip icon={ <Sparkles size={ 14 } /> } label="Prompt" value={ formatChatInputShortcut(['Mod+/']) } />
              <ShortcutTip icon={ <History size={ 14 } /> } label="History" value={ formatChatInputShortcut(['Mod+H']) } />
            </div>

            <div className="mx-auto w-full" style={ { maxWidth: CHAT_INPUT_PREVIEW_WIDTH } }>
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
                enableVoiceRecorder
                voiceModes={ voiceDriver === 'audio'
                  ? ['audio']
                  : ['text'] }
                asrConfig={ asrConfig }
                onVoiceStatusChange={ setVoiceStatus }
                onVoiceRecorderError={ handleVoiceError }
                renderVoiceControl={ renderVoiceControl }
                renderActions={ customActionIcons
                  ? renderActions
                  : undefined }
                onAudioDataChange={ (recording) => {
                  if (recording && voiceDriver === 'audio') {
                    updateRecordingPreview(recording, 'Audio：内建真实 MediaRecorder')
                  }
                } }
                renderVoicePanel={ voiceDriver === 'audio'
                  ? undefined
                  : (context) => <VoiceGlowPreview { ...context } /> }
              />
            </div>

            <div className="mt-5 rounded-xl border border-border bg-background2 p-3" aria-live="polite">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-brand">{ selectedDriver.icon }</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text">{ selectedDriver.path }</div>
                  <div className="mt-1 text-xs leading-5 text-text2">{ selectedDriver.truth }</div>
                  { voiceError && <div className="mt-2 text-xs text-danger">录音错误：{ voiceError }</div> }
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card padding="default" shadow="none" hoverEffect={ false } title="演示选项" titleTag="h2">
              <div className="space-y-4">
                <SwitchRow label="Prompt templates" description="外部模板 adapter" checked={ enablePromptTemplates } onChange={ setEnablePromptTemplates } />
                <SwitchRow label="History" description="外部历史 adapter" checked={ enableHistory } onChange={ setEnableHistory } />
                <SwitchRow label="Autocomplete" description="外部搜索 adapter" checked={ enableAutocomplete } onChange={ setEnableAutocomplete } />
                <SwitchRow
                  label="自定义底栏图标"
                  description="统一通过 icon 属性替换所有内置动作"
                  checked={ customActionIcons }
                  onChange={ setCustomActionIcons }
                />
                <SwitchRow
                  label="显示错误状态"
                  description="验证长文案省略与完整 Tooltip"
                  checked={ showVoiceError }
                  onChange={ setShowVoiceError }
                />
                <SwitchRow
                  label="模拟流式文本"
                  description="仅 Callback 模式可用"
                  checked={ enableMockStream }
                  disabled={ voiceDriver !== 'callback' || isVoiceBusy }
                  onChange={ setEnableMockStream }
                />
              </div>
            </Card>

            <Card padding="default" shadow="none" hoverEffect={ false } title="真实性矩阵" titleTag="h2">
              <TruthRow label="麦克风" value="真实浏览器输入" positive />
              <TruthRow label="录音编码" value="真实 MediaRecorder" positive />
              <TruthRow label="音量" value="真实 AnalyserNode" positive />
              <TruthRow
                label="转写文本"
                value={ voiceDriver === 'audio'
                  ? '不生成'
                  : '演示页模拟' }
              />
              <TruthRow label="WebSocket" value="未接入" />
              <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-text2">
                本页验证组件契约、浏览器录音与 UI；不能证明 PCM 协议或 AskFlowtica WebSocket 正常
              </p>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card padding="default" shadow="none" hoverEffect={ false } title="录音结果" titleTag="h2">
            { recordingPreview
              ? (
                <div className="space-y-3">
                  <audio
                    aria-label="录音回放"
                    className="w-full"
                    controls
                    src={ recordingPreview.url }
                  />
                  <div className="grid gap-2 text-xs text-text2 sm:grid-cols-2">
                    <Metric label="来源" value={ recordingPreview.source } />
                    <Metric label="格式" value={ recordingPreview.mimeType } />
                    <Metric label="大小" value={ formatBytes(recordingPreview.size) } />
                    <Metric
                      label="时长"
                      value={ recordingPreview.durationMs === undefined
                        ? '由内建面板管理'
                        : `${(recordingPreview.durationMs / 1000).toFixed(1)}s` }
                    />
                  </div>
                </div>
              )
              : (
                <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-border text-center text-sm text-text2">
                  完成一次录音后，可在这里回放真实浏览器音频
                </div>
              ) }
          </Card>

          <Card padding="default" shadow="none" hoverEffect={ false } title="外部数据" titleTag="h2">
            <div className="space-y-4 text-xs text-text2">
              <DataBlock icon={ <Sparkles size={ 14 } /> } title="Prompt templates" items={ promptTemplates.map((item) => item.title) } />
              <DataBlock icon={ <Search size={ 14 } /> } title="Histories" items={ histories.map((item) => item.content) } />
            </div>
          </Card>
        </section>

        { messages.length > 0 && (
          <Card padding="default" shadow="none" hoverEffect={ false } title="提交记录" titleTag="h2">
            <div className="grid gap-3 sm:grid-cols-2">
              { messages.map((message, index) => (
                <div key={ `${message.role}-${index}` } className="rounded-xl border border-border bg-background2 px-3 py-2 text-sm text-text">
                  <div className="mb-1 text-xs text-text2">
                    { message.role === 'user'
                      ? 'User'
                      : 'Assistant' }
                  </div>
                  { message.text || `${message.images?.length ?? 0} 张图片` }
                </div>
              )) }
            </div>
          </Card>
        ) }
      </main>
    </div>
  )
}

function StatusPill(props: { voiceStatus: VoiceControlStatus; externalStatus: MediaRecorderASRCaptureStatus }) {
  const { voiceStatus, externalStatus } = props
  const status = externalStatus === 'idle'
    ? voiceStatus
    : externalStatus
  const active = status === 'recording' || status === 'starting'

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background2 px-3 py-1.5 text-xs text-text2" aria-live="polite">
      <span
        className={ cn(
          'size-2 rounded-full',
          active && 'animate-pulse bg-success',
          status === 'idle' && 'bg-text2/40',
          !active && status !== 'idle' && 'bg-info',
        ) }
      />
      Voice: { status }
    </div>
  )
}

function SwitchRow(props: { label: string; description: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  const { label, description, checked, disabled, onChange } = props
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-text">{ label }</div>
        <div className="mt-0.5 text-xs text-text2">{ description }</div>
      </div>
      <Switch checked={ checked } disabled={ disabled } onChange={ onChange } ariaLabel={ label } size="sm" />
    </div>
  )
}

function TruthRow(props: { label: string; value: string; positive?: boolean }) {
  const { label, value, positive } = props
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-2 text-xs last:border-b-0">
      <span className="text-text2">{ label }</span>
      <span
        className={ cn(
          'text-right font-medium',
          positive
            ? 'text-success'
            : 'text-text',
        ) }
      >
        { value }
      </span>
    </div>
  )
}

function ShortcutTip(props: { icon: ReactNode; label: string; value: string }) {
  const { icon, label, value } = props
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-background2 px-2 py-1.5">
      <span className="flex items-center gap-1">
        { icon }
        { label }
      </span>
      <kbd className="rounded-sm bg-background px-1.5 py-0.5 text-text">{ value }</kbd>
    </div>
  )
}

function DataBlock(props: { icon: ReactNode; title: string; items: string[] }) {
  const { icon, title, items } = props
  return (
    <div>
      <div className="mb-2 flex items-center gap-1 text-text">
        { icon }
        { title }
      </div>
      <div className="space-y-1">
        { items.map((item, index) => (
          <div key={ `${title}-${index}` } className="line-clamp-2 rounded-md bg-background2 px-2 py-1">
            { item }
          </div>
        )) }
      </div>
    </div>
  )
}

function Metric(props: { label: string; value: string }) {
  const { label, value } = props
  return (
    <div className="rounded-lg bg-background2 px-3 py-2">
      <div>{ label }</div>
      <div className="mt-1 font-medium break-all text-text">{ value }</div>
    </div>
  )
}

function waitForDelay(delayMs: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason)
      return
    }

    const handleAbort = () => {
      window.clearTimeout(timer)
      reject(signal?.reason)
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, delayMs)
    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  return `${(size / 1024).toFixed(1)} KB`
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

const voiceDriverOrder: VoiceDriver[] = ['audio', 'callback', 'external']
const voiceDriverDetails: Record<VoiceDriver, VoiceDriverDetails> = {
  audio: {
    title: 'Audio recording',
    badge: '录音交付',
    icon: <AudioLines size={ 18 } />,
    summary: '组件内建录音与默认回放面板，不生成识别文本。',
    path: '麦克风 → 内建 MediaRecorder → VoiceRecordingResult',
    truth: '音频和音量都是真实的；停止后进入默认 review 面板，可重录、提交或关闭。',
  },
  callback: {
    title: 'Callback mock ASR',
    badge: '内建采音',
    icon: <Waves size={ 18 } />,
    summary: '组件负责真实录音，宿主 callback 模拟转写文本。',
    path: '麦克风 → 内建 MediaRecorder → callback → TextInsertController',
    truth: '音频和音量都是真实的；文字来自定时器，不是根据音频识别，也没有 WebSocket。',
  },
  external: {
    title: 'External capture',
    badge: '外部接管',
    icon: <Radio size={ 18 } />,
    summary: '外部适配器接管真实录音、音量、生命周期和模拟转写。',
    path: 'capture.start → 真实 MediaRecorder → injected transcribe → TextInsertController',
    truth: '外部 capture 会读取真实麦克风；当前产物仍是浏览器编码音频，不是 PCM，转写与 WebSocket 均为模拟。',
  },
}

type VoiceDriver = 'audio' | 'callback' | 'external'

interface VoiceDriverDetails {
  title: string
  badge: string
  icon: ReactNode
  summary: string
  path: string
  truth: string
}

interface RecordingPreview {
  url: string
  size: number
  mimeType: string
  durationMs?: number
  source: string
}

interface Message {
  role: 'user' | 'assistant'
  text: string
  images?: string[]
}

export default Test
