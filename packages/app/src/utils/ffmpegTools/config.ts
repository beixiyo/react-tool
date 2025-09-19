import type { CommonArgsOpts } from './types'

/** 确保视频尺寸为偶数，避免奇数大小造成无法输出的问题 */
export const scaleArg = `scale='ceil(iw/2)*2:ceil(ih/2)*2'`

export function genCommonArgs(opts: CommonArgsOpts = {}): string[] {
  const {
    crf = 28,
    preset = 'fast',
    tune = 'fastdecode',
    threads,
    bAudio,
    cAudio = 'copy',
    cVideo = 'libx264',
    videoFilter = '',
    extraArgs = [],
    needScale = true,
  } = opts

  function getVideoFilter() {
    if (!videoFilter) {
      if (!needScale) {
        return []
      }

      return ['-vf', scaleArg]
    }

    if (videoFilter.includes(',')) {
      const filters = videoFilter.split(',')
      filters.push(scaleArg)
      return ['-vf', filters.join(',')]
    }

    return ['-vf', `${videoFilter},${scaleArg}`]
  }

  function getThread() {
    if (threads) {
      return ['-threads', threads.toString()]
    }
    return ['-threads', (navigator.hardwareConcurrency || '4').toString()]
  }

  function getAudioRate() {
    if (!bAudio) {
      return []
    }
    return ['-b:a', bAudio]
  }

  return [
    ...extraArgs, // 额外参数

    '-crf',
    crf.toString(), // 视频质量 (18-28, 越小质量越好)

    '-preset',
    preset, // 编码预设

    ...getVideoFilter(), // 视频滤镜，确保视频尺寸为偶数

    '-tune',
    tune,

    ...getThread(),

    '-c:a',
    cAudio, // 使用 AAC 音频编码器

    '-c:v',
    cVideo, // 使用 H.264 编码器

    ...getAudioRate(), // 音频比特率

    // '-movflags', // 允许视频在下载整个文件之前开始播放
    // '+faststart', // 允许视频在下载整个文件之前开始播放
  ]
}
