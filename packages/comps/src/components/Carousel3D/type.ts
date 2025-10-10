export interface Carousel3DProps {
  /**
   * 轮播图片列表
   */
  srcs: string[]

  /**
   * 初始索引
   * @default 1
   */
  initIndex?: number

  /**
   * 每两张图片之间的偏移量
   * @default 100
   */
  offsetStep?: number

  /**
   * 每两张图片之间的缩放比例差
   * @default 0.6
   */
  scaleStep?: number

  /**
   * 每两张图片之间的透明度差
   * @default 0.5
   */
  opacityStep?: number

  /**
   * 图片宽度
   * @default 400
   */
  imgWidth?: number

  /**
   * 是否自动播放
   * @default true
   */
  autoPlay?: boolean
  /**
   * 自动播放时长
   * @default 2000
   */
  duration?: number

  /**
   * 自定义组件
   */
  childern?: (style: React.CSSProperties, src: string, index: number) => React.ReactNode

  className?: string
  style?: React.CSSProperties
}
