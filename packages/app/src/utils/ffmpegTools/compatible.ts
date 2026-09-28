/**
 * @version 0.12.15
 */
import type { FFMessageLoadConfig, ProgressEventCallback } from '@ffmpeg/ffmpeg'
import { FFmpeg } from '@ffmpeg/ffmpeg'

export function disposeFFmpeg(ffmpeg: FFmpeg) {
  return ffmpeg.terminate()
}

export async function writeFFmpeg(
  ffmpeg: FFmpeg,
  filename: string,
  data: Uint8Array | string,
) {
  return ffmpeg.writeFile(filename, data)
}

export async function readFFmpeg(
  ffmpeg: FFmpeg,
  filename: string,
) {
  return ffmpeg.readFile(filename)
}

export async function rmFFmpeg(
  ffmpeg: FFmpeg,
  filename: string,
) {
  return ffmpeg.deleteFile(filename)
}

export async function execFFmpeg(ffmpeg: FFmpeg, args: string[]) {
  return ffmpeg.exec(args)
}

export function progressFFmpeg(
  ffmpeg: FFmpeg,
  onProgress: ProgressEventCallback,
) {
  return ffmpeg.on('progress', (...args) => {
    onProgress(...args)
  })
}

export async function createFFmpeg(options: FFMessageLoadConfig) {
  const ffmpeg = new FFmpeg()
  await ffmpeg.load(options)
  return ffmpeg
}

/**
 * @version 0.11.6
 */
// import type { FFmpeg, ProgressCallback } from '@ffmpeg/ffmpeg'

// export function disposeFFmpeg(ffmpeg: FFmpeg) {
//   return ffmpeg.exit()
// }

// export async function writeFFmpeg(
//   ffmpeg: FFmpeg,
//   filename: string,
//   data: Uint8Array | string,
// ) {
//   return ffmpeg.FS('writeFile', filename, data)
// }

// export async function readFFmpeg(
//   ffmpeg: FFmpeg,
//   filename: string,
// ) {
//   return ffmpeg.FS('readFile', filename)
// }

// export async function rmFFmpeg(
//   ffmpeg: FFmpeg,
//   filename: string,
// ) {
//   return ffmpeg.FS('unlink', filename)
// }

// export async function execFFmpeg(ffmpeg: FFmpeg, args: string[]) {
//   return ffmpeg.run(...args)
// }

// export function progressFFmpeg(
//   ffmpeg: FFmpeg,
//   onProgress: ProgressCallback,
// ) {
//   return ffmpeg.setProgress(onProgress)
// }

// export async function createFFmpeg(options: FFmpeg.CreateFFmpegOptions) {
//   const ffmpeg = FFmpeg.createFFmpeg(options)
//   await ffmpeg.load()
//   return ffmpeg
// }
