import type { FFmpeg, ProgressEventCallback } from '@ffmpeg/ffmpeg'
import type { OnProgress } from './types'
import { getFilenameAndExt, isStr } from '@jl-org/tool'
import { rmFFmpeg } from './compatible'

export function getInputArgs(inputFiles: (string | File)[]) {
  const inputFileNames: string[] = []
  const inputFileArgs: string[] = []

  for (const item of inputFiles) {
    inputFileArgs.push('-i')

    if (item instanceof File) {
      inputFileNames.push(item.name)
    }
    else {
      inputFileNames.push(item)
    }

    inputFileArgs.push(inputFileNames.at(-1)!)
  }

  return {
    inputFileNames,
    inputFileArgs,
  }
}

export function genHanldProgress(onProgress?: OnProgress) {
  const handleProgress: ProgressEventCallback = ({ progress }) => {
    onProgress?.(Math.round(progress * 100))
  }

  return handleProgress
}

/**
 * 数组格式化成 FFmpeg 虚拟文件系统中的文件列表
 */
export function getFFmpegInputFileList(names: string[]): string {
  return names.map(file => `file '${file}'`).join('\n')
}

/**
 * 从 URL 或者 File 中获取文件名和扩展名
 */
export function getFileInfo(file: string | File) {
  if (file instanceof File) {
    return getFilenameAndExt(file.name)
  }
  if (isStr(file)) {
    return getFilenameAndExt(file)
  }

  throw new Error('file 必须是 File 或 string 类型')
}

/**
 * 清理 FFmpeg 虚拟文件系统中的文件
 * @param ffmpeg FFmpeg 实例
 * @param files 需要清理的文件列表
 * @param silent 是否静默处理错误
 * @throws 当 silent 为 false 且清理失败时抛出错误
 */
export async function clearFFmpegFS(
  ffmpeg: FFmpeg,
  files: string[],
  silent = true,
) {
  if (!ffmpeg || !files.length)
    return

  const errors: Error[] = []
  for (const file of files) {
    try {
      await rmFFmpeg(ffmpeg, file)
    }
    catch (err) {
      if (err instanceof Error) {
        errors.push(err)
      }
      else {
        errors.push(new Error(`清理文件失败: ${file}`))
      }
    }
  }

  if (errors.length > 0 && !silent) {
    throw new Error(`清理文件失败 ${errors.join('\n')}`)
  }
}

export function escapeFFmpegText(text: string): string {
  return text
    .replace(/\\/g, '\\\\\\\\') // Escape backslashes first (double escape for shell + ffmpeg)
    .replace(/'/g, '\'\\\'\'') // Escape single quotes
    .replace(/%/g, '\\%')
    .replace(/:/g, '\\:')
    .replace(/,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
}
