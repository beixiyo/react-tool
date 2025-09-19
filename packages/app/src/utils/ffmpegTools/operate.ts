import type { FFmpeg } from '@ffmpeg/ffmpeg'
import type { Optional } from '@jl-org/ts-tool'
import type { BaseFilterOpts } from './types'
import { fetchFile } from '@ffmpeg/util'
import { baseHandle } from './baseHandle'
import { writeFFmpeg } from './compatible'
import { genCommonArgs } from './config'
import { escapeFFmpegText, getInputArgs } from './tools'

/**
 * 使用 ffmpeg.wasm 裁剪视频
 */
export function trimVideo(
  ffmpeg: FFmpeg,
  opts: Optional<TrimVideoOpts, 'inputFileNames'>,
): Promise<Blob> {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(opts.source)

  const formatOpts = {
    ...opts,
    inputFileNames,
    outputFileName: opts.outputFileName ?? 'output.mp4',
    startTime: opts.startTime ?? 0,
  }

  if (formatOpts.duration <= 0) {
    throw new Error('时长必须大于 0')
  }
  if (formatOpts.startTime < 0) {
    throw new Error('开始时间不能小于 0')
  }

  return baseHandle(ffmpeg, {
    ...formatOpts,
    execArgs: [
      '-ss',
      formatOpts.startTime.toString(),
      ...inputFileArgs,
      '-t',
      formatOpts.duration.toString(),
      ...genCommonArgs(),
      formatOpts.outputFileName,
    ],
  })
}

/**
 * 使用 ffmpeg.wasm 从视频中截取指定时间点的帧
 */
export function captureFrame(
  ffmpeg: FFmpeg,
  opts: Optional<CaptureFrameOpts, 'inputFileNames'>,
): Promise<Blob> {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(opts.source)

  const formatOpts = {
    ...opts,
    inputFileNames,
    outputFileName: opts.outputFileName ?? 'output.mp4',
    timestamp: opts.timestamp ?? 0,
  }

  return baseHandle(ffmpeg, {
    ...formatOpts,
    execArgs: [
      '-ss',
      formatOpts.timestamp.toString(),
      ...inputFileArgs,
      '-frames:v', // 只截取一帧
      '1',
      ...genCommonArgs(),
      formatOpts.outputFileName,
    ],
  })
}

/** 旋转 */
export async function rotateVideo(
  ffmpeg: FFmpeg,
  opts: Optional<RotateVideoOpts, 'inputFileNames'>,
): Promise<Blob> {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(opts.source)

  const formatOpts = {
    ...opts,
    inputFileNames,
    outputFileName: opts.outputFileName ?? 'output.mp4',
    angle: opts.angle ?? 0,
  }

  const radians = (formatOpts.angle * Math.PI) / 180

  return baseHandle(ffmpeg, {
    ...formatOpts,
    execArgs: [
      ...inputFileArgs,
      ...genCommonArgs({
        videoFilter: `rotate=${radians}:bilinear=1`,
        preset: formatOpts.preset,
      }),
      formatOpts.outputFileName,
    ],
  })
}

/** 应用文字水印滤镜 */
export async function drawVideoText(
  ffmpeg: FFmpeg,
  opts: Optional<DrawVideoTextOpts, 'inputFileNames'>,
): Promise<Blob> {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(opts.source)

  const formatOpts = {
    ...opts,
    inputFileNames,
    outputFileName: opts.outputFileName ?? 'output.mp4',
    fontColor: opts.fontColor ?? 'white',
    x: opts.x ?? '(w-text_w)/2',
    y: opts.y ?? '(h-text_h)/2',
    fontFileSource: opts.fontFileSource ?? new URL('/和田研中丸.ttf', import.meta.url).href,
    fontFileNameInFS: opts.fontFileNameInFS ?? 'font.ttf',
  }

  if (!formatOpts.fontFileSource) {
    throw new Error('必须提供字体文件 (fontFileSource) 才能使用 drawtext 滤镜')
  }
  if (!formatOpts.text) {
    throw new Error('文字内容不能为空')
  }

  /** 转义特殊字符 */
  const escapedText = escapeFFmpegText(formatOpts.text)
  /** 将要清理的文件列表 */
  const filesToClear: string[] = [...inputFileNames, formatOpts.outputFileName]
  if (formatOpts.fontFileNameInFS) {
    filesToClear.push(formatOpts.fontFileNameInFS)
  }

  // 1. 加载输入视频文件
  for (let i = 0; i < opts.source.length; i++) {
    const item = opts.source[i]
    const inputFileData = await fetchFile(item)
    await writeFFmpeg(ffmpeg, inputFileNames[i], inputFileData)
  }

  // 2. 加载字体文件
  const fontFileData = await fetchFile(formatOpts.fontFileSource)
  await writeFFmpeg(ffmpeg, formatOpts.fontFileNameInFS, fontFileData)

  // 3. 构建 drawtext 滤镜参数
  const drawTextOptions = [ // Renamed to avoid confusion with the filter name itself
    `fontfile=${formatOpts.fontFileNameInFS}`, // 指定字体文件路径 (在FS中)
    `text='${escapedText}'`,
    `fontsize=${formatOpts.fontSize}`,
    `fontcolor=${formatOpts.fontColor}`,
    `x=${formatOpts.x}`,
    `y=${formatOpts.y}`,
  ]
  const vfArgument = `drawtext=${drawTextOptions.join(':')}`

  return baseHandle(ffmpeg, {
    ...formatOpts,
    clearList: filesToClear,
    execArgs: [
      ...inputFileArgs,
      ...genCommonArgs({
        videoFilter: vfArgument,
        preset: formatOpts.preset,
      }),
      formatOpts.outputFileName,
    ],
  })
}

export interface RotateVideoOpts extends BaseFilterOpts {
  /** 旋转角度 (度数, e.g., 90, 180, -90) */
  angle: number
}

export interface DrawVideoTextOpts extends BaseFilterOpts {
  text: string
  fontSize?: number
  fontColor?: string
  x?: string
  y?: string
  /**
   * 字体文件源 (File, Blob, URL)
   * 这是必须的，因为 ffmpeg.wasm 无法访问系统字体
   */
  fontFileSource?: File | Blob | string
  /**
   * 在 FFmpeg 虚拟文件系统中为字体文件指定的名字，例如 'customfont.ttf'
   * 确保这个名字不与输入/输出文件名冲突，如果它们在根目录
   */
  fontFileNameInFS?: string
}

export type TrimVideoOpts = {
  startTime?: number
  duration: number
}
& BaseFilterOpts

export type CaptureFrameOpts = {
  timestamp?: number
}
& BaseFilterOpts
