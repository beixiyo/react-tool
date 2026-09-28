'use client'

import { memo } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { CAPSULE_GLOW_LAYERS } from './constants'
import { GlowField } from './subcomponents/GlowField'
import { GlowLightBar } from './subcomponents/GlowLightBar'
import type { BottomGlowPosition, BottomGlowProps } from './types'

/**
 * 设计稿底衬渐变从透明转为不透明的位置，占光效框高度的比例
 *
 * 取自 Figma `iOS 18 - Voice` 根节点的背景：
 * `linear-gradient(to bottom, rgba(255,255,255,0) 0%, white 30%, white 100%)`
 */
export const DESIGN_BASE_FADE = 0.3

/**
 * 生成光效的底衬渐变
 *
 * **`lightBlendMode="plus-lighter"` 必须配这一层才有效果。**加色混合会连 alpha
 * 一起加（`αo = min(1, αs + αb)`），叠在**半透明**分组上时，多出来的 alpha 正好
 * 抵掉本该从底下透出来的宿主背景色，净效果恒为零——亮条看着还在，提亮却一点没有，
 * 控制台不会有任何提示。只有当混合的背景在本组件的层叠上下文里就已经不透明时，
 * 加法才会真正把颜色顶到饱和
 *
 * 顶部留一段透明是为了不在框顶切出硬边，与设计稿一致
 *
 * @param color 底衬色，通常直接给宿主自己的背景色（如 `rgb(var(--background))`）
 * @param fadeFraction 转为不透明的位置，占框高的比例
 */
export function buildGlowBase(color: string, fadeFraction = DESIGN_BASE_FADE): string {
  return `linear-gradient(to bottom, transparent, ${color} ${(fadeFraction * 100).toFixed(2)}%)`
}

const GLOW_POSITION_X_PERCENT: Record<BottomGlowPosition, number> = {
  'bottom-left': 32,
  'bottom-center': 50,
  'bottom-right': 68,
}

/**
 * 容器底部动态光效
 *
 * 组件只负责把外部传入的归一化音量映射为光场强度与亮条宽度，
 * 音频采集和音量计算由调用方负责
 *
 * **外观由调用方定**：这里只保留画光必需的结构类——`relative` 与 `isolate` 给光场
 * 做定位与层叠边界，`overflow-hidden` 负责按调用方给的形状裁切
 * 底色、圆角、宽高比、文案排版都不预设，`className` / `contentClassName` 传什么就是什么
 *
 * **默认对无障碍不可见**：没有 `role` 也没有 `aria-*`，一块没有可读内容的装饰性 div
 * 本就不会被朗读；传了 children 则 children 自身可读。需要暴露成可读仪表的调用方
 * 自行传 `role="meter"` 与 `aria-valuenow` 等——曾经这里写死 `role="meter"`，
 * 结果两个宿主都得再传一个 `aria-hidden` 把它藏回去，说明默认语义是反的
 */
export const BottomGlow = memo<BottomGlowProps>((props) => {
  const {
    level,
    active = true,
    minLightWidth,
    maxLightWidth,
    lightThickness,
    minLightOpacity,
    maxLightOpacity,
    lightHalo,
    lightShape,
    lightBottomOffset,
    lightColor,
    lightHaloColor,
    lightBlendMode,
    levelResponse,
    breathAmplitude,
    breathCycleMs,
    baseColor,
    baseFade,
    glowScale = 1,
    blurScale = 1,
    layers = CAPSULE_GLOW_LAYERS,
    fadeFraction,
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
  const glowXPercent = GLOW_POSITION_X_PERCENT[position]

  return (
    <div
      { ...{
        [DATA_ATTR.bottomGlow.scale]: glowScale,
        [DATA_ATTR.bottomGlow.position]: position,
      } }
      className={ cn('BottomGlow @container relative isolate flex w-full items-center justify-center overflow-hidden', className) }
      style={ baseColor
        ? { background: buildGlowBase(baseColor, baseFade), ...style }
        : style }
      { ...rest }
    >
      <GlowField
        level={ normalizedLevel }
        breathing={ breathing }
        scale={ glowScale }
        blurScale={ blurScale }
        levelResponse={ levelResponse }
        breathAmplitude={ breathAmplitude }
        breathCycleMs={ breathCycleMs }
        layers={ layers }
        fadeFraction={ fadeFraction }
        offsetX={ (glowXPercent - 50) / 100 }
      />

      { /* 亮条只动 transform 与 opacity，避免每帧回流 */ }
      { showLight && (
        <GlowLightBar
          level={ normalizedLevel }
          minWidth={ minLightWidth }
          maxWidth={ maxLightWidth }
          thickness={ lightThickness }
          minOpacity={ minLightOpacity }
          maxOpacity={ maxLightOpacity }
          halo={ lightHalo }
          shape={ lightShape }
          bottomOffset={ lightBottomOffset }
          color={ lightColor }
          haloColor={ lightHaloColor }
          blendMode={ lightBlendMode }
          offsetXPercent={ glowXPercent - 50 }
        />
      ) }

      {
        /*
         * 有内容才渲染这一层：本组件只负责画光，不自带任何文案，也不替调用方定排版
         * 根节点保留 `@container` 是为了让调用方能用 `10cqw` 这类跟随组件宽度的字号
         */
      }
      { children !== undefined && children !== null && (
        <div className={ cn('relative z-10 text-[clamp(1rem,10cqw,2rem)] font-medium tracking-wide text-black/55', contentClassName) } style={ contentStyle }>
          { children }
        </div>
      ) }
    </div>
  )
})

BottomGlow.displayName = 'BottomGlow'
