import type { Canvas, FabricImage, StaticCanvas } from 'fabric'

export type DrawImgOpts = {
  /**
   * 绘制之前回调图片给你，你可以设置图片参数
   */
  beforeDraw?: (img: FabricImage, minScale: number, scaleX: number, scaleY: number) => void
  /**
   * 绘制之后回调图片给你，你可以设置图片参数
   */
  afterDraw?: (img: FabricImage, minScale: number, scaleX: number, scaleY: number) => void
  /**
   * 是否先清除画布
   * @default false
   */
  needClear?: boolean
  /**
   * 是否渲染
   * @default true
   */
  needRenderAll?: boolean
  /**
   * 是否居中
   * @default false
   */
  center?: boolean
  /**
   * 自适应大小
   * @default false
   */
  autoFit?: boolean
}

export type FabricCanvas = Canvas | StaticCanvas
