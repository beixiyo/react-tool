import { describe, expect, it, vi } from 'vitest'
import {
  addTimestampParam,
  composeBase64,
  extractLinks,
  isValidFileType,
  normalizeEOL,
} from '../tool'

describe('utils tool helpers', () => {
  it('normalizes escaped and actual line endings', () => {
    expect(normalizeEOL('a\\r\\nb\\rc\\n')).toBe('a\nb\nc\n')
    expect(normalizeEOL('a\r\nb\rc\n')).toBe('a\nb\nc\n')
  })

  it('extracts unique links and trims trailing markdown parentheses', () => {
    expect(extractLinks('see https://example.com/a and (https://example.com/a)')).toEqual([
      'https://example.com/a',
    ])
  })

  it('adds timestamps only for http urls', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123)

    expect(addTimestampParam('/local/file')).toBe('/local/file')
    expect(addTimestampParam('https://example.com/a?x=1')).toBe('https://example.com/a?x=1&__timestamp__=123')
  })

  it('checks file types by extension and mime patterns', () => {
    const png = new File([''], 'avatar.PNG', { type: 'image/png' })
    const pdf = new File([''], 'doc.pdf', { type: 'application/pdf' })

    expect(isValidFileType(png, 'image/*')).toBe(true)
    expect(isValidFileType(pdf, '.pdf,image/*')).toBe(true)
    expect(isValidFileType(pdf, 'image/*')).toBe(false)
    expect(isValidFileType(pdf, '')).toBe(true)
  })

  it('composes base64 image sources', () => {
    expect(composeBase64('abc')).toBe('data:image/png;base64,abc')
    expect(composeBase64('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
    expect(composeBase64('https://example.com/a.png')).toBe('https://example.com/a.png')
  })
})
