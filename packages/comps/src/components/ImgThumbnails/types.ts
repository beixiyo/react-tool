export type ImgThumbnailsOrientation = 'horizontal' | 'vertical'

export interface ImgThumbnailsProps {
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
  className?: string
  /**
   * 布局方向
   * @default 'vertical'
   */
  orientation?: ImgThumbnailsOrientation
}
