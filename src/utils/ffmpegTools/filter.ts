import type { FFmpeg } from '@ffmpeg/ffmpeg'
import type { Optional } from '@jl-org/ts-tool'
import type { BaseFilterOpts, CommonArgsOpts } from './types'
import { baseHandle } from './baseHandle'
import { genCommonArgs } from './config'
import { getInputArgs } from './tools'

export function baseFilter(
  ffmpeg: FFmpeg,
  filterName: string,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
  commonArgsOpts: CommonArgsOpts = {},
) {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(filterOpts.source)

  const formatOpts = {
    ...filterOpts,
    inputFileNames,
    outputFileName: filterOpts.outputFileName ?? 'output.mp4',
  }

  return baseHandle(ffmpeg, {
    ...formatOpts,
    execArgs: [
      ...inputFileArgs,
      ...genCommonArgs({
        videoFilter: filterName,
        preset: formatOpts.preset,
        ...commonArgsOpts,
      }),
      formatOpts.outputFileName,
    ],
  })
}

/** 灰度滤镜 */
export async function grayscaleFilter(
  ffmpeg: FFmpeg,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  return baseFilter(ffmpeg, 'format=gray', filterOpts)
}

/** 冷色滤镜 */
export async function coolFilter(
  ffmpeg: FFmpeg,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  return baseFilter(ffmpeg, 'colorbalance=rs=-0.5:bs=0.7,format=yuv420p', filterOpts, { threads: 1 })
}

/** 暖色滤镜 */
export async function warmFilter(
  ffmpeg: FFmpeg,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  return baseFilter(ffmpeg, 'colorbalance=rs=0.3:gs=-0.1:bs=-0.3,format=yuv420p', filterOpts, { threads: 1 })
}

/** 复古褪色 */
export async function vintageFilter(
  ffmpeg: FFmpeg,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  return baseFilter(ffmpeg, 'curves=preset=vintage,format=yuv420p', filterOpts)
}

/** 素描效果 */
export async function sketchFilter(
  ffmpeg: FFmpeg,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  return baseFilter(ffmpeg, 'edgedetect=mode=colormix:low=0.1:high=0.3,format=yuv420p', filterOpts, { threads: 1 })
}

/** 锐化 */
export async function sharpenFilter(
  ffmpeg: FFmpeg,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  return baseFilter(ffmpeg, 'unsharp=3:3:1.5,format=yuv420p', filterOpts)
}

/** 鱼眼效果 */
export async function fisheyeFilter(
  ffmpeg: FFmpeg,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  return baseFilter(ffmpeg, 'lenscorrection=k1=-0.25:k2=-0.15,format=yuv420p', filterOpts)
}

/** 水平镜像效果 */
export async function flipHorizontalFilter(
  ffmpeg: FFmpeg,
  filterOpts: Optional<BaseFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  return baseFilter(ffmpeg, 'hflip', filterOpts)
}

/** 应用亮度、对比度、饱和度滤镜 */
export async function eQFilter(
  ffmpeg: FFmpeg,
  opts: Optional<EQFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(opts.source)

  const formatOpts = {
    ...opts,
    inputFileNames,
    outputFileName: opts.outputFileName ?? 'output.mp4',
    brightness: opts.brightness ?? 0,
    contrast: opts.contrast ?? 1,
    saturation: opts.saturation ?? 1,
    gamma: opts.gamma ?? 1,
  }

  const eqParams: string[] = []
  if (typeof formatOpts.brightness === 'number')
    eqParams.push(`brightness=${formatOpts.brightness}`)

  if (typeof formatOpts.contrast === 'number')
    eqParams.push(`contrast=${formatOpts.contrast}`)

  if (typeof formatOpts.saturation === 'number')
    eqParams.push(`saturation=${formatOpts.saturation}`)

  if (typeof formatOpts.gamma === 'number')
    eqParams.push(`gamma=${formatOpts.gamma}`)

  const vfArgs = `eq=${eqParams.join(':')}`

  return baseHandle(ffmpeg, {
    ...formatOpts,
    execArgs: [
      ...inputFileArgs,
      ...genCommonArgs({
        videoFilter: vfArgs,
        preset: formatOpts.preset,
      }),
      formatOpts.outputFileName,
    ],
  })
}

/** 应用模糊滤镜 */
export async function blurFilter(
  ffmpeg: FFmpeg,
  opts: Optional<BlurFilterOpts, 'inputFileNames'>,
): Promise<Blob> {
  const {
    inputFileArgs,
    inputFileNames,
  } = getInputArgs(opts.source)

  const formatOpts = {
    ...opts,
    inputFileNames,
    outputFileName: opts.outputFileName ?? 'output_blur.mp4',
    blurType: opts.blurType ?? 'gblur',
    radius: opts.radius ?? 5,
    sigma: opts.sigma ?? 2,
  }

  let blurFilterString = ''
  if (formatOpts.blurType === 'boxblur') {
    blurFilterString = `boxblur=${formatOpts.radius}:${formatOpts.radius}`
  }
  else {
    blurFilterString = `gblur=sigma=${formatOpts.sigma}`
  }

  return baseHandle(ffmpeg, {
    ...formatOpts,
    execArgs: [
      ...inputFileArgs,
      ...genCommonArgs({
        videoFilter: blurFilterString,
        preset: formatOpts.preset,
      }),
      formatOpts.outputFileName,
    ],
  })
}

/** 亮度、对比度、饱和度滤镜选项 */
export interface EQFilterOpts extends BaseFilterOpts {
  /** 亮度: -1.0 到 1.0 (通常 0 是原样) */
  brightness?: number
  /** 对比度: -2.0 到 2.0 (通常 1 是原样) */
  contrast?: number
  /** 饱和度: 0.0 到 3.0 (通常 1 是原样) */
  saturation?: number
  /** Gamma: 0.1 到 10.0 (通常 1 是原样) */
  gamma?: number
}

/** 模糊滤镜选项 */
export interface BlurFilterOpts extends BaseFilterOpts {
  blurType?: 'boxblur' | 'gblur'
  /** boxblur: 模糊半径 (e.g., 5) */
  radius?: number
  /** gblur: Sigma值, 控制模糊强度 (e.g., 0.5 to 5) */
  sigma?: number
}
