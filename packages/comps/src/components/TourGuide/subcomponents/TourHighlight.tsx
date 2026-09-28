import { memo } from 'react'

const TourHighlight = memo(({
  rect,
  padding = 10,
  animationDuration = 300,
  borderRadius = 4,
  borderColor = 'var(--tour-accent-color)', // 用于 inset border
  borderWidth = 1.5,
  backdropColor = 'var(--tour-backdrop-color)', // 遮罩颜色
}: TourHighlightProps) => {
  if (!rect) {
    return null
  }

  // 1. 计算高亮区域的尺寸和位置 (相对于视口)
  const highlightTop = rect.top - padding
  const highlightLeft = rect.left - padding
  const highlightWidth = rect.width + padding * 2
  const highlightHeight = rect.height + padding * 2

  /** 准备 CSS 变量，方便在 style 中使用 */
  const highlightStyleVars = {
    '--highlight-top': `${highlightTop}px`,
    '--highlight-left': `${highlightLeft}px`,
    '--highlight-width': `${highlightWidth}px`,
    '--highlight-height': `${highlightHeight}px`,
    '--highlight-border-radius': `${borderRadius}px`,
    '--animation-duration': `${animationDuration}ms`,
    '--border-color': borderColor,
    '--border-width': `${borderWidth}px`,
    '--backdrop-color': backdropColor,
    /** 定义一个足够大的值来覆盖屏幕 */
    '--screen-cover-spread': '9999px',
  } as React.CSSProperties

  return (
    <div
      className="pointer-events-none fixed" // 使用 fixed 定位，不捕获事件
      style={ {
        ...highlightStyleVars, // 应用 CSS 变量
        top: 'var(--highlight-top)',
        left: 'var(--highlight-left)',
        width: 'var(--highlight-width)',
        height: 'var(--highlight-height)',
        borderRadius: 'var(--highlight-border-radius)',

        // 3. 关键：使用巨大的 box-shadow 创建遮罩效果
        /**
         * 第一层：外部的大阴影，颜色为背景遮罩色
         * 第二层（可选）：内部的 inset 阴影，模拟边框
         */
        boxShadow: `0 0 0 var(--screen-cover-spread) var(--backdrop-color),
                    0 0 0 var(--border-width) inset var(--border-color)`,

        // 4. Stage 元素本身透明 (不需要设置 background)

        // 5. 应用过渡动画
        transition: `top var(--animation-duration) ease-in-out,
                     left var(--animation-duration) ease-in-out,
                     width var(--animation-duration) ease-in-out,
                     height var(--animation-duration) ease-in-out,
                     border-radius var(--animation-duration) ease-in-out,
                     box-shadow var(--animation-duration) ease-in-out`, // box-shadow 也可动画，虽然主要是位置大小变化
      } }
    />
  )
})

TourHighlight.displayName = 'TourHighlight'

export { TourHighlight }

// Props 定义保持不变或根据需要调整
export type TourHighlightProps = {
  /**
   * DOMRect of the element to highlight (relative to viewport)
   */
  rect: DOMRect | null

  /**
   * Padding around the highlighted element in pixels
   * @default 10
   */
  padding?: number

  /**
   * Animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number

  /**
   * Color of the optional border (applied via inset shadow)
   * @default 'var(--tour-accent-color)'
   */
  borderColor?: string

  /**
   * Border radius for the highlight cutout
   * @default 4
   */
  borderRadius?: number

  /**
   * Width of the optional border in pixels (applied via inset shadow)
   * @default 1.5
   */
  borderWidth?: number

  /**
   * Background color for the backdrop/mask effect
   * @default 'var(--tour-backdrop-color)'
   */
  backdropColor?: string
}
