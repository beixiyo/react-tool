'use client'

import type { GlowLayer } from './constants'
import { memo } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { CAPSULE_GLOW_LAYERS } from './constants'
import { GlowField } from './GlowField'

const GLOW_POSITION_X_PERCENT: Record<BottomGlowPosition, number> = {
  'bottom-left': 32,
  'bottom-center': 50,
  'bottom-right': 68,
}

/**
 * 亮条厚度占容器宽度的默认比例
 *
 * 跟光场一样按宽度算而不是按高度：按高度算的话，同一个组件放进 40px 的胶囊里是
 * 一道细光，放进 90px 的输入框里就成了一条横杠。
 * 但比例本身**必须可调**——同样是 2%，140px 的胶囊上是 2.8px 的细光，
 * 900px 的页面底栏上就成了 18px 的横杠
 */
const DEFAULT_LIGHT_THICKNESS = 0.02

/**
 * 亮条外发光相对**自身厚度**的倍率
 *
 * 不写成独立的 cqw 常量：那样调薄亮条时发光不跟着收，
 * 一道 0.5% 的细光会被 1.7% 的模糊糊成一片——和光场此前「模糊顶到弧高 80%」是同一个坑
 */
const LIGHT_HALO = {
  /** 自身模糊 */
  blur: 0.85,
  /** 外发光的扩散半径 */
  shadowBlur: 2.05,
  /** 外发光的实心外扩 */
  shadowSpread: 1.35,
} as const

/**
 * 容器底部动态光效
 *
 * 组件只负责把外部传入的归一化音量映射为光场强度与亮条宽度，
 * 音频采集和音量计算由调用方负责
 *
 * **外观由调用方定**：这里只保留画光必需的结构类——`relative` 与 `isolate` 给光场
 * 做定位与层叠边界，`overflow-hidden` 负责按调用方给的形状裁切。
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
    minLightWidth = 0.20,
    maxLightWidth = 0.63,
    lightThickness = DEFAULT_LIGHT_THICKNESS,
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

  /**
   * 归一化统一收口在 API 边界，内部只跟已经合法的值打交道
   *
   * 亮条宽度必须先夹再算比值：`maxLightWidth` 传 0 时原先会算出 `scaleX(NaN)`，
   * 整条亮条静默消失且控制台不报错
   */
  const maxWidth = Math.min(1, Math.max(0, maxLightWidth))
  const minWidth = Math.min(maxWidth, Math.max(0, minLightWidth))
  const lightWidth = minWidth + normalizedLevel * (maxWidth - minWidth)
  const lightScaleX = maxWidth > 0
    ? lightWidth / maxWidth
    : 0
  const thickness = Math.min(0.5, Math.max(0, lightThickness))

  return (
    <div
      { ...{
        [DATA_ATTR.bottomGlow.scale]: glowScale,
        [DATA_ATTR.bottomGlow.position]: position,
      } }
      className={ cn('BottomGlow @container relative isolate flex w-full items-center justify-center overflow-hidden', className) }
      style={ style }
      { ...rest }
    >
      <GlowField
        level={ normalizedLevel }
        breathing={ breathing }
        scale={ glowScale }
        blurScale={ blurScale }
        layers={ layers }
        fadeFraction={ fadeFraction }
        offsetX={ (glowXPercent - 50) / 100 }
      />

      {/* 亮条只动 transform 与 opacity，避免每帧回流 */}
      { showLight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center transition-transform duration-100 ease-out motion-reduce:transition-none"
          style={ {
            height: `${thickness * 100}cqw`,
            transform: `translate(${glowXPercent - 50}%, 50%)`,
          } }
        >
          <div
            className="h-full rounded-[50%] bg-white transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none"
            style={ {
              boxShadow: `0 0 ${thickness * 100 * LIGHT_HALO.shadowBlur}cqw ${thickness * 100 * LIGHT_HALO.shadowSpread}cqw rgb(255 255 255 / 0.72)`,
              filter: `blur(${thickness * 100 * LIGHT_HALO.blur}cqw)`,
              opacity: 0.7 + normalizedLevel * 0.3,
              transform: `scaleX(${lightScaleX})`,
              width: `${maxWidth * 100}%`,
            } }
          />
        </div>
      ) }

      {
        /*
         * 有内容才渲染这一层：本组件只负责画光，不自带任何文案，也不替调用方定排版。
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

export { CAPSULE_GLOW_LAYERS, GLOW_FRAME, GLOW_LAYERS } from './constants'
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
   * 静音时白色亮条占组件宽度的比例
   * @default 0.20
   */
  minLightWidth?: number
  /**
   * 满音量时白色亮条占组件宽度的比例
   * @default 0.63
   */
  maxLightWidth?: number
  /**
   * 白色亮条的厚度占组件**宽度**的比例，超出 0-0.5 会在组件边界被截断
   *
   * 与 {@link BottomGlowProps.minLightWidth} 同一套单位，改这一个值时外发光会等比跟随，
   * 不必再单独调模糊。宿主越宽越要调小：140px 的胶囊上 0.02 是一道细光，
   * 900px 的页面底栏上同一个值会粗到 18px
   * @default 0.02
   */
  lightThickness?: number
  /**
   * 光场的整体缩放，等比
   *
   * 光场画布的基准尺寸只由**容器宽度**导出（高度锁死 {@link GLOW_FRAME} 的宽高比），
   * 容器高只决定往上露出多少。所以这个值改的是「光铺多大」，
   * 弧的胖瘦不受影响——那是 {@link CAPSULE_GLOW_LAYERS} 里椭圆自身的事
   * @default 1
   */
  glowScale?: number
  /**
   * 覆盖默认的椭圆组成，整套一起换
   *
   * 默认是胶囊那套（{@link CAPSULE_GLOW_LAYERS}）而不是 Android 参考画框那套
   * （{@link GLOW_LAYERS}）：绝大多数宿主是扁的（输入框、胶囊、页面底栏），
   * 那种宿主只露得出画布最下面薄薄一条，需要沉得很深、只留顶弧的椭圆。
   * 参考画框那套整枚椭圆几乎都可见，是给 402×288 这种近方形宿主铺满整片色相用的
   * @default CAPSULE_GLOW_LAYERS
   */
  layers?: readonly GlowLayer[]
  /**
   * 顶部淡出区高度占光场画布高度的比例，透传给 {@link GlowField}
   *
   * 扁宿主里画布顶在可视区之外，改它看不出变化；见 `GlowFieldProps.fadeFraction`
   * @default 1 / 6
   */
  fadeFraction?: number
  /**
   * 模糊半径的整体倍率
   *
   * 与 {@link BottomGlowProps.glowScale} 正交：那个管铺多大（形状不变），这个管多糊。
   * 每层的基准 {@link GlowLayer.sigma} 是画框宽度的比例，渲染时按容器宽换算，
   * **已经随容器等比缩放**，所以换个尺寸的宿主并不需要动这个值
   * @default 1
   */
  blurScale?: number
  /**
   * 是否播放光场的 6s 呼吸循环；`prefers-reduced-motion` 下强制关闭
   * @default true
   */
  breathing?: boolean
  /**
   * 是否显示底部白色亮条
   *
   * 它压在光场最亮处，关闭可露出未被冲淡的色相
   * @default true
   */
  showLight?: boolean
  /**
   * 内容容器的 className；只在传了 children 时生效
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
