import type { Canvas, FabricObject, TEvent, TPointerEvent } from 'fabric'
import type { DrawImgOpts } from './types'
import { FabricImage, IText, Path, Text, Textbox } from 'fabric'

/**
 * 绘制背景图像
 * @param canvas
 * @param src
 */
export async function drawBgImg(
  canvas: Canvas,
  src: string,
  {
    beforeDraw,
    afterDraw,
    needClear = false,
    needRenderAll = true,
    autoFit,
    center,
  }: DrawImgOpts = {},
) {
  const img = await FabricImage.fromURL(src, { crossOrigin: 'anonymous' })
  img.set({ selectable: false })

  const imgWidth = img.width
  const imgHeight = img.height
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height

  const scaleX = canvasWidth / imgWidth
  const scaleY = canvasHeight / imgHeight
  const minScale = Math.min(scaleX, scaleY)

  beforeDraw?.(img, minScale, scaleX, scaleY)

  img.set({
    ...(autoFit && {
      scaleX: minScale,
      scaleY: minScale,
    }),
    ...(center && {
      left: (canvasWidth - imgWidth * minScale) / 2,
      top: (canvasHeight - imgHeight * minScale) / 2,
    }),
    /** 不允许被擦除 */
    erasable: false,
  })

  needClear && canvas.clear()
  canvas.backgroundImage = img
  needRenderAll && canvas.renderAll()

  afterDraw?.(img, minScale, scaleX, scaleY)
}

/**
 * 添加图片
 */
export async function addImg(
  canvas: Canvas,
  src: string,
  {
    beforeDraw,
    afterDraw,
    needClear = false,
    needRenderAll = true,
    autoFit,
    center,
  }: DrawImgOpts = {},
) {
  const img = await FabricImage.fromURL(src, { crossOrigin: 'anonymous' })

  const imgWidth = img.width
  const imgHeight = img.height
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height

  const scaleX = canvasWidth / imgWidth
  const scaleY = canvasHeight / imgHeight
  const minScale = Math.min(scaleX, scaleY)

  beforeDraw?.(img, minScale, scaleX, scaleY)

  img.set({
    ...(autoFit && {
      scaleX: minScale,
      scaleY: minScale,
    }),
    ...(center && {
      left: (canvasWidth - imgWidth * minScale) / 2,
      top: (canvasHeight - imgHeight * minScale) / 2,
    }),
  })

  needClear && canvas.clear()
  canvas.add(img)
  needRenderAll && canvas.renderAll()

  afterDraw?.(img, minScale, scaleX, scaleY)
}

/**
 * 删除选中元素
 */
export function delSelected(canvas: Canvas) {
  const activeObjects = canvas.getActiveObjects()
  canvas.remove(...activeObjects)
  canvas.discardActiveObject()
  canvas.renderAll()
}

/**
 * ## 缩放后调用它进行复位
 *
 * - 设置初始视图变换矩阵：默认情况下，js 使用一个 2D 矩阵表示画布的视图变换
 * - 初始值为 [1, 0, 0, 1, 0, 0]，表示缩放为 1，没有平移
 * - 调用 setViewportTransform 方法：使用 [1, 0, 0, 1, 0, 0] 来复位视图
 */
export function resetFabric(canvas: Canvas) {
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
  canvas.renderAll()
}

/**
 * 获取 fabric 元素的矩形信息
 */
export function getFabricElRect(el: FabricObject) {
  const { left, top, width, height } = el.getBoundingRect()
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  }
}

/**
 * 添加新文本并确保不重叠
 */
export function addText(
  canvas: Canvas,
  options: AddTextParams = {},
) {
  const {
    text = 'Edit text',
    renderAll = true,
    overlapExtraLeft = 24,
    overlapExtraTop = 24,
    overlapAddDir = 'top',
    getLastEl,
    ...rest
  } = options

  try {
    /** 默认起始位置 */
    let newLeft = rest.left ?? 20
    let newTop = rest.top ?? 20

    if (getLastEl) {
      const lastTextbox = getLastEl()

      /** 如果传入的比较位置的元素，则基于它计算新位置 */
      if (lastTextbox) {
        const lastBounds = getFabricElRect(lastTextbox)
        if (overlapAddDir === 'left') {
          newLeft = lastBounds.left + overlapExtraLeft
        }
        else if (overlapAddDir === 'top') {
          newTop = lastBounds.top + overlapExtraTop
        }
      }
    }

    /** 创建新文本框 */
    const newTextbox = new Textbox(text, {
      left: newLeft,
      top: newTop,
      fontFamily: 'Arial',
      // splitByGrapheme: true, // 启用多字节字符换行
      textAlign: 'left',
      fill: '#000',
      fontSize: 20,
      width: canvas.width - (canvas.width / 10),
      ...rest,
    })

    /** 碰撞检测 */
    const newBounds = getFabricElRect(newTextbox)
    const isOverlapping = canvas.getObjects().some((obj) => {
      const objBounds = getFabricElRect(obj)
      if (obj === newTextbox)
        return false

      return (
        newBounds.left < objBounds.right
        && newBounds.top >= objBounds.top
        && newBounds.top <= objBounds.bottom
      )
    })

    /** 处理重叠 */
    if (isOverlapping) {
      console.warn('检测到文本重叠，自动调整位置')
      if (overlapAddDir === 'left') {
        newLeft += overlapExtraLeft // 增加额外间距
      }
      else if (overlapAddDir === 'top') {
        newTop += overlapExtraTop // 增加额外间距
      }
    }

    /** 限制最大范围不超过画布，防止元素不可见 */
    const { width, height } = canvas
    if (
      newLeft < 0
      || newTop < 0
      || newLeft + newBounds.width > width
      || newTop + newBounds.height > height
    ) {
      console.warn('文本超出画布范围，自动调整位置')
      if (newBounds.left < 0) {
        newLeft = 0
      }
      if (newBounds.top < 0) {
        newTop = 0
      }
      if (newLeft + newBounds.width > width) {
        newLeft = width - newBounds.width
      }
      if (newTop + newBounds.height > height) {
        newTop = height - newBounds.height
      }
    }

    /** 设置位置并添加到画布 */
    newTextbox.set({ left: newLeft, top: newTop })
    canvas.add(newTextbox)
    renderAll && canvas.renderAll()

    return newTextbox
  }
  catch (error) {
    console.error('添加文本失败:', error)
    return null
  }
}

/**
 * 文本被选中时改变颜色
 */
export function handleTextSelection(canvas: Canvas, color: string, onSet?: VoidFunction) {
  canvas.getActiveObjects().forEach((obj) => {
    if (obj instanceof Text || obj instanceof IText || obj instanceof Textbox) {
      /** 修改选中文本的颜色 */
      obj.set('fill', color)
      canvas.renderAll()
      onSet?.()
    }
    else if (obj instanceof Path) {
      /** 修改选中路径（笔画）的颜色 */
      obj.set('stroke', color)
      canvas.renderAll()
      onSet?.()
    }
  })
}

/**
 * 文本被选中时，同步修改颜色
 */
export function listenTextSelection(canvas: Canvas, color: string, onSet?: VoidFunction) {
  function handleSelection(options: Partial<TEvent<TPointerEvent>> & {
    selected: FabricObject[]
  }) {
    options.selected.forEach((obj) => {
      if (obj instanceof Text || obj instanceof IText || obj instanceof Textbox) {
        /** 修改选中文本的颜色 */
        obj.set('fill', color)
        canvas.renderAll()
        onSet?.()
      }
      else if (obj instanceof Path) {
        /** 修改选中路径（笔画）的颜色 */
        obj.set('stroke', color)
        canvas.renderAll()
        onSet?.()
      }
    })
  }

  /** 监听选中事件 */
  canvas.on('selection:created', handleSelection)
  canvas.on('selection:updated', handleSelection)

  return () => {
    canvas.off('selection:created', handleSelection)
    canvas.off('selection:updated', handleSelection)
  }
}

type AddTextParams = ConstructorParameters<typeof Textbox>[1] & {
  text?: string
  renderAll?: boolean
  /**
   * 如果重叠，增加额外的顶部间距
   * @default 24
   */
  overlapExtraTop?: number
  /**
   * 如果重叠，增加额外的左侧间距
   * @default 24
   */
  overlapExtraLeft?: number
  /**
   * 如果重叠，增加的方向
   * @default 'top'
   */
  overlapAddDir?: 'top' | 'left'
  /**
   * 获取上一个元素，用来和当前文本比较位置
   */
  getLastEl?: () => FabricObject | null
}
