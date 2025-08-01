import type { FFmpeg } from '@ffmpeg/ffmpeg'
import type { Optional } from '@jl-org/ts-tool'
import type { BaseFilterOpts } from './types'
import { fetchFile } from '@ffmpeg/util'
import { execFFmpeg, progressFFmpeg, readFFmpeg, writeFFmpeg } from './compatible'
import { clearFFmpegFS, genHanldProgress, getFFmpegInputFileList, getInputArgs } from './tools'

/**
 * 使用 ffmpeg.wasm 拼接多段视频为一个视频文件
 * @param ffmpeg FFmpeg 实例
 * @returns 拼接完成的视频文件 Blob 对象
 */
export async function mergeVideos(
  ffmpeg: FFmpeg,
  {
    source,
    outputFileName = 'output.mp4',
    preset = 'ultrafast',
    onProgress,
  }: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  const handleProgress = genHanldProgress(onProgress)
  /** 创建文件列表 */
  const fileListName = `filelist_${Date.now()}.txt`
  const {
    inputFileNames,
  } = getInputArgs(source)

  try {
    if (onProgress) {
      progressFFmpeg(ffmpeg, handleProgress)
    }

    /** 写入输入文件 */
    for (let i = 0; i < source.length; i++) {
      const item = source[i]
      const fileData = await fetchFile(item)
      writeFFmpeg(ffmpeg, inputFileNames[i], fileData)
    }

    /** 确保文件列表中的路径格式正确 */
    const fileListName = getFFmpegInputFileList(inputFileNames)
    /** 写入文件列表 */
    writeFFmpeg(ffmpeg, fileListName, new TextEncoder().encode(fileListName))

    /** 执行拼接 */
    await execFFmpeg(ffmpeg, [
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      fileListName,
      '-c',
      'copy',
      '-preset',
      preset,
      outputFileName,
    ])

    /** 读取输出文件 */
    const fileData = await readFFmpeg(ffmpeg, outputFileName)
    return new Blob([fileData], { type: 'video/mp4' })
  }
  finally {
    if (onProgress) {
      // ffmpeg.off('progress', handleProgress)
    }
    await clearFFmpegFS(ffmpeg, [...inputFileNames, outputFileName, fileListName])
  }
}
