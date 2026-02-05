import type { MotionProps } from 'motion/react'
import type React from 'react'

export type LazyImgProps = {
  className?: string
  imgClassName?: string
  style?: React.CSSProperties
  imgStyle?: React.CSSProperties
  children?: React.ReactNode
  lazy?: boolean
  src: string
  /**
   * loading 占位内容，支持传入 JSX
   * @default Skeleton 全屏占位
   */
  loading?: React.ReactNode
  errorSrc?: string
  errorText?: string
  loadingText?: string
  keepAspect?: boolean
  /**
   * 是否可预览
   * @default true
   */
  previewable?: boolean
  /**
   * 预览时显示的图片数组（多图预览）
   * 如果提供此属性，预览时将显示多图轮播，否则只预览单张图片（src）
   */
  previewImages?: string[]
  /**
   * 是否显示缩略图
   * @default true
   */
  showThumbnails?: boolean
  /**
   * 点击遮罩空白区域时是否关闭预览
   * @default true
   */
  previewMaskClosable?: boolean
}
& Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'src' | 'loading'>
& MotionProps
