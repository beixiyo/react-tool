import { describe, expect, it } from 'vitest'
import { mdToHTML } from '../md'

describe('mdToHTML', () => {
  it('renders GFM markdown with existing link and line-break behavior', async () => {
    const html = await mdToHTML([
      '# 标题',
      '',
      '第一行',
      '第二行',
      '',
      '文字**加粗**文字',
      '',
      '- [x] done',
      '',
      'https://example.com',
    ].join('\n'))

    expect(html).toContain('<h1>标题</h1>')
    expect(html).toContain('第一行<br>')
    expect(html).toContain('第二行')
    expect(html).toContain('<strong>加粗</strong>')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked')
    expect(html).toContain('disabled')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('sanitizes rendered html by default', async () => {
    const html = await mdToHTML('<img src=x onerror="alert(1)">')

    expect(html).toContain('<img src')
    expect(html).not.toContain('onerror')
  })
})
