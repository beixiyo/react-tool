export type ImgThumbnailsOrientation = 'horizontal' | 'vertical'

export interface ImgThumbnailsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 图片数组
   */
  images: string[]
  /**
   * 当前选中的图片索引
   */
  currentIndex: number
  /**
   * 图片切换回调
   */
  onImageChange: (index: number) => void
  /**
   * 自定义类名
   */
  containerClassName?: string
  /**
   * 布局方向
   * @default 'vertical'
   */
  orientation?: ImgThumbnailsOrientation
  /**
   * 隐藏容器外边框（清爽模式）
   * @default false
   */
  hideBorder?: boolean
  /**
   * 隐藏当前项高亮（无边框/阴影/缩放/橙色遮罩）
   * @default false
   */
  hideHighlight?: boolean
}
