import type { IFilterXSSOptions } from 'xss'
import xss from 'xss'

/**
 * Satteri Markdown renderer 示例封装
 *
 * 当前文件仅作为高性能 Markdown / MDX 渲染页面的参考实现，不从 `utils`
 * 的 `index.ts` 导出，也不要在默认 `package.json` 中安装相关依赖，避免普通页面
 * 被 WASM 包体积拖累
 *
 * 需要真实接入时，先在使用方所在 package 安装：
 *
 * ```bash
 * pnpm add satteri @bruits/satteri-wasm32-wasi
 * ```
 *
 * 浏览器运行时会额外引入 WASM 资源；更推荐用于服务端、构建期，或明确需要
 * MDAST / HAST / MDX plugin pipeline 的高性能渲染页面
 */
export async function satteriMdToHTML(content: string, options: SatteriMdToHTMLOptions = {}) {
  const {
    skipXSS = false,
    preserveSoftLineBreaks = true,
  } = options
  const source = preserveSoftLineBreaks
    ? preserveSoftBreaks(content)
    : content
  const { markdownToHtml } = await loadSatteri()
  const { html } = markdownToHtml(source, {
    features: {
      gfm: true,
    },
  })
  const enhancedHtml = enhanceExternalLinks(html)

  return skipXSS
    ? enhancedHtml
    : xss(enhancedHtml, sanitizeOptions)
}

const dynamicImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<SatteriModule>

async function loadSatteri() {
  return dynamicImport('satteri')
}

function enhanceExternalLinks(html: string): string {
  return html.replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" ',
  )
}

function preserveSoftBreaks(content: string): string {
  const lines = content.split('\n')
  let inFence = false

  return lines.map((line, index) => {
    if (/^\s*(```|~~~)/.test(line))
      inFence = !inFence

    if (
      inFence
      || !line
      || index === lines.length - 1
      || !lines[index + 1]
      || line.endsWith('  ')
      || line.endsWith('\\')
    ) {
      return line
    }

    return `${line}  `
  }).join('\n')
}

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

type SatteriModule = {
  markdownToHtml: (
    source: string,
    options?: {
      features?: {
        gfm?: boolean
      }
    },
  ) => {
    html: string
  }
}

export type SatteriMdToHTMLOptions = {
  /**
   * 是否跳过 xss 过滤
   * @default false
   */
  skipXSS?: boolean
  /**
   * 是否模拟 `marked` 的 `breaks: true`，将段落内软换行渲染为 `<br>`
   * @default true
   */
  preserveSoftLineBreaks?: boolean
}
