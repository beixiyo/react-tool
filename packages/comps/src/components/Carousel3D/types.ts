export interface Carousel3DProps {
  /**
   * 轮播图片列表
   */
  srcs: string[]

  /**
   * 初始索引（会被夹紧到 [0, srcs.length - 1] 范围内，避免单张/越界时初始状态异常）
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
   * 是否显示左右指示箭头
   * @default true
   */
  showIndicator?: boolean

  /**
   * 上一张指示器内容（默认渲染时使用）
   * @default '❮'
   */
  prevIcon?: React.ReactNode

  /**
   * 下一张指示器内容（默认渲染时使用）
   * @default '❯'
   */
  nextIcon?: React.ReactNode

  /**
   * 完全自定义左右指示器的渲染。传入后将覆盖默认箭头与 prevIcon/nextIcon
   * @param dir 指示器方向
   * @param onClick 触发对应翻页的回调
   */
  renderIndicator?: (dir: 'prev' | 'next', onClick: () => void) => React.ReactNode

  /**
   * 自定义渲染函数
   */
  renderItem?: (style: React.CSSProperties, src: string, index: number) => React.ReactNode

  className?: string
  style?: React.CSSProperties
}
