import { memo } from 'react'
import { cn } from 'utils'
import { CloseBtn, LazyImg } from '../..'

export type UploadedFilePreviewProps = {
  uploadedFiles: string[]
  onFileRemove?: (index: number) => void
  className?: string
}

export const UploadedFilePreview = memo<UploadedFilePreviewProps>((
  {
    uploadedFiles,
    onFileRemove,
    className,
  },
) => {
  if (!uploadedFiles || uploadedFiles.length === 0)
    return null

  return (
    <div className={ cn(
      'absolute left-2 z-20 w-full flex flex-wrap bg-transparent -top-16',
      className,
    ) }>
      { uploadedFiles.map((src, idx) => (
        <div
          key={ `uploaded-file-${idx}-${src.slice(0, 10)}` }
          className="relative mb-2 mr-2 inline-block size-14 overflow-hidden rounded-xs shadow-xs dark:border-gray-700 dark:bg-dark"
        >
          <LazyImg
            lazy={ false }
            src={ src }
            alt="preview"
          />
          <CloseBtn
            onClick={ () => onFileRemove?.(idx) }
            iconSize={ 12 }
            className="size-4"
          />
        </div>
      )) }
    </div>
  )
})

UploadedFilePreview.displayName = 'UploadedFilePreview'
