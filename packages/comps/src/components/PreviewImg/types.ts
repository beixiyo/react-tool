import type { ImgThumbnailsOrientation } from '../ImgThumbnails/types'

export type PreviewImgProps = {
  /**
   * 预览图片的URL，支持单张或多张图片
   * - string: 单张图片预览
   * - string[]: 多张图片预览，顶部显示轮播图切换
   */
  src: string | string[]
  /**
   * 关闭预览的回调函数
   */
  onClose: () => void
  /**
   * 初始显示的图片索引（仅多图时有效）
   * @default 0
   */
  initialIndex?: number
  /**
   * 缩略图布局方向
   * @default 'vertical'
   */
  orientation?: ImgThumbnailsOrientation
  /**
   * 是否显示缩略图
   * @default true
   */
  showThumbnails?: boolean
  /**
   * 点击遮罩空白区域时是否关闭预览
   * @default true
   */
  maskClosable?: boolean
  /**
   * 预览层对 Electron 窗口拖拽区的命中策略
   * - `no-drag`：预览打开期间优先保证按钮和图片交互命中
   * - `inherit`：不额外声明 app-region，沿用外层窗口行为
   * @default 'no-drag'
   */
  windowDragMode?: 'no-drag' | 'inherit'
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>
