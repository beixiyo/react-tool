import type { FabricObject } from 'fabric'
import type { FabricCanvas } from './types'
import { FabricImage } from 'fabric'

/**
 * ## 用于固定画布大小后，导出原始大小的图片
 *
 * - 根据大小比例，创建新的 fabric 画布
 * - 把所有绘制绘制上去，并返回此临时画布
 * - 图片不会缩放，仅缩放其他元素
 *
 * @param tempCanvas 临时画布
 * @param rawCanvas 原始画布
 * @param scaleX 横向比例
 * @param scaleY 纵向比例
 */
export async function adaptCanvasRatio(
  tempCanvas: FabricCanvas,
  rawCanvas: FabricCanvas,
  scaleX: number,
  scaleY: number,
) {
  const objects = rawCanvas.getObjects()
  const clonedObjects = []

  for (const obj of objects) {
    if (obj.type === 'image') {
      // @ts-ignore
      const cloned = await FabricImage.fromURL(obj.getSrc())
      cloned.set({
        scaleX: obj.scaleX * scaleX,
        scaleY: obj.scaleY * scaleY,
        left: obj.left * scaleX,
        top: obj.top * scaleY,
      })
      clonedObjects.push(cloned)
    }
    else {
      const cloned = await obj.clone()
      cloned.set({
        scaleX: obj.scaleX * scaleX,
        scaleY: obj.scaleY * scaleY,
        left: obj.left * scaleX,
        top: obj.top * scaleY,
      })
      clonedObjects.push(cloned)
    }
  }

  tempCanvas.add(...clonedObjects)

  return tempCanvas
}

/**
 * 获取涂抹区域的中心点
 */
export function getSmudgeCenter(imageData: ImageData, width: number) {
  const { data } = imageData
  let totalX = 0
  let totalY = 0
  let count = 0

  /** 遍历每个像素 */
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] // 获取alpha通道的值

    /** 如果像素不透明（alpha > 0），即为涂抹区域 */
    if (alpha > 0) {
      /** 计算像素的x, y坐标 */
      const index = i / 4
      const x = index % width
      const y = Math.floor(index / width)

      totalX += x
      totalY += y
      count++
    }
  }

  /** 计算中心点 */
  if (count === 0) {
    return null // 如果没有涂抹区域，返回null
  }

  const centerX = totalX / count
  const centerY = totalY / count

  return { x: centerX, y: centerY }
}

/**
 * 获取元素绘制层级
 */
export function getLevel(canvas: FabricCanvas, object: FabricObject) {
  return canvas.getObjects().indexOf(object)
}

/**
 * 创建撤销、重做列表
 */
export function createUnReDoList<T>() {
  const undoList = [] as T[]
  const redoList = [] as T[]

  return {
    undoList,
    redoList,

    /** 添加一项 */
    add: (item: T) => {
      undoList.push(item)
      redoList.splice(0)
    },
    /** 获取最后一项 */
    getLast: () => undoList[undoList.length - 1],
    /** 清空 */
    clear: () => {
      undoList.splice(0)
      redoList.splice(0)
    },

    /** 撤销 */
    undo: (callback?: (item: T) => void) => {
      if (undoList.length <= 0)
        return

      redoList.push(undoList.pop()!)
      const item = undoList[undoList.length - 1]
      callback?.(item)
      return item
    },
    /** 重做 */
    redo: (callback?: (item: T) => void) => {
      if (redoList.length <= 0)
        return

      undoList.push(redoList.pop()!)
      const item = undoList[undoList.length - 1]
      callback?.(item)
      return item
    },
  }
}
