import { useCallback, useRef } from 'react'
import ZipWorker from '@/worker/zipWorker?worker'

/**
 * 解压 zip 文件的 hook
 */
export function useUnzip(options?: {
  onSuccess?: (files: UnzippedFile[]) => void
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}) {
  const workerRef = useRef<Worker | null>(null)

  const unzipFile = useCallback((arrayBuffer: ArrayBuffer) => {
    /** 如果已有worker实例则销毁 */
    if (workerRef.current) {
      workerRef.current.terminate()
    }

    /** 创建新的worker实例 */
    workerRef.current = new ZipWorker()

    /** 监听worker消息 */
    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data

      switch (type) {
        case 'result':
          options?.onSuccess?.(data)
          break
        case 'progress':
          options?.onProgress?.(data)
          break
        case 'error':
          options?.onError?.(data)
          break
      }
    }

    /** 发送解压指令 */
    workerRef.current.postMessage({
      type: 'unzip',
      arrayBuffer,
    })
  }, [])

  return {
    unzipFile,
  }
}

/**
 * 解压后的文件信息
 */
export interface UnzippedFile {
  /** 文件名 */
  name: string
  /** 文件内容(Base64或文本) */
  data: string
  /** 是否为文本文件 */
  isText: boolean
  /** 是否为图片文件 */
  isImage?: boolean
  /** MIME类型 */
  mimeType?: string
  /** 原始文件大小(字节) */
  originalSize: number
}
