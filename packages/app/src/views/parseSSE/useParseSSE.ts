import { SSEStreamProcessor } from '@jl-org/http'
import { useMemo, useRef, useState } from 'react'

/**
 * 解析 SSE / JSON 文本，聚合所有 JSON 与原始载荷
 */
export function useParseSSE() {
  const [allJson, setAllJson] = useState<ReadonlyArray<any>>([])

  const processorRef = useRef<SSEStreamProcessor | null>(null)

  const createProcessor = () => {
    processorRef.current = new SSEStreamProcessor({
      needParseData: true,
      needParseJSON: true,
      onMessage: (data) => {
        if (data.allJson && data.allJson.length > 0) {
          setAllJson(prev => [...prev, ...data.allJson])
        }
      },
    })
    return processorRef.current
  }

  const parse = (input: string) => {
    /** 重置 */
    setAllJson([])
    const p = createProcessor()
    p.processChunk(input)
    p.handleRemainingBuffer()
  }

  return useMemo(() => ({
    parse,
    allJson,
  }), [allJson])
}
