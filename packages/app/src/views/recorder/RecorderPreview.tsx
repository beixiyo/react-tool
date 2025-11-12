import { Audio } from 'comps'
import { Activity, memo } from 'react'

/**
 * 屏幕录制预览与下载
 */
export const RecorderPreview = memo((props: RecorderPreviewProps) => {
  const { videoRef, blobUrl, isAudio } = props
  return (
    <div className="col-span-1 md:col-span-2">
      <Activity mode={ isAudio
        ? 'visible'
        : 'hidden' }>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">当前为仅音频模式，无视频预览</p>
          <Activity mode={ blobUrl
            ? 'visible'
            : 'hidden' }>
            <Audio
              className="mt-3 w-full"
              src={ blobUrl || undefined }
              controls
            />
          </Activity>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          停止后可播放与下载音频
        </p>
      </Activity>

      <Activity mode={ !isAudio
        ? 'visible'
        : 'hidden' }>
        <div className="aspect-video w-full rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black/80">
          <video
            ref={ videoRef }
            className="h-full w-full"
            playsInline
            muted
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          录制中将展示实时预览，停止后展示最终回放
        </p>
      </Activity>

      <Activity mode={ blobUrl
        ? 'visible'
        : 'hidden' }>
        <div className="pt-2">
          <a
            href={ blobUrl || undefined }
            download={ isAudio
              ? 'record.webm'
              : 'record.webm' }
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            { isAudio
              ? '下载音频'
              : '下载视频' }
          </a>
        </div>
      </Activity>
    </div>
  )
})

RecorderPreview.displayName = 'RecorderPreview'

export type RecorderPreviewProps = {
  videoRef: React.RefObject<HTMLVideoElement>
  blobUrl: string | null
  /** 是否仅音频模式 */
  isAudio?: boolean
}
