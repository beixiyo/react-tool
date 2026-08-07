import { describe, expect, it, vi } from 'vitest'
import {
  addTimestampParam,
  composeBase64,
  extractLinks,
  isValidFileType,
  normalizeEOL,
} from '../tool'

describe('工具辅助函数', () => {
  it('规范化转义和实际换行符', () => {
    expect(normalizeEOL('a\\r\\nb\\rc\\n')).toBe('a\nb\nc\n')
    expect(normalizeEOL('a\r\nb\rc\n')).toBe('a\nb\nc\n')
  })

  it('提取不重复链接并裁剪末尾 Markdown 括号', () => {
    expect(extractLinks('see https://example.com/a and (https://example.com/a)')).toEqual([
      'https://example.com/a',
    ])
  })

  it('仅为 HTTP URL 添加时间戳', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123)

    expect(addTimestampParam('/local/file')).toBe('/local/file')
    expect(addTimestampParam('https://example.com/a?x=1')).toBe('https://example.com/a?x=1&__timestamp__=123')
  })

  it('按扩展名和 MIME 模式检查文件类型', () => {
    const png = new File([''], 'avatar.PNG', { type: 'image/png' })
    const pdf = new File([''], 'doc.pdf', { type: 'application/pdf' })

    expect(isValidFileType(png, 'image/*')).toBe(true)
    expect(isValidFileType(pdf, '.pdf,image/*')).toBe(true)
    expect(isValidFileType(pdf, 'image/*')).toBe(false)
    expect(isValidFileType(pdf, '')).toBe(true)
  })

  it('组合 Base64 图片来源', () => {
    expect(composeBase64('abc')).toBe('data:image/png;base64,abc')
    expect(composeBase64('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
    expect(composeBase64('https://example.com/a.png')).toBe('https://example.com/a.png')
  })
})
