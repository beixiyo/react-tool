/* eslint-disable no-restricted-globals */
import type { CodeHighlightProps } from '@/components/CodeHighlight'
import { codeToHtml } from 'shiki'

/**
 * 接收主线程的消息并处理高亮
 */
self.onmessage = async (e: MessageEvent<ShikiWorkerMessage>) => {
  try {
    const { code, language, theme, showLineNumbers } = e.data

    /** 使用shiki进行语法高亮 */
    const html = await codeToHtml(code, {
      lang: language,
      theme,
      transformers: [
        {
          line(node, line) {
            /** 添加行号属性 */
            if (showLineNumbers) {
              node.properties['data-line'] = String(line + 1)
            }
          },
        },
      ],
    })

    /** 将结果返回给主线程 */
    self.postMessage({ html, success: true })
  }
  catch (error) {
    console.error('Syntax highlighting error in worker:', error)

    /** 发生错误时，返回未高亮的代码作为降级处理 */
    const escapedCode = escapeHtml(e.data.code)
    self.postMessage({
      html: `<pre><code>${escapedCode}</code></pre>`,
      success: false,
      error: error instanceof Error
        ? error.message
        : String(error),
    })
  }
}

/**
 * HTML转义函数
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Shiki高亮Worker的消息类型
 */
type ShikiWorkerMessage = Required<Pick<CodeHighlightProps, 'code' | 'language' | 'theme' | 'showLineNumbers'>>
