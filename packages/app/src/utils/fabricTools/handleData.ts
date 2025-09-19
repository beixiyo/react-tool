import type { TDataUrlOptions } from 'fabric'
import type { FabricCanvas } from './types'

/**
 * 获取所有图像，背景图 + 图片
 */
export function exportAllImg(canvas: FabricCanvas, options?: TDataUrlOptions) {
  const base64 = canvas.toDataURL(options)
  return base64
}

/**
 * 忽略背景图导出
 */
export function exportImg(canvas: FabricCanvas, options?: TDataUrlOptions) {
  const currentBg = canvas.backgroundImage
  /** 移除背景图像 */
  canvas.backgroundImage = undefined

  const maskURI = canvas.toDataURL(options)
  /** 恢复背景图像 */
  canvas.backgroundImage = currentBg
  canvas.renderAll()

  return maskURI
}

/**
 * 单独导出图片
 */
export function exportOnlyImg(canvas: FabricCanvas, options?: TDataUrlOptions) {
  canvas.forEachObject((obj) => {
    if (obj.type === 'image') {
      obj.visible = true // 显示背景图片
    }
    else {
      obj.visible = false // 隐藏其他所有对象
    }
  })
  const backgroundDataURL = canvas.toDataURL(options)

  /** 恢复显示所有内容 */
  canvas.forEachObject((obj) => {
    obj.visible = true
  })
  canvas.renderAll()

  return backgroundDataURL
}

/**
 * 导出除了图片外的元素
 */
export function exportExcludeImg(canvas: FabricCanvas, options?: TDataUrlOptions) {
  canvas.forEachObject((obj) => {
    if (obj.type === 'image') {
      obj.visible = false // 隐藏背景图片
    }
    else {
      obj.visible = true // 显示涂抹内容
    }
  })
  const maskDataURL = canvas.toDataURL(options)

  /** 恢复显示所有内容 */
  canvas.forEachObject((obj) => {
    obj.visible = true
  })
  canvas.renderAll()

  return maskDataURL
}

/**
 * 导出 JSON 数据
 */
export function exportJson(canvas: FabricCanvas) {
  return canvas.toJSON()
}

/**
 * 加载 JSON 数据
 */
export function loadJson(canvas: FabricCanvas, json: string) {
  canvas.loadFromJSON(json).then(() => {
    canvas.renderAll()
  })
}
