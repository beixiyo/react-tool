import { SSEStreamProcessor } from '@jl-org/http'
import { useMemo, useRef, useState } from 'react'

/**
 * 解析 SSE / JSON 文本，聚合所有 JSON 与原始载荷
 */
export function useParseSSE() {
  const [allJson, setAllJson] = useState<ReadonlyArray<any>>([])

  const processorRef = useRef<SSEStreamProcessor | null>(null)

  const ensureProcessor = () => {
    if (!processorRef.current) {
      processorRef.current = new SSEStreamProcessor({
        needParseData: true,
        needParseJSON: true,
        onMessage: (data) => {
          if (data.allJson && data.allJson.length > 0) {
            setAllJson(prev => [...prev, ...data.allJson])
          }
        },
      })
    }
    return processorRef.current
  }

  const parse = (input: string) => {
    /** 重置 */
    setAllJson([])
    const p = ensureProcessor()
    /** 使用单次输入处理：按块分段可选，这里直接走一次处理 + 处理剩余 */
    p.processChunk(input)
    p.handleRemainingBuffer()
  }

  return useMemo(() => ({
    parse,
    allJson,
  }), [allJson])
}
