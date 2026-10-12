import { memo } from 'react'
import type { CSSProperties } from 'react'
import { cn } from 'utils'
import { roundedMapping } from '../../utils/roundedUtils'
import { getSizeStyles } from '../../utils/sizeUtils'
import { SKELETON_SIZE_CONFIG, SKELETON_SIZE_WIDTHS } from './constants'
import styles from './styles.module.scss'
import type { SkeletonProps } from './types'

export type { SkeletonProps } from './types'

/**
 * 自适应骨架屏
 *
 * 默认尺寸走 CSS 自适应：高度 1em（继承上下文字号，模拟一行文字）、
 * 宽度 100%（父容器可用宽度）、圆角 0.25em（随字号缩放），颜色默认走设计 token 自动明暗
 *
 * 覆盖优先级（无需 style，无行内样式副作用）：
 * className 工具类（h-* / w-* / rounded-*） > 显式 size / style / rounded > CSS 自适应默认值
 *
 * 组件渲染 div（块级），使用准则：
 * - 替换「一行字」→ 靠继承，骨架与真实内容同位置互斥渲染
 * - 替换「一个形状」→ 给显式尺寸（size / className）
 * - 勿直接置于 p 或纯 inline 元素内（会切断文本流），行内场景用等排版容器承载
 *
 * @example 文本占位：与真实内容同位置互斥渲染，自动继承字号
 * ```tsx
 * <h1>{ title || <Skeleton /> }</h1>
 * <div>{ body || <Skeleton count={4} /> }</div>
 * ```
 *
 * @example 几何占位：头像、进度条等非文本场景，显式给尺寸
 * ```tsx
 * <Skeleton size={ 48 } rounded="full" />                 // 圆形头像位
 * <Skeleton style={ { height: 4 } } rounded="none" />      // 进度条
 * <Skeleton className="h-12 w-12 rounded-lg" />          // className 工具类直接覆盖默认值
 * ```
 *
 * @example 多行与动画：count 支持小数，末行按小数部分缩短宽度
 * ```tsx
 * <Skeleton count={ 3.5 } />                // 三行全宽 + 一行半宽
 * <Skeleton count={ 3.5 } animationDuration={ 2 } />
 * <Skeleton active={ false } />             // 纯色静态，无扫光
 * ```
 */
export const Skeleton = memo<SkeletonProps>((props) => {
  const {
    className,
    style,
    active = true,
    baseColor = 'rgb(var(--skeletonBase) / 1)',
    highlightColor = 'rgb(var(--skeletonHighlight) / 1)',
    animationDuration = 1,
    rounded = 'auto',
    size,
    count = 1,
    children,
    ...rest
  } = props

  const sizeStyles = size === undefined
    ? undefined
    : getSizeStyles(size, SKELETON_SIZE_CONFIG)

  const radiusStyle = typeof rounded === 'number'
    ? { borderRadius: rounded }
    : undefined

  const lineStyle: CSSProperties & Record<`--skeleton-${string}`, string> = {
    '--skeleton-base-color': baseColor,
    '--skeleton-highlight-color': highlightColor,
    '--skeleton-animation-duration': `${animationDuration}s`,
    '--skeleton-animation-display': active
      ? 'block'
      : 'none',
    ...radiusStyle,
    ...sizeStyles?.style,
    ...style,
  }

  const radiusClassName = typeof rounded === 'string' && rounded !== 'auto'
    ? roundedMapping[rounded]
    : undefined

  const lineClassName = cn(
    styles.skeleton,
    radiusClassName,
    sizeStyles?.className,
    className,
  )
  const lineCount = Number.isFinite(count) && count > 0
    ? Math.ceil(count)
    : 0
  const fraction = count % 1
  const width = lineStyle.width ?? (typeof size === 'string'
    ? SKELETON_SIZE_WIDTHS[size]
    : '100%')
  const cssWidth = typeof width === 'number'
    ? `${width}px`
    : width

  if (count === 1) {
    return (
      <div
        { ...rest }
        className={ lineClassName }
        style={ lineStyle }
        aria-live="polite"
        aria-busy={ active }
      >
        { children }
      </div>
    )
  }

  return (
    <div { ...rest } className={ styles.lines } aria-live="polite" aria-busy={ active }>
      { Array.from({ length: lineCount }, (_, index) => (
        <div
          key={ index }
          className={ lineClassName }
          style={ {
            ...lineStyle,
            ...(index === lineCount - 1 && fraction > 0 && {
              width: `calc(${cssWidth} * ${fraction})`,
            }),
          } }
        >
          { children }
        </div>
      )) }
    </div>
  )
})

Skeleton.displayName = 'Skeleton'
