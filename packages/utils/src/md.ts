import { marked } from 'marked'
import xss from 'xss'

export async function mdToHTML(content: string, options: MdToHTMLOptsions = {}) {
  const { skipXSS = false } = options
  const renderer = new marked.Renderer()
  const linkRenderer = renderer.link.bind(renderer)

  renderer.link = (data): string => {
    const html = linkRenderer(data)
    return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ')
  }
  /**
   * 将字符串中的转义换行与制表符还原为真实字符，
   * 例如 "\n" -> 换行，避免被当成普通文本渲染进标题等。
   */
  const normalizedContent = content
    .replace(/\\r\\n/g, '\n') // 转义的 CRLF -> LF
    .replace(/\\n/g, '\n') // 转义的 \n -> 实际换行
    .replace(/\\t/g, '\t') // 转义的 \t -> 实际制表符
    .replace(/\r/g, '') // 裸 CR 去除

  const html = await marked(normalizedContent, {
    renderer,
    gfm: true,
    breaks: true, // render single \n as <br>
  })

  return skipXSS
    ? html
    : xss(html)
}

type MdToHTMLOptsions = {
  /**
   * 是否跳过 xss 过滤
   * @default false
   */
  skipXSS?: boolean
}
