/** 验证 CJK 格式解析不再通过修改正文实现，并保留代码和调用方控制契约 */
import { marked } from 'marked'
import { describe, expect, it, vi } from 'vitest'
import { mdToHTML } from '../md'

describe('mdToHTML CJK 格式兼容', () => {
  it.each([
    ['预计总投入约**6.3亿**日元，占目标销售额的**40%**以上。', '预计总投入约<strong>6.3亿</strong>日元，占目标销售额的<strong>40%</strong>以上。'],
    ['前文**（重点）**后文', '前文<strong>（重点）</strong>后文'],
    ['前文**重点。**后文', '前文<strong>重点。</strong>后文'],
    ['前文*40%*后文', '前文<em>40%</em>后文'],
    ['前文***40%***后文', '前文<em><strong>40%</strong></em>后文'],
    ['前文~~40%~~后文', '前文<del>40%</del>后文'],
    ['前文**[占比](https://example.com)40%**后文', '前文<strong><a target="_blank" rel="noopener noreferrer" href="https://example.com">占比</a>40%</strong>后文'],
    ['普通 **bold** 和 **中文**。', '普通 <strong>bold</strong> 和 <strong>中文</strong>。'],
  ])('解析 %s，不插入额外空格', async (input, expected) => {
    expect(await mdToHTML(input)).toBe(`<p>${expected}</p>\n`)
  })

  it('不改动代码、转义星号和链接地址', async () => {
    const html = await mdToHTML([
      '`前文**40%**后文` 与 ``前文~~40%~~后文``',
      '',
      '```md',
      '前文**（重点）**后文',
      '```',
      '',
      '    前文**40%**后文',
      '',
      '前文\\*\\*40%\\*\\*后文',
      '',
      '[链接](https://example.com/**40%**)',
      '',
      'foo**bar!**baz',
    ].join('\n'))

    expect(html).toContain('<code>前文**40%**后文</code>')
    expect(html).toContain('<code>前文~~40%~~后文</code>')
    expect(html).toContain('<code>前文**（重点）**后文\n</code>')
    expect(html).toContain('<code>前文**40%**后文\n</code>')
    expect(html).toContain('<p>前文**40%**后文</p>')
    expect(html).toContain('href="https://example.com/**40%**"')
    expect(html).toContain('<p>foo**bar!**baz</p>')
    expect(html).not.toContain('<strong>')
  })

  it('兼容关闭选项且不污染标准解析器或交错调用', async () => {
    const input = '占比**40%**以上，前文~~40%~~后文'
    const enabled = '<p>占比<strong>40%</strong>以上，前文<del>40%</del>后文</p>\n'
    const disabled = '<p>占比**40%**以上，前文~~40%~~后文</p>\n'

    expect(await Promise.all([
      mdToHTML(input),
      mdToHTML(input, { preprocessMarkdownFormat: false }),
      mdToHTML(input),
    ])).toEqual([enabled, disabled, enabled])
    expect(marked.parseInline('占比**40%**以上')).toBe('占比**40%**以上')
  })

  it('postProcess 仍接收解析前的 Markdown，但不再收到正则插入的空格', async () => {
    const postProcess = vi.fn(async (value: string) => value.replace('原文', '替换'))
    const html = await mdToHTML('原文\\n前文**40%**后文', { postProcess })

    expect(postProcess).toHaveBeenCalledTimes(1)
    expect(postProcess).toHaveBeenCalledWith('原文\n前文**40%**后文')
    expect(html).toBe('<p>替换<br>前文<strong>40%</strong>后文</p>\n')
  })

  it('保留 skipXSS 的显式关闭能力，默认仍过滤危险属性', async () => {
    const input = '<img src="https://example.com/a.png" onerror="alert(1)">'

    expect(await mdToHTML(input)).not.toContain('onerror')
    expect(await mdToHTML(input, { skipXSS: true })).toContain('onerror="alert(1)"')
  })
})
