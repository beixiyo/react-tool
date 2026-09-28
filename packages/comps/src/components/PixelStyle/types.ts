/**
 * PixelStyle 类型声明
 */

export interface PixelStyleProps {
  /** 是否启用像素化效果 */
  isPixelActive: boolean
  /** 渐变程度 (px) */
  gradient: number
  /** 像素块大小 (px) */
  pixelSize: number
  /** 背景模糊程度 (px) */
  blurDrop: number
  /** 需要应用像素效果的内容 */
  children: React.ReactNode
  /** 自定义像素覆盖层的类名 */
  pixelOverlayClassName?: string
  /** 自定义像素覆盖层的内联样式 */
  pixelOverlayStyle?: React.CSSProperties
}
