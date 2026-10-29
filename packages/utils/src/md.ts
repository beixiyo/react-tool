/** Markdown → HTML：在解析层兼容 CJK 格式边界，并保留链接与 XSS 安全策略 */
import { Renderer } from 'marked'
import type { IFilterXSSOptions } from 'xss'
import xss from 'xss'
import { loadMarkdownParser } from './markdown'

const defaultWhiteList = (xss as typeof xss & {
  whiteList: NonNullable<IFilterXSSOptions['whiteList']>
}).whiteList
const sanitizeOptions: IFilterXSSOptions = {
  whiteList: {
    ...defaultWhiteList,
    a: [
      ...(defaultWhiteList.a ?? []),
      'target',
      'rel',
    ],
    /**
     * GFM 任务列表（`- [ ] xxx`）会被渲染成 `<input type="checkbox" disabled>`，
     * 不在白名单里就会被整段转义，用户看到的是字面量 `<input type="checkbox" disabled>`
     *
     * 只放行这三个展示属性，on* 事件属性依旧被过滤，不引入执行面
     */
    input: [
      'type',
      'checked',
      'disabled',
    ],
  },
}

/** 解析 Markdown，CJK 强调与删除线兼容不改写正文、不插入空格 */
export async function mdToHTML(content: string, options: MdToHTMLOptsions = {}) {
  const {
    skipXSS = false,
    postProcess = async (str: string) => str,
    preprocessMarkdownFormat: cjkFriendly = true,
  } = options

  /** 保留历史换行与制表符归一化；不再预处理强调标记 */
  const normalizedContent = content
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\r/g, '')

  // 名称沿用历史 API；回调仍接收解析前的 Markdown，而不是 HTML
  const finalContent = await postProcess(normalizedContent)
  const renderer = new Renderer()
  const linkRenderer = renderer.link.bind(renderer)

  renderer.link = (data): string => {
    const html = linkRenderer(data)
    return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ')
  }

  const parser = await loadMarkdownParser({ cjkFriendly })
  const html = await parser.parse(finalContent, {
    renderer,
    gfm: true,
    breaks: true,
  })

  return skipXSS
    ? html
    : xss(html, sanitizeOptions)
}

/** Markdown 转 HTML 的格式兼容、回调与安全选项 */
export type MdToHTMLOptsions = {
  /**
   * 是否跳过 XSS 过滤
   * @default false
   */
  skipXSS?: boolean
  /**
   * 解析前的 Markdown 转换回调；名称为历史 API，并非 HTML 后处理
   * @default 原样返回 Markdown
   */
  postProcess?: (markdown: string) => Promise<string> | string
  /**
   * 是否启用中日韩强调与删除线边界兼容；保留旧参数名，不再改写正文或插入空格
   * @default true
   */
  preprocessMarkdownFormat?: boolean
}
