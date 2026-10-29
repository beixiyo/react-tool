/** 公共解析器的延迟加载、独立实例与直接 Lexer 配置契约 */
import { marked } from 'marked'
import { describe, expect, it, vi } from 'vitest'
import { createMarkdownParser, loadMarkdownParser } from '../markdown'

const loading = vi.hoisted(() => ({ count: 0 }))
vi.mock('marked-cjk-friendly', async (importOriginal) => {
  loading.count++
  return await importOriginal()
})

describe('公共 Markdown 解析器', () => {
  it('关闭时不加载插件；启用时只加载一次，但每个调用方得到独立解析器', async () => {
    const input = '占比**40%**以上'
    const standard = await loadMarkdownParser({ cjkFriendly: false })

    expect(loading.count).toBe(0)
    expect(standard.parseInline(input)).toBe(input)
    expect(() => createMarkdownParser()).toThrow('CJK Markdown is not loaded')

    const [first, second] = await Promise.all([loadMarkdownParser(), loadMarkdownParser()])
    expect(loading.count).toBe(1)
    expect(first).not.toBe(second)
    expect(first.parseInline(input)).toBe('占比<strong>40%</strong>以上')

    first.use({ tokenizer: { emStrong: () => undefined } })
    expect(first.parseInline(input)).toBe(input)
    expect(second.parseInline(input)).toBe('占比<strong>40%</strong>以上')
    expect(second.parser(new second.Lexer().lex(input))).toBe('<p>占比<strong>40%</strong>以上</p>\n')
    expect(marked.parseInline(input)).toBe(input)
  })
})
