/**
 * BgPaths 组件类型声明
 */

export type BgPathsProps = {
  /**
   * 外层容器类名。默认容器为整屏 Hero 背景（含 `min-h-screen`），
   * 作为局部区块背景时可通过此项覆盖高度（如传 `h-full`）
   */
  className?: string
  /**
   * SVG 描边颜色类名（通过 `currentColor` 着色）
   * @default 'text-slate-950 dark:text-white'
   */
  svgClassName?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export type FloatingPathsProps = {
  position: number
  className?: string
}
