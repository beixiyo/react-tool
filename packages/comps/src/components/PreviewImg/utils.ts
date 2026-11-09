/**
 * PreviewImg 私有工具：图片取回与剪贴板写入
 */

/**
 * 取回图片二进制
 *
 * 失败抛错，由调用方决定回退策略（下载退直链、复制给失败提示）
 */
export async function fetchImageBlob(src: string): Promise<Blob> {
  const resp = await fetch(src)
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`)

  return resp.blob()
}

/**
 * 把图片复制到系统剪贴板（统一写成 PNG）
 *
 * - Safari 的剪贴板只接受 `image/png`，且要求 `ClipboardItem` 里装 Promise
 *   以保持用户手势上下文，所以异步取图 / 转码都以 Promise 形式传入
 * - 取图失败、转码失败或剪贴板不可用时抛错
 */
export async function copyImageToClipboard(src: string): Promise<void> {
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': fetchAsPngBlob(src) }),
  ])
}

/** 取图后统一转成 PNG（已是 PNG 则原样返回） */
async function fetchAsPngBlob(src: string): Promise<Blob> {
  const blob = await fetchImageBlob(src)
  return blob.type === 'image/png'
    ? blob
    : toPngBlob(blob)
}

/** 经 canvas 转码成 PNG，让剪贴板只承载一种格式 */
async function toPngBlob(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)

  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas 2d context')
    ctx.drawImage(bitmap, 0, 0)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error('Failed to encode PNG')),
        'image/png',
      )
    })
  }
  finally {
    bitmap.close()
  }
}
