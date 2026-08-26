'use client'

import { memo } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { GlowField } from './GlowField'

const GLOW_POSITION_X_PERCENT: Record<BottomGlowPosition, number> = {
  'bottom-left': 32,
  'bottom-center': 50,
  'bottom-right': 68,
}

const LIGHT_ARC_TOP_PERCENT = 96

/**
 * 容器底部动态光效
 *
 * 组件只负责把外部传入的归一化音量映射为光场强度与亮条宽度，
 * 音频采集和音量计算由调用方负责
 */
export const BottomGlow = memo<BottomGlowProps>((props) => {
  const {
    level,
    active = true,
    label = 'Listening...',
    minLightWidth = 0.42,
    maxLightWidth = 0.69,
    glowHeight = 1,
    breathing = true,
    showLight = true,
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
  const glowXPercent = GLOW_POSITION_X_PERCENT[position]
  const normalizedGlowHeight = Math.min(1, Math.max(0, glowHeight))

  return (
    <div
      role="meter"
      aria-label="光效强度"
      aria-valuemin={ 0 }
      aria-valuemax={ 100 }
      aria-valuenow={ Math.round(normalizedLevel * 100) }
      { ...{
        [DATA_ATTR.bottomGlow.height]: normalizedGlowHeight,
        [DATA_ATTR.bottomGlow.position]: position,
      } }
      className={ cn('BottomGlow @container relative isolate flex aspect-[3.28/1] w-full items-center justify-center overflow-hidden rounded-full bg-white', className) }
      style={ style }
      { ...rest }
    >
      <GlowField
        level={ normalizedLevel }
        breathing={ breathing }
        offsetX={ (glowXPercent - 50) / 100 }
        style={ { height: `${normalizedGlowHeight * 100}%` } }
      />

      {/* 亮条只动 transform 与 opacity，避免每帧回流 */}
      { showLight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 flex h-[24%] justify-center transition-transform duration-100 ease-out motion-reduce:transition-none"
          style={ {
            top: `${LIGHT_ARC_TOP_PERCENT}%`,
            transform: `translate(${glowXPercent - 50}%, -50%)`,
          } }
        >
          <div
            className="h-full rounded-[50%] bg-white transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none"
            style={ {
              boxShadow: '0 0 4.1cqw 2.7cqw rgb(255 255 255 / 0.72)',
              filter: 'blur(1.7cqw)',
              opacity: 0.7 + normalizedLevel * 0.3,
              transform: `scaleX(${lightWidth / maxLightWidth})`,
              width: `${maxLightWidth * 100}%`,
            } }
          />
        </div>
      ) }

      <div className={ cn('relative z-10 text-[clamp(1rem,10cqw,2rem)] font-medium tracking-wide text-black/55', contentClassName) } style={ contentStyle }>
        { children ?? label }
      </div>
    </div>
  )
})

BottomGlow.displayName = 'BottomGlow'

export { GLOW_FRAME, GLOW_LAYERS } from './constants'
export type { GlowLayer } from './constants'
export { GlowField } from './GlowField'
export type { GlowFieldProps } from './GlowField'

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
   * @default 0.69
   */
  maxLightWidth?: number
  /**
   * 光场高度占容器高度的比例，自底边向上
   *
   * 设计稿的色相故事沿整个画框展开，底部约 19% 才是蓝层主场，调小会先牺牲蓝色
   * @default 1
   */
  glowHeight?: number
  /**
   * 是否播放光场的 6s 呼吸循环；`prefers-reduced-motion` 下强制关闭
   * @default true
   */
  breathing?: boolean
  /**
   * 是否显示底部白色亮条；它压在光场蓝层核心上，关闭可露出完整色相
   * @default true
   */
  showLight?: boolean
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
