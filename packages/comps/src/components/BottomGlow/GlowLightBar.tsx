'use client'

import { memo } from 'react'
import { cn } from 'utils'

/**
 * 亮条厚度占容器宽度的默认比例
 *
 * 按 140~330px 的胶囊 / 输入框标定。宽宿主必须按比例调小，
 * 900px 的页面底栏上这个值会得到 18px 厚的亮条加 37px 外发光，糊成一片
 */
export const DEFAULT_LIGHT_THICKNESS = 0.02

/**
 * 亮条外发光相对**自身厚度**的倍率，逐值取自设计稿 `光效` 节点
 *
 * 不写成独立的 cqw 常量：那样调薄亮条时发光不跟着收，
 * 一道 0.5% 的细光会被 1.7% 的模糊糊成一片——和光场此前「模糊顶到弧高 80%」是同一个坑
 *
 * 外发光两项为 0 是有意的：设计稿只有一层图层模糊，光晕来自
 * `plus-lighter` 叠在不透明底衬上之后的饱和，而不是一圈 box-shadow。
 * 早先用 box-shadow 模仿，得到的是「有边界的核 + 一圈晕」，在浅底上与设计稿差别极明显
 */
export const DEFAULT_LIGHT_HALO: LightHaloRatios = {
  /** 自身模糊，`stdDeviation: 8` ÷ `stroke-width: 10` */
  blur: 0.8,
  /** 设计稿没有 box-shadow 外发光，光晕由加色混合的饱和产生 */
  shadowBlur: 0,
  /** 同上 */
  shadowSpread: 0,
}

/** 亮条不透明度的默认响应：静音 → 满音量 */
export const DEFAULT_LIGHT_OPACITY = { min: 0.7, max: 1 } as const

/** 外发光的默认颜色，比亮条本体略透以免糊成一坨 */
export const DEFAULT_LIGHT_HALO_COLOR = 'rgb(255 255 255 / 0.72)'

/**
 * 设计稿里这道高光的填充：两端透明、正中实白的横向渐变
 *
 * 逐值取自 Figma `iOS 18 - Voice` → `光效` 导出的 SVG：
 * `<path d="M16 21H216" stroke="url(#paint0_linear)" stroke-width="10"/>`，
 * 渐变 stop 为 `white α0 → white α1 @50% → white α0`
 *
 * **两端渐隐是它读起来像「一团光」而不是「一根棍」的唯一原因**。
 * 早先用实心白 + box-shadow 外发光去模仿，得到的是「有边界的核 + 一圈晕」，
 * 两者在设计稿的浅底上差别极明显
 */
export const DESIGN_LIGHT_FILL = 'linear-gradient(to right, transparent, #fff 50%, transparent)'

/**
 * 设计稿高光的完整规格，全部换算成**相对容器宽度**的比例
 *
 * 换算基准是设计稿组件框 402×210：
 * - `width` = 200/402，`光效` 节点自身宽度
 * - `minWidth` / `maxWidth` = `width` × 设计稿 scaleX 动效的极值 0.65 / 1.1
 * - `thickness` = 10/402，即 `stroke-width`
 * - `bottomOffset` = 4/402，节点 `bottom: 4px`，描边居中压在这条线上
 * - `halo.blur` = 8/10 = 0.8，`stdDeviation` 8 相对厚度 10 的倍率
 * - 外发光两项为 0：设计稿只有一层图层模糊，没有 box-shadow
 *
 * 搬到更宽的宿主上时纵向量（`thickness` / `bottomOffset`）要按
 * {@link scaleArcVertically} 同一个系数压，横向量保持不变
 */
export const DESIGN_LIGHT = {
  /** 设计稿 scaleX 动效最小值 0.65 × 200/402 */
  minWidth: 0.3234,
  /** 设计稿 scaleX 动效最大值 1.1 × 200/402 */
  maxWidth: 0.5473,
  /** `stroke-width: 10` ÷ 402 */
  thickness: 0.0249,
  /** 节点 `bottom: 4px` ÷ 402 */
  bottomOffset: 0.00995,
  /** 图层 `opacity: 0.8`，**与音量无关**：设计稿只用 scaleX 表达音量 */
  opacity: 0.8,
  halo: {
    /** `stdDeviation: 8` ÷ `stroke-width: 10` */
    blur: 0.8,
    /** 设计稿没有外发光 */
    shadowBlur: 0,
    /** 设计稿没有外发光 */
    shadowSpread: 0,
  },
} as const

/**
 * 压在容器底边的白色亮条，宽度随音量伸缩
 *
 * 从 {@link BottomGlow} 里抽出来的：录音页要的是同一款白光，
 * 而不是「另一种也叫白光的东西」。两处共用这一份，观感才不会各自漂移
 *
 * **所有尺寸都是容器宽度的比例（`cqw`）**，调用方必须自己是查询容器
 * （加 `@container`），否则 `cqw` 会退到视口去解析
 *
 * 只动 `transform` 与 `opacity` 来响应音量，避免每帧回流
 */
export const GlowLightBar = memo<GlowLightBarProps>((props) => {
  const {
    level,
    minWidth = 0.20,
    maxWidth = 0.63,
    thickness = DEFAULT_LIGHT_THICKNESS,
    minOpacity = DEFAULT_LIGHT_OPACITY.min,
    maxOpacity = DEFAULT_LIGHT_OPACITY.max,
    halo,
    shape = 'bar',
    color = DESIGN_LIGHT_FILL,
    haloColor = DEFAULT_LIGHT_HALO_COLOR,
    blendMode = 'plus-lighter',
    offsetXPercent = 0,
    bottomOffset = 0,
    className,
    style,
    ...rest
  } = props

  /**
   * 归一化收口在这里
   *
   * 宽度必须先夹再算比值：`maxWidth` 传 0 时会算出 `scaleX(NaN)`，
   * 整条亮条静默消失且控制台不报错
   */
  const normalizedLevel = Math.min(1, Math.max(0, level))
  const safeMaxWidth = Math.min(1, Math.max(0, maxWidth))
  const safeMinWidth = Math.min(safeMaxWidth, Math.max(0, minWidth))
  const width = safeMinWidth + normalizedLevel * (safeMaxWidth - safeMinWidth)
  const scaleX = safeMaxWidth > 0
    ? width / safeMaxWidth
    : 0
  const safeThickness = Math.min(0.5, Math.max(0, thickness))
  const thicknessCqw = safeThickness * 100
  const { blur, shadowBlur, shadowSpread } = { ...DEFAULT_LIGHT_HALO, ...halo }

  return (
    <div
      aria-hidden
      className={ cn('GlowLightBar pointer-events-none absolute inset-x-0 flex justify-center transition-transform duration-100 ease-out', className) }
      style={ {
        ...style,
        bottom: `${bottomOffset * 100}cqw`,
        height: `${thicknessCqw}cqw`,
        /**
         * 混合模式必须挂在**这一层**，不能挂在里面那个画本体的 div 上
         *
         * 本元素带 `transform`，而 transform 会建立层叠上下文，把子元素与下方光场隔开。
         * 混合模式写在子元素上时，它的「背景」只剩本元素这块空白，
         * `plus-lighter` 于是对着透明黑做加法，退化成普通叠加——
         * 表现是白光看起来正常、但完全没有提亮效果，控制台没有任何提示。
         * 挂在本元素上则是「整组对外层背景做混合」，transform 不影响这一步
         */
        mixBlendMode: blendMode,
        /** 半条压在容器外，亮条的中心正好落在 `bottom` 指定的那条线上 */
        transform: `translate(${offsetXPercent}%, 50%)`,
      } }
      { ...rest }
    >
      <div
        className={ cn('h-full transition-[opacity,transform] duration-100 ease-out', shape === 'ellipse' && 'rounded-[50%]') }
        style={ {
          background: color,
          /** 两项都为 0 时整条省掉：`0 0 0 0` 虽然不可见，但仍会让浏览器多合成一层 */
          boxShadow: shadowBlur === 0 && shadowSpread === 0
            ? undefined
            : `0 0 ${thicknessCqw * shadowBlur}cqw ${thicknessCqw * shadowSpread}cqw ${haloColor}`,
          filter: `blur(${thicknessCqw * blur}cqw)`,
          opacity: minOpacity + normalizedLevel * (maxOpacity - minOpacity),
          transform: `scaleX(${scaleX})`,
          width: `${safeMaxWidth * 100}%`,
        } }
      />
    </div>
  )
})

GlowLightBar.displayName = 'GlowLightBar'

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
   * 与宽度同一套单位，改这一个值时外发光会等比跟随，不必再单独调模糊。
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
   * 一道 0.5% 的细光会被 1.7% 的模糊糊成一片。
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
   * 底色越接近 255 越没有可加的余量，实测近白底上提亮幅度不到 1/255。
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
