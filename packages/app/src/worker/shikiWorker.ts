/* eslint-disable no-restricted-globals */
import type { CodeHighlightProps } from '@/components/CodeHighlight'
import type { WorkerRequest, WorkerResponse } from 'hooks'
import { codeToHtml } from 'shiki'

/**
 * 接收主线程的消息并处理高亮
 *
 * 按 useWorker 的 request 协议通信：收 `{ id, data }`，回 `{ id, data }`
 * 高亮失败不回传 error，而是回传转义后的纯文本 html 作为降级，并在结果中标记 success: false
 */
self.onmessage = async (e: MessageEvent<WorkerRequest<ShikiHighlightRequest>>) => {
  const { id, data } = e.data

  try {
    const { code, language, theme, showLineNumbers } = data

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
    reply({ id, data: { html, success: true } })
  }
  catch (error) {
    console.error('Syntax highlighting error in worker:', error)

    /** 发生错误时，返回未高亮的代码作为降级处理 */
    reply({
      id,
      data: {
        html: `<pre><code>${escapeHtml(data.code)}</code></pre>`,
        success: false,
        error: error instanceof Error
          ? error.message
          : String(error),
      },
    })
  }
}

function reply(response: WorkerResponse<ShikiHighlightResult>) {
  self.postMessage(response)
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

/** 高亮请求参数 */
export type ShikiHighlightRequest = Required<Pick<CodeHighlightProps, 'code' | 'language' | 'theme' | 'showLineNumbers'>>

/** 高亮结果 */
export type ShikiHighlightResult = {
  html: string
  success: boolean
  error?: string
}
