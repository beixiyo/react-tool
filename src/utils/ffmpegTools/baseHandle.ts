import type { FFmpeg } from '@ffmpeg/ffmpeg'
import type { Optional } from '@jl-org/ts-tool'
import type { BaseFilterOpts } from './types'
import { fetchFile } from '@ffmpeg/util'
import { execFFmpeg, progressFFmpeg, readFFmpeg, writeFFmpeg } from './compatible'
import { genCommonArgs } from './config'
import { clearFFmpegFS, genHanldProgress, getInputArgs } from './tools'

/**
 * 使用 ffmpeg.wasm 基础处理函数
 */
export async function baseHandle(
  ffmpeg: FFmpeg,
  {
    inputFileNames,
    outputFileName = 'output.mp4',
    source,
    execArgs,
    clearList,
    onProgress,
  }: BaseHandleOpts,
): Promise<Blob> {
  console.log(execArgs)
  const handleProgress = genHanldProgress(onProgress)

  try {
    for (let i = 0; i < source.length; i++) {
      const item = source[i]
      const filename = inputFileNames[i]
      const inputFileData = await fetchFile(item)
      await writeFFmpeg(ffmpeg, filename, inputFileData)
    }

    if (onProgress) {
      progressFFmpeg(ffmpeg, handleProgress)
    }

    await execFFmpeg(ffmpeg, execArgs)

    const fileData = await readFFmpeg(ffmpeg, outputFileName)
    return new Blob([fileData], { type: 'video/mp4' })
  }
  finally {
    if (onProgress) {
      // ffmpeg.off('progress', handleProgress)
    }
    await clearFFmpegFS(ffmpeg, clearList || [...inputFileNames, outputFileName])
  }
}

/**
 * 使用 ffmpeg.wasm 压缩视频
 */
export function compressVideo(
  ffmpeg: FFmpeg,
  opts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(opts.source)

  const formatOpts = {
    ...opts,
    inputFileNames,
    outputFileName: opts.outputFileName || 'output.mp4',
  }

  return baseHandle(ffmpeg, {
    ...formatOpts,
    execArgs: [
      ...inputFileArgs,
      ...genCommonArgs(),
      formatOpts.outputFileName,
    ],
  })
}

/**
 * 使用 ffmpeg.wasm 转码视频
 */
export function transcode(
  ffmpeg: FFmpeg,
  opts: BaseFilterOpts,
): Promise<Blob> {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(opts.source)

  const formatOpts = {
    ...opts,
    outputFileName: opts.outputFileName ?? 'output.mp4',
    inputFileNames,
  }

  return baseHandle(ffmpeg, {
    ...formatOpts,
    execArgs: [
      ...inputFileArgs,
      ...genCommonArgs(),
      formatOpts.outputFileName,
    ],
  })
}

export type BaseHandleOpts = BaseFilterOpts & {
  execArgs: string[]
  clearList?: string[]
}
