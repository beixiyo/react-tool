import type { FileItem, UploaderProps } from './types'
import { blobToBase64, getImg } from '@jl-org/tool'
import { useRef, useState } from 'react'
import { isValidFileType } from 'utils'

export function useGenState(
  {
    maxCount,
    maxSize,
    distinct,
    disabled,
    onChange,
    onExceedCount,
    onExceedSize,
    onExceedPixels,
    shouldFilterOut,
    onFiltered,
    accept = '',
    autoClear = true,
    maxPixels,
    previewImgs,
  }: UploaderProps,
) {
  const [dragActive, setDragActive] = useState(false)
  const [dragInvalid, setDragInvalid] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * 校验并处理文件
   */
  const handleFiles = async (fileList: File[]) => {
    const newImages: FileItem[] = []
    const filteredOut: FileItem[] = []
    const existingFiles = new Set<string>()
    const currentCount = previewImgs?.length || 0

    for (const file of fileList) {
      if (!isValidFileType(file, accept))
        continue

      if (maxCount && currentCount + newImages.length >= maxCount) {
        onExceedCount?.()
        break
      }

      if (maxSize && file.size > maxSize) {
        onExceedSize?.(file.size)
        continue
      }

      if (maxPixels && file.type.startsWith('image/')) {
        const src = URL.createObjectURL(file)
        const img = await getImg(src)
        URL.revokeObjectURL(src)

        /** 加载失败（img 为空）时不拦截，放行该文件 */
        if (img) {
          const { naturalWidth, naturalHeight } = img
          if (naturalWidth > maxPixels.width || naturalHeight > maxPixels.height) {
            onExceedPixels?.(naturalWidth, naturalHeight)
            continue
          }
        }
      }

      if (distinct) {
        const fileKey = `${file.name}-${file.size}-${file.type}`
        if (existingFiles.has(fileKey))
          continue
        existingFiles.add(fileKey)
      }

      try {
        const base64 = await blobToBase64(file)
        /** 自定义过滤：返回 true 表示该文件被过滤掉，不进入结果 */
        if (shouldFilterOut?.(file, base64)) {
          filteredOut.push({ file, base64 })
          continue
        }
        newImages.push({ file, base64 })
      }
      catch (error) {
        console.error('Failed to convert file to base64:', error)
      }
    }

    if (newImages.length > 0) {
      onChange?.(newImages)
    }

    if (filteredOut.length > 0) {
      onFiltered?.(filteredOut)
    }

    /**
     * 选择后清空 input，使再次选择相同文件仍能触发 change
     * setTimeout 推到宏任务，避免在全部文件非法（无 await）时于 change 事件分发期间修改 value
     */
    if (autoClear) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      })
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLElement>) => {
    if (disabled)
      return
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)

      if (accept && e.dataTransfer.items.length > 0) {
        const items = Array.from(e.dataTransfer.items)
        const hasInvalidFile = items.some((item) => {
          if (item.kind === 'file') {
            const file = item.getAsFile()
            return file && !isValidFileType(file, accept)
          }
          return false
        })
        setDragInvalid(hasInvalidFile)
      }
      else {
        setDragInvalid(false)
      }
    }
    else if (e.type === 'dragleave') {
      const rect = e.currentTarget.getBoundingClientRect()
      const { clientX: x, clientY: y } = e

      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setDragActive(false)
        setDragInvalid(false)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    if (disabled)
      return
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragInvalid(false)

    if (e.dataTransfer.files?.length) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled)
      return
    if (e.target.files?.length) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    if (disabled)
      return

    const items = e.clipboardData.items
    if (!items)
      return

    const fileList: File[] = []
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        file && fileList.push(file)
      }
    }

    if (fileList.length > 0) {
      handleFiles(fileList)
    }
  }

  return {
    dragActive,
    dragInvalid,
    inputRef,
    handleDrag,
    handleDrop,
    handleChange,
    handlePaste,
  }
}
