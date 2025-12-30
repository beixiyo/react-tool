import { marked } from 'marked'
import xss from 'xss'

const SPACE = ' '

export async function mdToHTML(content: string, options: MdToHTMLOptsions = {}) {
  const {
    skipXSS = false,
    postProcess = async (str: string) => str,
    preprocessMarkdownFormat: enablePreprocess = true,
  } = options
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

  // 预处理粘连的格式符号，使 marked 能正确解析
  const preprocessedContent = enablePreprocess
    ? preprocessMarkdownFormat(normalizedContent)
    : normalizedContent
  const finalContent = await postProcess(preprocessedContent)

  const html = await marked(finalContent, {
    renderer,
    gfm: true,
    breaks: true, // render single \n as <br>
  })

  return skipXSS
    ? html
    : xss(html)
}

/**
 * 预处理 Markdown 格式符号，解决粘连格式解析问题
 *
 * 问题：marked 遵循 CommonMark 规范，要求格式符号两侧有空格或标点
 * 解决：在粘连的格式符号两侧插入空格（SPACE）
 *
 * 支持格式：
 * - `**加粗**` → `<strong>`
 * - `*斜体*` → `<em>`
 * - `***加粗斜体***` → `<em><strong>`
 * - `~~删除线~~` → `<del>`
 *
 * @example
 * preprocessMarkdownFormat('文字**加粗**文字')
 * // => '文字\u200B**加粗**\u200B文字'
 */
function preprocessMarkdownFormat(content: string): string {
  if (!content)
    return content

  // 中文标点字符集（使用 Unicode 转义避免引号解析问题）
  // " = \u201c, " = \u201d, ' = \u2018, ' = \u2019
  const CJK_PUNCT = '，。！？、：；\u201C\u201D\u2018\u2019（）【】《》'

  // 匹配需要处理的格式符号模式
  // 处理顺序很重要：先处理 *** 和 ~~，再处理 ** 和 *
  // 关键：** 和 * 的边界字符必须排除 *，避免干扰 *** 的处理结果
  const patterns: Array<{ regex: RegExp, replacement: string }> = [
    // ===== ***加粗斜体*** - 三个星号 =====
    // 两侧都粘连
    {
      regex: /([^\s*])\*\*\*(?!\s)([^*]+?)(?<!\s)\*\*\*([^\s*])/g,
      replacement: `$1${SPACE}***$2***${SPACE}$3`,
    },
    // 左侧粘连
    {
      regex: new RegExp(`([^\\s*])\\*\\*\\*(?!\\s)([^*]+?)(?<!\\s)\\*\\*\\*(?=\\s|$|[${CJK_PUNCT}])`, 'g'),
      replacement: `$1${SPACE}***$2***`,
    },
    // 右侧粘连
    {
      regex: new RegExp(`(?<=^|\\s|[${CJK_PUNCT}])\\*\\*\\*(?!\\s)([^*]+?)(?<!\\s)\\*\\*\\*([^\\s*])`, 'g'),
      replacement: `***$1***${SPACE}$2`,
    },

    // ===== ~~删除线~~ - 两个波浪线 =====
    // 两侧都粘连
    {
      regex: /([^\s~])~~(?!\s)([^~]+?)(?<!\s)~~([^\s~])/g,
      replacement: `$1${SPACE}~~$2~~${SPACE}$3`,
    },
    // 左侧粘连
    {
      regex: new RegExp(`([^\\s~])~~(?!\\s)([^~]+?)(?<!\\s)~~(?=\\s|$|[${CJK_PUNCT}])`, 'g'),
      replacement: `$1${SPACE}~~$2~~`,
    },
    // 右侧粘连
    {
      regex: new RegExp(`(?<=^|\\s|[${CJK_PUNCT}])~~(?!\\s)([^~]+?)(?<!\\s)~~([^\\s~])`, 'g'),
      replacement: `~~$1~~${SPACE}$2`,
    },

    // ===== **加粗** - 两个星号 =====
    // 边界字符必须排除 *，避免匹配 *** 内部的 **
    // 两侧都粘连
    {
      regex: /([^\s*])\*\*(?!\*)(?!\s)([^*]+?)(?<!\s)\*\*(?!\*)([^\s*])/g,
      replacement: `$1${SPACE}**$2**${SPACE}$3`,
    },
    // 左侧粘连
    {
      regex: new RegExp(`([^\\s*])\\*\\*(?!\\*)(?!\\s)([^*]+?)(?<!\\s)\\*\\*(?!\\*)(?=\\s|$|[${CJK_PUNCT}])`, 'g'),
      replacement: `$1${SPACE}**$2**`,
    },
    // 右侧粘连
    {
      regex: new RegExp(`(?<=^|\\s|[${CJK_PUNCT}])\\*\\*(?!\\*)(?!\\s)([^*]+?)(?<!\\s)\\*\\*(?!\\*)([^\\s*])`, 'g'),
      replacement: `**$1**${SPACE}$2`,
    },

    // ===== *斜体* - 单个星号 =====
    // 边界字符必须排除 *，避免匹配 ** 或 *** 内部
    // 两侧都粘连
    {
      regex: /([^\s*])\*(?!\*)(?!\s)([^*]+?)(?<!\s)\*(?!\*)([^\s*])/g,
      replacement: `$1${SPACE}*$2*${SPACE}$3`,
    },
    // 左侧粘连
    {
      regex: new RegExp(`([^\\s*])\\*(?!\\*)(?!\\s)([^*]+?)(?<!\\s)\\*(?!\\*)(?=\\s|$|[${CJK_PUNCT}])`, 'g'),
      replacement: `$1${SPACE}*$2*`,
    },
    // 右侧粘连
    {
      regex: new RegExp(`(?<=^|\\s|[${CJK_PUNCT}])\\*(?!\\*)(?!\\s)([^*]+?)(?<!\\s)\\*(?!\\*)([^\\s*])`, 'g'),
      replacement: `*$1*${SPACE}$2`,
    },
  ]

  let result = content

  for (const { regex, replacement } of patterns) {
    result = result.replace(regex, replacement)
  }

  return result
}

export type MdToHTMLOptsions = {
  /**
   * 是否跳过 xss 过滤
   * @default false
   */
  skipXSS?: boolean
  /**
   * 后处理函数
   * @param html 处理后的 HTML 字符串
   * @returns 处理后的 HTML 字符串
   */
  postProcess?: (html: string) => Promise<string> | string
  /**
   * 是否应用 Markdown 格式预处理（处理粘连的格式符号）
   * @default true
   */
  preprocessMarkdownFormat?: boolean
}
