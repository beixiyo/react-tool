import { mockConfig } from './config'

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function encodeEvent(event: { type: string; data: unknown }): Uint8Array {
  const payload = `data: ${JSON.stringify(event)}\n\n`
  return new TextEncoder().encode(payload)
}

/**
 * SSE 流式事件工具函数
 */
export function streamEvents(events: Array<{ type: string; data: unknown }>, intervalMs?: number) {
  const interval = intervalMs ?? mockConfig.sseIntervalMs ?? 80

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const e of events) {
        if (interval > 0) await sleep(interval)
        controller.enqueue(encodeEvent(e))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

/**
 * 文本分块流式响应
 */
export function streamTextChunks(text: string, intervalMs?: number): Response {
  const chars = text.split('')
  const events = chars.map((char, index) => ({
    type: 'chunk',
    data: {
      char,
      isFirst: index === 0,
      isLast: index === chars.length - 1,
    },
  }))
  return streamEvents(events, intervalMs)
}
