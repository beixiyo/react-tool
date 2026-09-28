export type GridBgProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  theme?: 'dark' | 'light'
  /**
   * 网格单元尺寸（CSS background-size），可调网格密度
   * @default '2rem 2rem'
   */
  cellSize?: string
  /**
   * 自定义遮罩淡出形状（CSS mask-image），不传则用默认椭圆渐变
   *
   * 注意：传入后会同时覆盖 maskImage 与 WebkitMaskImage，
   * 需自行包含 mask 颜色（默认遮罩会按 theme 自动取黑/白）
   */
  maskImage?: string
}
