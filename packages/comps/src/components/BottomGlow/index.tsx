'use client'

import type { GlowLayer, LevelResponse } from './constants'
import { memo } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { CAPSULE_GLOW_LAYERS } from './constants'
import { GlowField } from './GlowField'
import type { GlowLightBarProps } from './GlowLightBar'
import { GlowLightBar } from './GlowLightBar'

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

      {/* 亮条只动 transform 与 opacity，避免每帧回流 */}
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

export { BREATH_CYCLE_MS, buildArcLayers, CAPSULE_GLOW_LAYERS, DESIGN_ARC, DESIGN_GLOW_COMPONENT, DESIGN_PINK_SCALE_TRACK, FADE_HEIGHT_FRACTION, GLOW_FRAME, GLOW_LAYERS, LEVEL_RESPONSE, squeezeLayers } from './constants'
export type { ArcRatios, GlowLayer, GlowScaleKeyframe, GlowScaleTrack, LevelResponse } from './constants'
export { GlowField } from './GlowField'
export { DEFAULT_LIGHT_HALO, DEFAULT_LIGHT_HALO_COLOR, DEFAULT_LIGHT_OPACITY, DEFAULT_LIGHT_THICKNESS, DESIGN_LIGHT, DESIGN_LIGHT_FILL, GlowLightBar } from './GlowLightBar'
export type { GlowLightBarProps, GlowLightBarShape, LightHaloRatios } from './GlowLightBar'
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
   * 静音时白色亮条的不透明度
   * @default 0.7
   */
  minLightOpacity?: number
  /**
   * 满音量时白色亮条的不透明度
   * @default 1
   */
  maxLightOpacity?: number
  /**
   * 亮条外发光相对自身厚度的倍率；只传部分字段时其余走默认
   *
   * 与 {@link BottomGlowProps.lightThickness} 联动：改厚度时发光自动等比跟随，
   * 这里只在「同样粗细想更散/更聚」时才需要动
   */
  lightHalo?: GlowLightBarProps['halo']
  /**
   * 亮条本体的轮廓；设计稿的 `光效` 是一条平头直线，对应 `'bar'`
   *
   * 厚度被模糊糊开之后两种轮廓差别很小，端头观感主要由
   * {@link BottomGlowProps.lightColor} 的渐变收尾决定
   * @default 'ellipse'
   */
  lightShape?: GlowLightBarProps['shape']
  /**
   * 亮条中心线离容器底边的距离，占组件**宽度**的比例，正值向上
   *
   * 与 {@link BottomGlowProps.lightThickness} 同一套单位，换宿主尺寸时自动跟随。
   * 设计稿是 4/402 ≈ 0.00995，见 {@link DESIGN_LIGHT}
   * @default 0
   */
  lightBottomOffset?: number
  /**
   * 亮条本体填充，直接写进 `background`，因此**接受任何 CSS background 值**
   *
   * 设计稿用的是两端透明的横向渐变 {@link DESIGN_LIGHT_FILL} 而不是纯色：
   * 端头渐隐是它读起来像一团光而不是一根棍的关键
   * @default '#fff'
   */
  lightColor?: string
  /**
   * 亮条外发光颜色
   * @default 'rgb(255 255 255 / 0.72)'
   */
  lightHaloColor?: string
  /**
   * 亮条的混合模式；设计稿的 `Plus lighter` 对应 `'plus-lighter'`
   *
   * **单独打开它没有任何效果**：本组件带 `isolate`，加色混合的背景就是这个层叠
   * 上下文里已经画好的东西，而光场是半透明的。加色同时把 alpha 也加上去，
   * 最后整组合成到宿主背景时正好抵消，净提亮为零。
   * 要让它生效，必须同时用 {@link buildGlowBase} 给本元素铺一层不透明底衬
   * @default 'normal'
   */
  lightBlendMode?: GlowLightBarProps['blendMode']
  /**
   * 覆盖音量→光场的响应标定；只传部分字段时其余走 {@link LEVEL_RESPONSE}
   *
   * 「说话时光变多亮、涨多高」的全部来源。默认亮度只涨 1.33 倍，
   * 观感上的动态主要来自 `scaleY`（1→1.16）与亮条宽度（0.20→0.63，3.15 倍）
   */
  levelResponse?: Partial<LevelResponse>
  /**
   * 呼吸起伏的振幅倍率；0 为完全静止，1 为设计稿原值
   *
   * 绕轨道中点缩放，不会连带改变整体亮度——那是 {@link BottomGlowProps.levelResponse} 的事
   * @default 1
   */
  breathAmplitude?: number
  /**
   * 呼吸循环周期，毫秒
   * @default 6000
   */
  breathCycleMs?: number
  /**
   * 不透明底衬的颜色，铺在光场之下、本元素的背景位
   *
   * **只有底色不在本元素上的宿主才需要它。**亮条默认走 `plus-lighter` 加色混合，
   * 而加色会连 alpha 一起加，叠在半透明分组上时正好被最终合成抵消、净提亮为零。
   * 宿主自己带底色（`className` 里有 `bg-white` 之类）时背景已经不透明，不必传；
   * 底色画在**父元素**上的宿主（浮层胶囊、输入框）必须补这一层，
   * 传与宿主一致的颜色即可，横向遮罩淡出时看不出接缝
   *
   * 排在 `style` 之前，调用方仍可用 `style.background` 覆盖
   */
  baseColor?: string
  /**
   * 底衬从透明转为不透明的位置，占本元素高度的比例
   *
   * 顶部留一段透明是为了不在框顶切出硬边
   * @default 0.3
   */
  baseFade?: number
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
   * 是否播放光场的 6s 呼吸循环
   *
   * 不再受 `prefers-reduced-motion` 影响：所有用户看到同一套效果。
   * 要按系统偏好关掉，调用方自行读 `useReducedMotion()` 传入 false
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
