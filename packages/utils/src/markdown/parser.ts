/** 独立 Markdown 解析器与按需 CJK 加载，不依赖 UI、Tiptap 或 XSS 策略 */
import { Lexer, Marked, type MarkedExtension, type MarkedOptions } from 'marked'

let cjkFactory: (() => MarkedExtension) | undefined
let cjkLoading: Promise<void> | undefined

/** 按需加载 CJK 插件；缓存模块加载而不是解析器，失败后允许重试 */
export function loadCjkMarkdownSupport(): Promise<void> {
  return cjkLoading ??= import('marked-cjk-friendly').then((module) => {
    cjkFactory = module.default
  }).catch((error: unknown) => {
    cjkLoading = undefined
    throw error
  })
}

/** 异步创建独立解析器；关闭 CJK 时不会加载插件 */
export async function loadMarkdownParser(options: CreateMarkdownParserOptions = {}): Promise<Marked> {
  const { cjkFriendly = true } = options

  if (cjkFriendly) await loadCjkMarkdownSupport()

  return createMarkdownParser({ cjkFriendly })
}

/**
 * 同步创建独立解析器；启用 CJK 时须先 await loadCjkMarkdownSupport()
 * 未加载时抛错，不回退为标准规则，避免初始内容被错误解析
 */
export function createMarkdownParser(options: CreateMarkdownParserOptions = {}): Marked {
  const { cjkFriendly = true } = options

  if (cjkFriendly && !cjkFactory) {
    throw new Error('CJK Markdown is not loaded. Use await loadMarkdownParser() or await loadCjkMarkdownSupport() first.')
  }

  return new ScopedMarked(
    ...(cjkFriendly && cjkFactory
      ? [cjkFactory()]
      : []),
  )
}

/** 保证 new parser.Lexer() 与 parser.lexer() 采用相同 defaults，且不修改全局 Lexer */
class ScopedMarked extends Marked {
  constructor(...extensions: MarkedExtension[]) {
    super(...extensions)

    const parser = this
    this.Lexer = class<ParserOutput = string, RendererOutput = string> extends Lexer<ParserOutput, RendererOutput> {
      constructor(options?: MarkedOptions<ParserOutput, RendererOutput>) {
        super({ ...parser.defaults, ...options } as MarkedOptions<ParserOutput, RendererOutput>)
      }
    }
  }
}

/** Markdown 解析器的通用格式兼容选项 */
export type CreateMarkdownParserOptions = {
  /**
   * 启用中日韩强调与删除线边界兼容，不改写原文或插入空格
   * @default true
   */
  cjkFriendly?: boolean
}
