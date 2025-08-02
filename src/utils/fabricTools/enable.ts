import type { Canvas, TPointerEvent, TPointerEventInfo } from 'fabric'
import { BRUSH_COLOR } from '@/config'
import { PencilBrush, Point } from 'fabric'
import { getCursor } from './cursor'

/**
 * 开启涂抹
 */
export function enableDraw(
  canvas: Canvas,
  setBrush?: (brush: PencilBrush) => void,
) {
  canvas.isDrawingMode = true

  const brush = new PencilBrush(canvas)
  brush.canvas.freeDrawingCursor = getCursor()
  brush.width = 40
  brush.color = BRUSH_COLOR
  brush.limitedToCanvasSize = true

  setBrush?.(brush)
  canvas.freeDrawingBrush = brush
}

/**
 * 开启擦除，EraserBrush 需要手动构建
 * @link http://fabricjs.com/build/
 */
// export function enableEraser(
//     canvas: Canvas,
//     setBrush?: (brush: EraserBrush) => void
// ) {
//     canvas.isDrawingMode = true

//     const brush = new EraserBrush(canvas)
//     brush.canvas.freeDrawingCursor = getCursor()
//     brush.width = 40
//     brush.color = BRUSH_COLOR

//     setBrush?.(brush)
//     canvas.freeDrawingBrush = brush

//     // 恢复被擦除的地方模式
//     // canvas.freeDrawingBrush.inverted = true
// }

const IS_BIND_WHEEL = Symbol('isBindWheel')
/**
 * 开启缩放功能
 */
export function enableScale(
  canvas: Canvas,
  opts: {
    brushWidth?: number
  } = {},
) {
  canvas.isDrawingMode = false
  const {
    brushWidth = 40,
  } = opts

  /** 避免重复绑定事件 */
  if ((canvas as any)[IS_BIND_WHEEL]) {
    return
  }
  (canvas as any)[IS_BIND_WHEEL] = true

  canvas.on('mouse:wheel', (event) => {
    const delta = event.e.deltaY
    let zoom = canvas.getZoom()
    zoom *= 0.999 ** delta // 根据滚轮增量调整缩放比例
    zoom = Math.min(20, Math.max(0.01, zoom)) // 限制缩放范围

    const point = new Point(event.e.offsetX, event.e.offsetY)
    canvas.zoomToPoint(point, zoom)

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = Math.max(brushWidth / zoom, 2)
    }

    event.e.preventDefault()
    event.e.stopPropagation()
  })
}

const IS_DRAGGING = Symbol('isDragging')
const START_POINT = Symbol('startPoint')
/**
 * 开启整个 fabric 画布拖拽
 */
export function enableCanvasDrag(canvas: Canvas) {
  /**
   * 事件
   */
  const mouseDown = (e: TPointerEventInfo<TPointerEvent>) => {
    const mouseEvent = e.e as MouseEvent

    (canvas as any)[IS_DRAGGING] = true;
    (canvas as any)[START_POINT] = {
      x: mouseEvent.offsetX,
      y: mouseEvent.offsetY,
    }
  }

  const mouseUp = (e: TPointerEventInfo<TPointerEvent>) => {
    if (!(canvas as any)[IS_DRAGGING]) {
      return
    }

    (canvas as any)[IS_DRAGGING] = false
    /** 设置此画布实例的视口转换 */
    canvas.setViewportTransform(canvas.viewportTransform)
  }

  const mouseMove = (e: TPointerEventInfo<TPointerEvent>) => {
    if (!(canvas as any)[IS_DRAGGING]) {
      return
    }

    const mouseEvent = e.e as MouseEvent
    const vpt = canvas.viewportTransform // 聚焦视图的转换

    vpt[4] += mouseEvent.offsetX - (canvas as any)[START_POINT].x
    vpt[5] += mouseEvent.offsetY - (canvas as any)[START_POINT].y
    canvas.requestRenderAll();

    (canvas as any)[START_POINT] = {
      x: mouseEvent.offsetX,
      y: mouseEvent.offsetY,
    }
  }

  const mouseLeave = () => (canvas as any)[IS_DRAGGING] = false

  /**
   * ================================================
   * 导出的控制函数
   */
  const enable = () => {
    disableAllSelect(canvas)

    canvas.isDrawingMode = false
    canvas.defaultCursor = 'grab'
    canvas.getObjects().forEach(obj => obj.hoverCursor = 'grab')

    canvas.on('mouse:move', mouseMove)
    canvas.on('mouse:down', mouseDown)
    canvas.on('mouse:up', mouseUp)
    canvas.contextTop.canvas.addEventListener('mouseleave', mouseLeave)
  }

  const disable = () => {
    (canvas as any)[IS_DRAGGING] = false

    enableAllSelect(canvas)
    canvas.getObjects().forEach(obj => obj.hoverCursor = 'default')

    canvas.off('mouse:move', mouseMove)
    canvas.off('mouse:down', mouseDown)
    canvas.off('mouse:up', mouseUp)
    canvas.contextTop.canvas.removeEventListener('mouseleave', mouseLeave)
  }

  return {
    enable,
    disable,
  }
}

/**
 * 禁用所有对象的选中功能
 */
export function disableAllSelect(canvas: Canvas) {
  return canvas.getObjects().forEach(obj => obj.selectable = false)
}

/**
 * 启用所有对象的选中功能
 */
export function enableAllSelect(canvas: Canvas) {
  return canvas.getObjects().forEach(obj => obj.selectable = true)
}
