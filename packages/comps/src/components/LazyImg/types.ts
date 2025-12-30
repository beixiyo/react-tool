import type { MotionProps } from 'framer-motion'

export type LazyImgProps = {
  className?: string
  imgClassName?: string
  style?: React.CSSProperties
  imgStyle?: React.CSSProperties
  children?: React.ReactNode
  lazy?: boolean
  src: string
  loadingSrc?: string
  errorSrc?: string
  errorText?: string
  loadingText?: string
  keepAspect?: boolean
  /**
   * 是否可预览
   * @default true
   */
  previewable?: boolean
}
& Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'src'>
& MotionProps
