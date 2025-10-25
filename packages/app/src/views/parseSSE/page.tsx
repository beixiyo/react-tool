import { downloadByData, parseMDCode, copyToClipboard } from '@jl-org/tool'
import { Button, MdToHtml, Tabs, Textarea } from 'comps'
import { useCallback, useMemo, useState } from 'react'
import { normalizeEOL } from 'utils'
import { Copy, Download } from 'lucide-react'
import { useParseSSE } from './useParseSSE'

/** 预设表达式配置 */
const presetExpressions = [
  {
    label: '内容',
    expr: 'data.choices[0].delta.content',
  },
  {
    label: '思考',
    expr: 'data.choices[0].delta.reasoning_content',
  },
  {
    label: 'Gemini',
    expr: 'data.candidates[0].content.parts[0].text',
  },
]

export default function Page() {
  const [rawInput, setRawInput] = useState('')
  const [showJson, setShowJson] = useState(false)
  const [expr, setExpr] = useState('data.choices[0].delta.content')
  const [extracted, setExtracted] = useState('')

  const [markdownInput, setMarkdownInput] = useState('')
  const parseMarkdown = useMemo(
    () => {
      const finalTxt = normalizeEOL(markdownInput)
      if (markdownInput.startsWith('```')) {
        const res = parseMDCode(finalTxt, { codeType: 'markdown' })
        return res[0] || markdownInput
      }

      return markdownInput
    },
    [markdownInput],
  )
  const [activeTab, setActiveTab] = useState<'sse' | 'markdown'>('markdown')
  const { parse, allJson } = useParseSSE()

  const handleParse = useCallback(() => {
    parse(rawInput)
    setExtracted('')
  }, [parse, rawInput])

  const handleExtract = useCallback(() => {
    try {
      const fn = new Function('data', `return ${expr}`) as (data: any) => any
      const parts = allJson.map((d) => {
        const v = fn(d)
        return typeof v === 'string' || typeof v === 'number'
          ? String(v)
          : ''
      })
      setExtracted(parts.join(''))
    }
    catch (e) {
      setExtracted('')
    }
  }, [allJson, expr])

  /** 选择预设表达式并立即提取 */
  const applyPreset = useCallback((preset: string) => {
    setExpr(preset)
    /** 使用微任务确保 state 更新后再执行 */
    queueMicrotask(() => {
      try {
        const fn = new Function('data', `return ${preset}`) as (data: any) => any
        const parts = allJson.map((d) => {
          const v = fn(d)
          return typeof v === 'string' || typeof v === 'number'
            ? String(v)
            : ''
        })
        setExtracted(parts.join(''))
      }
      catch (e) {
        setExtracted('')
      }
    })
  }, [allJson])

  const handleDownloadJson = useCallback(() => {
    const jsonStr = JSON.stringify(allJson, null, 2)
    downloadByData('sse.json', jsonStr)
  }, [allJson])

  const handleDownloadExtract = useCallback(() => {
    downloadByData('extracted.md', extracted)
  }, [extracted])

  const handleCopyJson = useCallback(() => {
    const jsonStr = JSON.stringify(allJson, null, 2)
    copyToClipboard(jsonStr)
  }, [allJson])

  const handleCopyExtract = useCallback(() => {
    copyToClipboard(extracted)
  }, [extracted])

  const handleCopyMarkdown = useCallback(() => {
    copyToClipboard(markdownInput)
  }, [markdownInput])

  const tabItems = [
    {
      value: 'sse' as const,
      label: 'SSE 解析',
      children: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-textSecondary">粘贴原始响应字符串</label>
            <Textarea
              placeholder="粘贴包含 SSE 或 JSON 的原始文本"
              value={ rawInput }
              onChange={ setRawInput }
            />
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={ handleParse }
              >
                解析
              </Button>
              <Button
                onClick={ handleExtract }
                disabled={ allJson.length === 0 || !expr }
              >
                提取表达式
              </Button>
              <Button
                onClick={ () => setShowJson(v => !v) }
              >
                { showJson
                  ? '隐藏 JSON'
                  : '显示 JSON' }
              </Button>
              <Button
                onClick={ handleDownloadJson }
                disabled={ allJson.length === 0 }
              >
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
              <Button
                onClick={ handleCopyJson }
                disabled={ allJson.length === 0 }
              >
                <Copy className="w-4 h-4 mr-1" />
                JSON
              </Button>
              <Button
                onClick={ handleDownloadExtract }
                disabled={ !extracted }
              >
                <Download className="w-4 h-4 mr-1" />
                内容
              </Button>
              <Button
                onClick={ handleCopyExtract }
                disabled={ !extracted }
              >
                <Copy className="w-4 h-4 mr-1" />
                内容
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-textSecondary">表达式提取</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-md border border-border bg-backgroundSubtle p-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                value={ expr }
                onChange={ e => setExpr(e.target.value) }
                placeholder="例如 data.choices[0].delta.content"
              />
            </div>
            <div className="flex items-center gap-2">
              { presetExpressions.map((preset) => (
                <Button
                  key={ preset.expr }
                  size="sm"
                  rounded="full"
                  onClick={ () => applyPreset(preset.expr) }
                >
                  { preset.label }
                </Button>
              )) }
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="p-3 bg-backgroundSubtle text-xs text-textSecondary">Markdown 预览</div>
              <MdToHtml content={ extracted } className="max-h-[calc(100vh-400px)] p-4" />
            </div>
          </div>

          { showJson && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="p-3 bg-backgroundSubtle text-xs text-textSecondary">解析后的 JSON（两格缩进）</div>
                <pre className="p-4 max-h-96 overflow-auto text-sm bg-backgroundSubtle">
                  { JSON.stringify(allJson, null, 2) }
                </pre>
              </div>
            </div>
          ) }
        </div>
      ),
    },
    {
      value: 'markdown' as const,
      label: 'Markdown 解析',
      children: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-textSecondary">粘贴 Markdown 文本</label>
            <Textarea
              placeholder="粘贴 Markdown 格式的文本"
              value={ markdownInput }
              onChange={ setMarkdownInput }
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={ () => downloadByData('markdown.md', markdownInput) }
                disabled={ !markdownInput }
              >
                <Download className="w-4 h-4 mr-1" />
                Markdown
              </Button>
              <Button
                onClick={ handleCopyMarkdown }
                disabled={ !markdownInput }
              >
                <Copy className="w-4 h-4 mr-1" />
                Markdown
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="p-3 bg-backgroundSubtle text-xs text-textSecondary">Markdown 预览</div>
            <MdToHtml content={ parseMarkdown } className="max-h-[calc(100vh-400px)] p-4" />
          </div>
        </div>
      ),
    },
  ]

  return <div className="p-6 max-w-5xl mx-auto space-y-4">
    <h1 className="text-2xl font-semibold tracking-tight">解析工具</h1>

    <Tabs
      items={ tabItems }
      activeKey={ activeTab }
      onChange={ item => setActiveTab(item.value) }
      className="w-full"
    />
  </div>
}
