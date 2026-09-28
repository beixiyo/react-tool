import type { FFmpeg } from '@ffmpeg/ffmpeg'
import type { Optional } from '@jl-org/ts-tool'
import { baseFilter } from './filter'
import type { BaseFilterOpts } from './types'

/**
 * 从黑色淡入
 */
export function fadeInWithBlack(
  ffmpeg: FFmpeg,
  opts: Optional<BaseFilterOpts, 'inputFileNames'>,
) {
  return baseFilter(ffmpeg, 'fade=type=in:start_time=0:duration=2:color=black', opts)
}
