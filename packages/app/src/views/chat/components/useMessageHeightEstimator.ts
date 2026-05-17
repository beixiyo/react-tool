import type { ChatMessage } from '../types'
import { useRef } from 'react'

const CARD_HEIGHT = 280
const LOADING_HEIGHT = 40
const THINKING_OVERHEAD = 60
const MESSAGE_PADDING = 48
const TIMESTAMP_HEIGHT = 24
const IMAGE_ROW_HEIGHT = 180
const FILE_ROW_HEIGHT = 56

function estimateTextHeight(text: string, width: number, lineHeight: number, avgCharWidth: number): number {
  if (!text || width <= 0)
    return 0

  let totalLines = 0
  const lines = text.split('\n')

  for (const line of lines) {
    if (line.length === 0) {
      totalLines += 1
      continue
    }
    const lineWidth = line.length * avgCharWidth
    totalLines += Math.max(1, Math.ceil(lineWidth / width))
  }

  return totalLines * lineHeight
}

function estimateMarkdownOverhead(md: string): number {
  let overhead = 0
  const lines = md.split('\n')
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line))
      overhead += 12
    if (/^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line))
      overhead += 4
    if (/^\|/.test(line))
      overhead += 8
  }

  const tableCount = (md.match(/^\|/gm) || []).length
  if (tableCount > 2)
    overhead += tableCount * 8

  return overhead
}

export function useMessageHeightEstimator(containerWidth: number) {
  const avgCharWidthRef = useRef(8)
  const lineHeightRef = useRef(24)

  const estimateHeight = (message: ChatMessage, _index: number): number => {
    if (!message)
      return 100

    const contentWidth = Math.min(containerWidth - 48, 700)
    const charW = avgCharWidthRef.current
    const lh = lineHeightRef.current

    switch (message.type) {
      case 'loading':
        return LOADING_HEIGHT

      case 'card':
        return CARD_HEIGHT

      case 'thinking-start':
      case 'thinking-end': {
        const textH = estimateTextHeight(message.content, contentWidth, lh, charW)
        return textH + THINKING_OVERHEAD
      }

      case 'markdown': {
        const textH = estimateTextHeight(message.content, contentWidth, lh, charW)
        const mdOverhead = estimateMarkdownOverhead(message.content)
        const imagesH = message.images?.length
          ? IMAGE_ROW_HEIGHT
          : 0
        const filesH = (message.files?.length || 0) * FILE_ROW_HEIGHT
        return textH + mdOverhead + MESSAGE_PADDING + imagesH + filesH
      }

      case 'text':
      default: {
        const isUser = message.sender === 'user'
        const w = isUser
          ? Math.min(contentWidth, 480)
          : contentWidth
        const textH = estimateTextHeight(message.content, w, lh, charW)
        const imagesH = message.images?.length
          ? IMAGE_ROW_HEIGHT
          : 0
        const filesH = (message.files?.length || 0) * FILE_ROW_HEIGHT
        const timestampH = isUser
          ? TIMESTAMP_HEIGHT
          : 0
        return textH + MESSAGE_PADDING + imagesH + filesH + timestampH
      }
    }
  }

  const calibrate = (el: HTMLElement) => {
    const style = getComputedStyle(el)
    const size = Number.parseFloat(style.fontSize) || 16
    lineHeightRef.current = Number.parseFloat(style.lineHeight) || (size * 1.5)
    avgCharWidthRef.current = size * 0.55
  }

  return { estimateHeight, calibrate }
}
