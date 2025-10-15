import { parseMDCode } from '@jl-org/tool'
import { Button, MdToHtml, Tabs, Textarea } from 'comps'
import { useCallback, useState } from 'react'
import { useParseSSE } from './useParseSSE'

export default function Page() {
  const [rawInput, setRawInput] = useState('')
  const [showJson, setShowJson] = useState(false)
  const [expr, setExpr] = useState('data.choices[0].delta.content')
  const [extracted, setExtracted] = useState('')

  const [markdownInput, setMarkdownInput] = useState('')
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

  const download = useCallback((filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleDownloadJson = useCallback(() => {
    const jsonStr = JSON.stringify(allJson, null, 2)
    download('sse.json', jsonStr, 'application/json;charset=utf-8')
  }, [allJson, download])

  const handleDownloadExtract = useCallback(() => {
    download('extracted.md', extracted, 'text/markdown;charset=utf-8')
  }, [download, extracted])

  const tabItems = [
    {
      value: 'sse' as const,
      label: 'SSE 解析',
      children: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-neutral-600 dark:text-neutral-300">粘贴原始响应字符串</label>
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
                designStyle="outlined"
                onClick={ handleExtract }
                disabled={ allJson.length === 0 || !expr }
              >
                提取表达式
              </Button>
              <Button
                designStyle="outlined"
                onClick={ () => setShowJson(v => !v) }
              >
                { showJson
                  ? '隐藏 JSON'
                  : '显示 JSON' }
              </Button>
              <Button
                designStyle="outlined"
                onClick={ handleDownloadJson }
                disabled={ allJson.length === 0 }
              >
                下载 JSON
              </Button>
              <Button
                designStyle="outlined"
                onClick={ handleDownloadExtract }
                disabled={ !extracted }
              >
                下载提取内容
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-600 dark:text-neutral-300">表达式提取</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 outline-none focus:ring-2 focus:ring-blue-500/50"
                value={ expr }
                onChange={ e => setExpr(e.target.value) }
                placeholder="例如 data.choices[0].delta.content"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                designStyle="outlined"
                size="sm"
                rounded="full"
                onClick={ () => applyPreset('data.choices[0].delta.content') }
              >
                内容
              </Button>
              <Button
                designStyle="outlined"
                size="sm"
                rounded="full"
                onClick={ () => applyPreset('data.choices[0].delta.reasoning_content') }
              >
                思考过程
              </Button>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 text-xs text-neutral-600 dark:text-neutral-300">Markdown 预览</div>
              <div className="p-4 max-h-80 overflow-auto bg-white dark:bg-neutral-900">
                <MdToHtml content={ extracted } />
              </div>
            </div>
          </div>

          { showJson && (
            <div className="space-y-2">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 text-xs text-neutral-600 dark:text-neutral-300">解析后的 JSON（两格缩进）</div>
                <pre className="p-4 max-h-96 overflow-auto text-sm bg-white dark:bg-neutral-900">
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
            <label className="text-sm text-neutral-600 dark:text-neutral-300">粘贴 Markdown 文本</label>
            <Textarea
              placeholder="粘贴 Markdown 格式的文本"
              value={ markdownInput }
              onChange={ (text) => {
                const finalTxt = text
                  .replace(/\\r\\n/g, '\n')
                  .replace(/\\n/g, '\n')

                const md = parseMDCode(finalTxt, { codeType: 'markdown' })
                setMarkdownInput(md[0] || '')
              } }
            />
            <div className="flex items-center gap-2">
              <Button
                designStyle="outlined"
                onClick={ () => download('markdown.md', markdownInput, 'text/markdown;charset=utf-8') }
                disabled={ !markdownInput }
              >
                下载 Markdown
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 text-xs text-neutral-600 dark:text-neutral-300">Markdown 预览</div>
            <div className="p-4 max-h-96 overflow-auto bg-white dark:bg-neutral-900">
              <MdToHtml content={ markdownInput } />
            </div>
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
