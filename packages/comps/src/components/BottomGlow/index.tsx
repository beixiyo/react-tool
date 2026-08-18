'use client'

import { memo } from 'react'
import { cn } from 'utils'

const GLOW_POSITION_X_PERCENT: Record<BottomGlowPosition, number> = {
  'bottom-left': 32,
  'bottom-center': 50,
  'bottom-right': 68,
}

const GLOW_POSITION_Y_PERCENT = 100
const LIGHT_ARC_TOP_PERCENT = 96

/**
 * 容器底部动态光效
 *
 * 组件只负责把外部传入的归一化音量映射为亮条宽度、光晕高度与透明度，
 * 音频采集和音量计算由调用方负责
 */
export const BottomGlow = memo<BottomGlowProps>((props) => {
  const {
    level,
    active = true,
    label = 'Listening...',
    minLightWidth = 0.42,
    maxLightWidth = 0.69,
    glowColor = '#eb7de3',
    glowHeight = 0.33,
    position = 'bottom-center',
    contentClassName,
    contentStyle,
    className,
    style,
    children,
    ...rest
  } = props

  const normalizedLevel = active
    ? Math.min(1, Math.max(0, level))
    : 0
  const lightWidth = minLightWidth + normalizedLevel * (maxLightWidth - minLightWidth)
  const glowOpacity = 0.26 + normalizedLevel * 0.32
  const glowScaleY = 0.72 + normalizedLevel * 0.4
  const glowXPercent = GLOW_POSITION_X_PERCENT[position]
  const normalizedGlowHeight = Math.min(1, Math.max(0, glowHeight))
  const glowEllipseHeightPercent = normalizedGlowHeight * 200

  return (
    <div
      role="meter"
      aria-label="光效强度"
      aria-valuemin={ 0 }
      aria-valuemax={ 100 }
      aria-valuenow={ Math.round(normalizedLevel * 100) }
      data-glow-height={ normalizedGlowHeight }
      data-glow-position={ position }
      className={ cn('BottomGlow relative isolate flex aspect-[3.28/1] w-full items-center justify-center overflow-hidden rounded-full bg-white', className) }
      style={ style }
      { ...rest }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute w-[124%] rounded-[50%] transition-[height,left,opacity,transform] duration-100 ease-out"
        style={ {
          background: glowColor,
          filter: 'blur(24px)',
          height: `${glowEllipseHeightPercent}%`,
          left: `${glowXPercent}%`,
          opacity: glowOpacity,
          top: `${GLOW_POSITION_Y_PERCENT}%`,
          transform: `translate(-50%, -50%) scaleY(${glowScaleY})`,
        } }
      />

      <div
        aria-hidden
        className="pointer-events-none absolute h-[24%] rounded-[50%] bg-white transition-[left,width,opacity] duration-100 ease-out"
        style={ {
          boxShadow: '0 0 12px 8px rgb(255 255 255 / 0.72)',
          filter: 'blur(5px)',
          left: `${glowXPercent}%`,
          opacity: 0.7 + normalizedLevel * 0.3,
          top: `${LIGHT_ARC_TOP_PERCENT}%`,
          transform: 'translateX(-50%)',
          width: `${lightWidth * 100}%`,
        } }
      />

      <div className={ cn('relative z-10 text-[clamp(1rem,10cqw,2rem)] font-medium tracking-wide text-black/55', contentClassName) } style={ contentStyle }>
        { children ?? label }
      </div>
    </div>
  )
})

BottomGlow.displayName = 'BottomGlow'

export type BottomGlowProps = {
  /**
   * 外部传入的归一化音量，超出 0-1 的值会在组件边界被截断
   */
  level: number
  /**
   * 是否启用动态光效；关闭时回到最低强度
   * @default true
   */
  active?: boolean
  /**
   * 默认展示文案，传入 children 时由 children 覆盖
   * @default 'Listening...'
   */
  label?: React.ReactNode
  /**
   * 静音时白色亮条占组件宽度的比例
   * @default 0.42
   */
  minLightWidth?: number
  /**
   * 满音量时白色亮条占组件宽度的比例
   * @default 0.76
   */
  maxLightWidth?: number
  /**
   * 粉紫光晕颜色
   * @default '#eb7de3'
   */
  glowColor?: string
  /**
   * 容器内可见粉紫光晕的目标高度比例，内部使用两倍高度的椭圆并沿底边裁切
   * @default 0.33
   */
  glowHeight?: number
  /**
   * 内容容器的 className
   */
  contentClassName?: string
  /**
   * 内容容器的行内样式
   */
  contentStyle?: React.CSSProperties
  /**
   * 光效在胶囊底部的水平位置
   * @default 'bottom-center'
   */
  position?: BottomGlowPosition
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

export type BottomGlowPosition = 'bottom-left' | 'bottom-center' | 'bottom-right'
