import type { FileItem as UploaderFileItem } from '@/components/Uploader'
import { useState } from 'react'

export function useFileManager() {
  /** 上传的文件列表 (Uploader组件管理实际文件，这里是其FileItem表示) */
  const [uploadedFiles, setUploadedFiles] = useState<UploaderFileItem[]>([])
  /** 用户勾选用于合并的原始文件列表 */
  const [selectedFilesForMerge, setSelectedFilesForMerge] = useState<File[]>([])
  /** 当前在编辑器中激活进行处理或预览的视频文件 */
  const [activeVideoFile, setActiveVideoFile] = useState<File | null>(null)
  /** 激活视频的总时长（秒） */
  const [activeVideoDuration, setActiveVideoDuration] = useState<number | null>(null)

  const handleUploadedFiles = (files: UploaderFileItem[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  const handleDeleteUploadedFile = (fileItemToDelete: UploaderFileItem) => {
    const uploaderFileIndex = uploadedFiles.findIndex(f => f.file.name === fileItemToDelete.file.name && f.file.lastModified === fileItemToDelete.file.lastModified)
    if (uploaderFileIndex !== -1) {
      setUploadedFiles(prev => prev.splice(uploaderFileIndex, 1))
    }

    setUploadedFiles(prev => prev.filter(f =>
      f.file.name !== fileItemToDelete.file.name
      || f.file.lastModified !== fileItemToDelete.file.lastModified,
    ))

    if (
      activeVideoFile?.name === fileItemToDelete.file.name
      && activeVideoFile?.lastModified === fileItemToDelete.file.lastModified
    ) {
      /** 如果删除的是当前激活视频，则取消激活 */
      setActiveVideoFile(null)
    }

    setSelectedFilesForMerge(prev => prev.filter(f =>
      f.name !== fileItemToDelete.file.name
      || f.lastModified !== fileItemToDelete.file.lastModified,
    ))
  }

  return {
    uploadedFiles,
    setUploadedFiles,
    handleUploadedFiles,
    selectedFilesForMerge,
    setSelectedFilesForMerge,
    activeVideoFile,
    setActiveVideoFile,
    activeVideoDuration,
    setActiveVideoDuration,
    handleDeleteUploadedFile,
  }
}
