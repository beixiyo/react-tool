/**
 * BottomGlow 类型声明
 */

import type { GlowLayer, LevelResponse } from '../constants'
import type { GlowLightBarProps } from './glowLightBar'

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
   * 与 {@link BottomGlowProps.lightThickness} 同一套单位，换宿主尺寸时自动跟随
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
   * 最后整组合成到宿主背景时正好抵消，净提亮为零
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
   * 而加色会连 alpha 一起加，叠在半透明分组上时正好被最终合成抵消、净提亮为零
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
   * 那种宿主只露得出画布最下面薄薄一条，需要沉得很深、只留顶弧的椭圆
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
   * 与 {@link BottomGlowProps.glowScale} 正交：那个管铺多大（形状不变），这个管多糊
   * 每层的基准 {@link GlowLayer.sigma} 是画框宽度的比例，渲染时按容器宽换算，
   * **已经随容器等比缩放**，所以换个尺寸的宿主并不需要动这个值
   * @default 1
   */
  blurScale?: number
  /**
   * 是否播放光场的 6s 呼吸循环
   *
   * 不再受 `prefers-reduced-motion` 影响：所有用户看到同一套效果
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
