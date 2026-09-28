export type CountdownRingRef = {
  start: () => void
  pause: () => void
  reset: () => void
  restart: () => void
}

export type CountdownRingProps = {
  /**
   * 初始倒计时秒数
   * @default 60
   */
  initialTime?: number
  /**
   * 圆环大小（直径）
   * @default 200
   */
  size?: number
  /**
   * 渐变主颜色
   * @default '#00ff00'
   */
  startColor?: string
  /**
   * 渐变程度
   * @default 0.4
   */
  gradientDegree?: number
  /**
   * 数字颜色, 默认与startColor相同
   */
  textColor?: string
  /**
   * 数字字体大小
   * @default 48
   */
  fontSize?: number
  /**
   * 背景圆环颜色
   * @default '#1E1F22'
   */
  backgroundColor?: string
  /**
   * 中心背景颜色
   * @default '#2d2d2d'
   */
  centerColor?: string
  /**
   * 是否自动开始
   * @default true
   */
  autoStart?: boolean
  /** 倒计时结束回调 */
  onComplete?: () => void
  /** 每秒回调 */
  onTick?: (timeLeft: number) => void
} & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
