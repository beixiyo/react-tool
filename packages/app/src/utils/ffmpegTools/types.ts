export type OnProgress = (progress: number) => void

export type FFmpegSource = string | File

export type InputFile = {
  name: string
  source: FFmpegSource
}

export type FFmpegPreset =
  | 'ultrafast'
  | 'superfast'
  | 'faster'
  | 'fast'
  | 'medium'
  | 'slow'
  | 'slower'
  | 'veryslow'

export type FFmpegTune =
  | 'film'
  | 'animation'
  | 'grain'
  | 'stillimage'
  | 'fastdecode'
  | 'zerolatency'

/** 基础滤镜选项 */
export interface BaseFilterOpts {
  inputFileNames: string[]
  outputFileName?: string
  source: FFmpegSource[]
  /**
   * 编码速度设置
   * @default 'fast'
   */
  preset?: FFmpegPreset
  onProgress?: (progress: number) => void
}

export type CommonArgsOpts = {
  /**
   * 视频滤镜，默认自动 scale 调整视频尺寸为偶数
   * - 尺寸调整：scale
   * - 裁剪：crop
   * - 颜色调整：colorbalance, eq, hue
   * - 格式转换：format
   * - 叠加：overlay (比如加水印)
   * - 旋转/翻转：rotate, hflip, vflip
   * - 速度控制：setpts
   *
   * @example
   * "colorbalance=rs=-0.5:bs=0.7,format=yuv420p"
   */
  videoFilter?: string
  /**
   * 视频质量 (18-28, 越小质量越好)
   * @default 28
   */
  crf?: number
  /**
   * 编码预设
   * @default 'veryfast'
   */
  preset?: FFmpegPreset
  /**
   * 编码速度设置
   * @default 'fastdecode'
   */
  tune?: FFmpegTune
  /**
   * 线程数量
   * @default navigator.hardwareConcurrency || 4
   */
  threads?: number
  /**
   * 音频比特率
   * @default '128k'
   */
  bAudio?: string
  /**
   * 音频编码器
   * @default 'copy'
   */
  cAudio?: string
  /**
   * 视频编码器
   * @default 'libx264'
   */
  cVideo?: string

  /**
   * 是否需要缩放视频尺寸为偶数，避免奇数大小造成无法输出的问题
   * @default true
   */
  needScale?: boolean
  extraArgs?: string[]
}
