import { useState } from 'react'

export function useFileManager() {
  /** 上传的文件列表（由 Uploader 组件管理实际文件） */
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  /** 用户勾选用于合并的原始文件列表 */
  const [selectedFilesForMerge, setSelectedFilesForMerge] = useState<File[]>([])
  /** 当前在编辑器中激活进行处理或预览的视频文件 */
  const [activeVideoFile, setActiveVideoFile] = useState<File | null>(null)
  /** 激活视频的总时长（秒） */
  const [activeVideoDuration, setActiveVideoDuration] = useState<number | null>(null)

  const handleUploadedFiles = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  const handleDeleteUploadedFile = (fileToDelete: File) => {
    setUploadedFiles(prev => prev.filter(f =>
      f.name !== fileToDelete.name
      || f.lastModified !== fileToDelete.lastModified,
    ))

    if (
      activeVideoFile?.name === fileToDelete.name
      && activeVideoFile?.lastModified === fileToDelete.lastModified
    ) {
      /** 如果删除的是当前激活视频，则取消激活 */
      setActiveVideoFile(null)
    }

    setSelectedFilesForMerge(prev => prev.filter(f =>
      f.name !== fileToDelete.name
      || f.lastModified !== fileToDelete.lastModified,
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
