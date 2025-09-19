import type { Canvas } from 'fabric'
import { composeImg } from '@jl-org/cvs'
import { colorAddOpacity, createCvs, getImg, getScale, mixColor } from '@jl-org/tool'
import { Vibrant } from 'node-vibrant/browser'

/**
 * 创建背景遮罩层
 * @param canvas
 * @param imageUrl
 * @param opacity
 */
export async function createPosterMask(
  canvas: Canvas,
  imageUrl: string,
  opacity = 0.2,
): Promise<string> {
  // 1. 提取主色调
  const palette = await Vibrant.from(imageUrl).getPalette()
  const mainColor = palette.Vibrant?.hex || '#ffffff' // 备选白色

  // 2. 混合颜色
  let blendedColor = mixColor(mainColor, 'rgba(0, 0, 0)')
  blendedColor = colorAddOpacity(blendedColor, opacity)

  const maskUrl = getBgUrl()
  const scaledImg = await scaleImg()

  return composeImg(
    [
      { src: scaledImg },
      { src: maskUrl },
    ],
    canvas.width,
    canvas.height,
  )

  function getBgUrl() {
    const { ctx, cvs } = createCvs(canvas.width, canvas.height)
    ctx.fillStyle = blendedColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    return cvs.toDataURL()
  }

  async function scaleImg() {
    const img = await getImg(imageUrl)
    if (!img)
      throw new Error('图片加载失败')

    const { minScale } = getScale(
      { width: img.naturalWidth, height: img.naturalHeight },
      { width: canvas.width, height: canvas.height },
    )

    const { ctx, cvs } = createCvs(canvas.width, canvas.height)
    ctx.drawImage(
      img,
      (canvas.width - img.naturalWidth * minScale) / 2,
      (canvas.height - img.naturalHeight * minScale) / 2,
      img.naturalWidth * minScale,
      img.naturalHeight * minScale,
    )

    return cvs.toDataURL()
  }
}
