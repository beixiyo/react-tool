export enum Workflow {
  /** 扩图 */
  EXPAND = 'outpaint_PhotoG',
  /** 抠图 */
  CUTOUT = 'remove_bg',
  /** 消除 */
  REMOVE = 'paint_remove',
  /** 局部重绘 */
  INPAINT = 'inpaint',
}

export enum Mode {
  /** 扩图 */
  EXPAND = 'expand',
  /** 抠图 */
  CUTOUT = 'cutout',
  /** 消除 */
  REMOVE = 'remove',
  /** 局部重绘 */
  INPAINT = 'inpaint',
}

export enum Tools {
  SELECTION = 'selection',
  /** 笔刷 */
  BRUSH = 'brush',
  /** 橡皮擦 */
  ERASER = 'eraser',
  /** 撤销 */
  UNDO = 'undo',
  /** 重做 */
  REDO = 'redo',
  /** 清除 */
  CLEAR = 'clear',
  /** 重置定位 */
  RESET = 'reset',
  /** 拖动 */
  DRAG = 'drag',
  /** 下载 */
  DOWNLOAD = 'download',
  /** 上传 */
  UPLOAD = 'upload',
}

export const PersistableTools = [
  Tools.SELECTION,
  Tools.BRUSH,
  Tools.ERASER,
  Tools.DRAG,
] as const
export const Pon_persistableTools = [
  Tools.UNDO,
  Tools.REDO,
  Tools.CLEAR,
  Tools.RESET,
  Tools.DOWNLOAD,
  Tools.UPLOAD,
] as const

export enum SizeRatio {
  CUSTOM = 'custom',
  ONE_TO_ONE = '1:1',
  THREE_TO_TWO = '3:2',
  TWO_TO_THREE = '2:3',
  FOUR_TO_THREE = '4:3',
  THREE_TO_FOUR = '3:4',
  SISTEEN_TO_NINE = '16:9',
  NINE_TO_SIXTEEN = '9:16',
}

export const MAX_IMAGE_WIDTH = 4096
export const MAX_IMAGE_HEIGHT = 4096

export const DEFAULT_STROKE_WIDTH = 50
export const BRUSH_COLOR = `rgba(116, 227, 227, ${127 / 255})`
