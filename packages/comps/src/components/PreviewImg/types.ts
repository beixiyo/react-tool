/**
 * PreviewImg 组件类型定义
 */

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
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>
