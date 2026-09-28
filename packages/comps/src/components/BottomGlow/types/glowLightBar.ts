/**
 * GlowLightBar 类型声明
 */
import type * as React from 'react'

/** 外发光相对亮条自身厚度的倍率 */
export type LightHaloRatios = {
  /** 自身模糊 */
  blur: number
  /** 外发光的扩散半径；与 `shadowSpread` 同为 0 时不生成 box-shadow */
  shadowBlur: number
  /** 外发光的实心外扩；与 `shadowBlur` 同为 0 时不生成 box-shadow */
  shadowSpread: number
}

/** 亮条本体的轮廓 */
export type GlowLightBarShape = 'ellipse' | 'bar'

export type GlowLightBarProps = {
  /** 归一化音量，超出 0-1 的值会在组件边界被截断 */
  level: number
  /**
   * 静音时亮条占容器宽度的比例
   * @default 0.20
   */
  minWidth?: number
  /**
   * 满音量时亮条占容器宽度的比例
   * @default 0.63
   */
  maxWidth?: number
  /**
   * 亮条厚度占容器**宽度**的比例，超出 0-0.5 会在组件边界被截断
   *
   * 与宽度同一套单位，改这一个值时外发光会等比跟随，不必再单独调模糊
   * 宿主越宽越要调小：140px 的胶囊上 0.02 是一道细光，900px 的页面底栏上会粗到 18px
   * @default 0.02
   */
  thickness?: number
  /**
   * 静音时亮条的不透明度
   * @default 0.7
   */
  minOpacity?: number
  /**
   * 满音量时亮条的不透明度
   * @default 1
   */
  maxOpacity?: number
  /**
   * 外发光相对**自身厚度**的倍率；只传部分字段时其余走 {@link DEFAULT_LIGHT_HALO}
   *
   * 写成倍率而不是独立的 cqw 值：那样调薄亮条时发光不跟着收，
   * 一道 0.5% 的细光会被 1.7% 的模糊糊成一片
   * `shadowBlur` 与 `shadowSpread` 同为 0 时完全不生成 box-shadow，
   * 只保留一层图层模糊——这是设计稿的做法，见 {@link DESIGN_LIGHT}
   */
  halo?: Partial<LightHaloRatios>
  /**
   * 亮条本体的轮廓
   *
   * `'ellipse'` 两端收成尖角，`'bar'` 是平头矩形（设计稿 `光效` 是
   * 一条 `stroke-width: 10` 的直线，即平头）。厚度被模糊糊开之后两者差别很小，
   * 真正决定端头观感的是 `color` 里的渐变收尾
   * @default 'ellipse'
   */
  shape?: GlowLightBarShape
  /**
   * 亮条本体填充，直接写进 `background`，因此**接受任何 CSS background 值**
   *
   * 设计稿用的是两端透明的横向渐变 {@link DESIGN_LIGHT_FILL}，
   * 不是纯色——端头渐隐是它读起来像光而不是像棍的关键
   * @default DESIGN_LIGHT_FILL
   */
  color?: string
  /**
   * 外发光颜色，通常比本体略透；`halo` 的两项均为 0 时无效
   * @default 'rgb(255 255 255 / 0.72)'
   */
  haloColor?: string
  /**
   * 亮条的混合模式
   *
   * 设计稿这条高光在 Figma 里是 `Plus lighter`，对应 CSS 的 `plus-lighter`：
   * 与下方光场做**加色**混合。注意它只在底色离纯白还有距离时才看得出来——
   * 底色越接近 255 越没有可加的余量，实测近白底上提亮幅度不到 1/255
   * **宿主必须在本组件的层叠上下文里有不透明背景**，否则加色会连 alpha 一起加、
   * 最后合成时正好抵消，净提亮恒为零。宿主自身带底色（如 `bg-white`）即可满足；
   * 底色在父元素上的宿主用 `BottomGlowProps.baseColor` 补一层
   * @default 'plus-lighter'
   */
  blendMode?: React.CSSProperties['mixBlendMode']
  /**
   * 横向偏移，单位为亮条自身宽度的百分比，正值向右
   * @default 0
   */
  offsetXPercent?: number
  /**
   * 亮条中心线离容器底边的距离，占容器**宽度**的比例，正值向上
   *
   * 与厚度同一套单位，宿主换尺寸时自动跟随。0 表示中心正压在底边上
   * @default 0
   */
  bottomOffset?: number
} & React.HTMLAttributes<HTMLDivElement>
