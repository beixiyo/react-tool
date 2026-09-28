type ColorValue = [FromColor: string, ToColor: string]

export type DyBgcProps =
  & {
    children?: React.ReactNode
    /**
     * 渐变色块数组，每项为 [起始色, 结束色]
     * 段数可任意，内部会按数量自动复用/截断关键帧基准模式
     * @default 5 组预设彩色渐变
     */
    colors?: ColorValue[]
    /**
     * 背景模糊半径（像素）
     * @default 10
     */
    blurAmount?: number
    /**
     * 动画时长（秒）
     * @default 10
     */
    animationDuration?: number
    /**
     * 最外层容器类名
     */
    containerClassName?: string
  }
  & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
