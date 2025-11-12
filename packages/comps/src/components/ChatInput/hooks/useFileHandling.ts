import type { ChatInputProps } from '../types'
import { useCallback } from 'react'

/**
 * 用于处理文件上传的 Hook
 * @param onFilesChange - 文件更改时的属性回调
 * @returns 文件更改处理程序
 */
export function useFileHandling(onFilesChange: ChatInputProps['onFilesChange']) {
  const handleFilesChange = useCallback((files: { base64: string }[]) => {
    onFilesChange?.(files.map(item => item.base64))
  }, [onFilesChange])

  return {
    handleFilesChange,
  }
}
