import type { FFmpeg } from '@ffmpeg/ffmpeg'
import type { Optional } from '@jl-org/ts-tool'
import type { BaseFilterOpts } from './types'
import { baseFilter } from './filter'

/**
 * 从黑色淡入
 */
export function fadeInWithBlack(
  ffmpeg: FFmpeg,
  opts: Optional<BaseFilterOpts, 'inputFileNames'>,
) {
  return baseFilter(ffmpeg, 'fade=type=in:start_time=0:duration=2:color=black', opts)
}
