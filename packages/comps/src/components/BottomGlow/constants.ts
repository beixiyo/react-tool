/**
 * BottomGlow 光场的设计常量
 *
 * 色彩与动画轨道来自同一份设计稿（Figma SVG payload）。
 * 几何只有 {@link GLOW_LAYERS} 与 Android 端 AskVoiceGlow 逐值对齐；
 * {@link CAPSULE_GLOW_LAYERS} 是按扁宿主重新标定的，两者不要互相套用。
 * 改动前先确认设计侧已同步。
 */

/**
 * 设计稿坐标系，同时是光场画布的基准
 *
 * 画布只按容器**宽度**换算：宽 = 容器宽，高 = 容器宽 × `height / width`，贴容器底边向上铺。
 * 容器高只决定往上露出多少，不参与几何——所有层的 `cx/cy/rx/ry/sigma` 因此是等比缩放的
 */
export const GLOW_FRAME = { width: 402, height: 288 } as const

/** 呼吸主时间轴，6s 循环 */
export const BREATH_CYCLE_MS = 6000

/** 顶部淡出区高度占光场高度的比例 */
export const FADE_HEIGHT_FRACTION = 1 / 6

/** 顶部淡出的采样点数，与设计侧的 9 段一致 */
const FADE_STOP_COUNT = 9

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

/** smoothstep，两端一阶导为 0；线性会在淡出区两端留下可见折线 */
function smoothstep(t: number) {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/**
 * 顶部淡出遮罩
 *
 * 必须挂在**不参与 transform 的容器**上：mask 会跟随元素自身的 transform 一起变换，
 * 挂在正在缩放的光场上会让淡出区随呼吸上下漂移，容器顶因此浮现一条硬边
 */
export function buildTopFadeMask(fadeFraction = FADE_HEIGHT_FRACTION) {
  const stops = Array.from({ length: FADE_STOP_COUNT }, (_, index) => {
    const t = index / (FADE_STOP_COUNT - 1)
    return `rgb(0 0 0 / ${smoothstep(t).toFixed(4)}) ${(t * clamp01(fadeFraction) * 100).toFixed(3)}%`
  })
  return `linear-gradient(to bottom, ${stops.join(', ')})`
}

/** 音量响应的默认标定，与设计稿一致 */
export const LEVEL_RESPONSE = {
  /**
   * 静音时光场的不透明度
   *
   * 刻意抬到 0.75：呼吸轨道本身已经把整组压到 0.47~0.70，
   * 再乘一个低系数会让最暗的那层直接掉到看不见。
   * 这个下限是照 {@link GLOW_LAYERS} 的蓝层定的（它最容易先消失）
   */
  minOpacity: 0.75,
  /** 满音量时光场的不透明度 */
  maxOpacity: 1,
  /**
   * 满音量时光场的横向缩放
   *
   * 与 {@link LEVEL_RESPONSE.scaleY} **故意不等比**：这是「说话把光顶起来」的响应，
   * 光该往上长而不是往两边摊。它与「弧形不随容器长宽比变形」是两回事，别当成畸变
   */
  scaleX: 1.05,
  /** 满音量时光场的纵向缩放 */
  scaleY: 1.16,
} as const

/**
 * 归一化强度到光场整体表现的映射
 *
 * 与呼吸轨道相乘而非相加：呼吸负责「活着」的底噪，强度负责「说话」的起伏
 *
 * @param level 归一化音量，超出 0-1 会被截断
 * @param response 覆盖默认标定；只传部分字段时其余走 {@link LEVEL_RESPONSE}
 */
export function mapLevelToField(level: number, response?: Partial<LevelResponse>): GlowFieldState {
  const { maxOpacity, minOpacity, scaleX, scaleY } = { ...LEVEL_RESPONSE, ...response }
  const normalized = clamp01(level)
  return {
    opacity: minOpacity + normalized * (maxOpacity - minOpacity),
    scaleX: 1 + normalized * (scaleX - 1),
    scaleY: 1 + normalized * (scaleY - 1),
  }
}

/**
 * 按振幅倍率重算呼吸轨道
 *
 * 绕着轨道自身的中点缩放，而不是整条乘一个系数：乘系数会连带把整体亮度压下去，
 * 于是「起伏多大」和「有多亮」纠缠在一起，调一个必然动另一个
 *
 * @param amplitude 1 为设计稿原值，0 等于关掉起伏（恒定在中点）
 */
export function scaleBreathTrack(amplitude: number): readonly GlowOpacityKeyframe[] {
  if (amplitude === 1) return GLOW_OPACITY_TRACK

  const values = GLOW_OPACITY_TRACK.map(frame => frame.value)
  const mid = (Math.min(...values) + Math.max(...values)) / 2
  return GLOW_OPACITY_TRACK.map(frame => ({
    ...frame,
    value: clamp01(mid + (frame.value - mid) * Math.max(0, amplitude)),
  }))
}

const PINK_SCALE_X = [
  1.05, 1.051, 1.055, 1.062, 1.07, 1.078, 1.085, 1.089,
  1.09, 1.078, 1.066, 1.056, 1.046, 1.038, 1.031, 1.025,
  1.021, 1.02, 1.021, 1.023, 1.028, 1.034, 1.042, 1.05,
  1.058, 1.066, 1.072, 1.077, 1.079, 1.08, 1.078, 1.074,
  1.068, 1.059, 1.05, 1.039, 1.027, 1.014, 1, 1.001,
  1.004, 1.01, 1.019, 1.029, 1.04, 1.051, 1.061, 1.07,
  1.076, 1.079, 1.08, 1.079, 1.078, 1.074, 1.07, 1.065,
  1.06, 1.056, 1.052, 1.051, 1.05,
]

const PINK_SCALE_Y = [
  1.05, 1.049, 1.047, 1.044, 1.039, 1.033, 1.027, 1.021,
  1.016, 1.013, 1.011, 1.01, 1.021, 1.031, 1.04, 1.049,
  1.057, 1.065, 1.072, 1.078, 1.083, 1.086, 1.089, 1.09,
  1.089, 1.085, 1.079, 1.071, 1.06, 1.05, 1.039, 1.031,
  1.025, 1.021, 1.02, 1.021, 1.023, 1.026, 1.031, 1.036,
  1.042, 1.049, 1.056, 1.064, 1.072, 1.081, 1.09, 1.1,
  1.099, 1.098, 1.095, 1.09, 1.085, 1.078, 1.072, 1.065,
  1.06, 1.055, 1.052, 1.051, 1.05,
]

const LIGHT_PINK_SCALE_X = [
  1.05, 1.04, 1.03, 1.023, 1.016, 1.012, 1.01, 1.013,
  1.022, 1.036, 1.055, 1.074, 1.088, 1.097, 1.1, 1.099,
  1.095, 1.088, 1.078, 1.066, 1.054, 1.042, 1.032, 1.025,
  1.021, 1.02, 1.022, 1.026, 1.032, 1.039, 1.048, 1.057,
  1.068, 1.08, 1.079, 1.075, 1.068, 1.058, 1.046, 1.034,
  1.022, 1.012, 1.005, 1.001, 1, 1.013, 1.025, 1.037,
  1.047, 1.057, 1.066, 1.074, 1.08, 1.085, 1.089, 1.09,
  1.087, 1.077, 1.063, 1.053, 1.05,
]

const LIGHT_PINK_SCALE_Y = [
  1.05, 1.051, 1.054, 1.059, 1.066, 1.074, 1.081, 1.086,
  1.089, 1.09, 1.088, 1.084, 1.078, 1.069, 1.06, 1.049,
  1.037, 1.024, 1.01, 1.011, 1.014, 1.019, 1.026, 1.035,
  1.045, 1.055, 1.064, 1.071, 1.076, 1.079, 1.08, 1.071,
  1.063, 1.055, 1.048, 1.042, 1.036, 1.031, 1.027, 1.023,
  1.021, 1.02, 1.021, 1.023, 1.028, 1.034, 1.042, 1.05,
  1.058, 1.066, 1.072, 1.077, 1.079, 1.08, 1.079, 1.075,
  1.069, 1.061, 1.055, 1.051, 1.05,
]

const BLUE_SCALE_X = [
  1.05, 1.052, 1.06, 1.07, 1.078, 1.08, 1.064, 1.05,
  1.038, 1.027, 1.018, 1.012, 1.01, 1.012, 1.017, 1.025,
  1.035, 1.047, 1.06, 1.074, 1.09, 1.087, 1.078, 1.064,
  1.046, 1.032, 1.023, 1.02, 1.021, 1.026, 1.034, 1.044,
  1.056, 1.066, 1.074, 1.079, 1.08, 1.062, 1.046, 1.032,
  1.019, 1.01, 1.003, 1, 1.002, 1.01, 1.023, 1.04,
  1.06, 1.077, 1.09, 1.098, 1.1, 1.098, 1.094, 1.085,
  1.075, 1.065, 1.056, 1.052, 1.05,
]

const BLUE_SCALE_Y = [
  1.05, 1.049, 1.046, 1.043, 1.038, 1.033, 1.027, 1.02,
  1.022, 1.03, 1.043, 1.06, 1.077, 1.09, 1.098, 1.1,
  1.097, 1.087, 1.071, 1.05, 1.029, 1.013, 1.003, 1,
  1.014, 1.027, 1.039, 1.05, 1.059, 1.068, 1.074, 1.078,
  1.08, 1.078, 1.072, 1.062, 1.05, 1.038, 1.028, 1.022,
  1.02, 1.022, 1.027, 1.033, 1.042, 1.052, 1.064, 1.076,
  1.09, 1.088, 1.081, 1.07, 1.055, 1.04, 1.029, 1.022,
  1.02, 1.024, 1.035, 1.046, 1.05,
]

/**
 * 三层高斯模糊椭圆，数组顺序即绘制顺序（自下而上：粉 → 浅粉 → 蓝）
 *
 * 三层中心都对齐在画面横向正中，cy 依次下沉到容器底边附近或下方，
 * 叠加后形成「底部中央蓝紫、向上与向两侧转粉」的双向色相渐变
 *
 * 缩放轨道挂在层自己身上，而不是另开一个按下标对齐的平行数组：
 * 那样自定义层数一旦不是 3，多出来的层会静默地不参与呼吸，
 * 而调用方从类型上完全看不出有这个约束
 */
export const GLOW_LAYERS: readonly GlowLayer[] = [
  {
    id: 'pink',
    cx: 201,
    cy: 273.8,
    rx: 280,
    ry: 166,
    sigma: 53.9,
    color: '#EB92E3',
    track: { x: PINK_SCALE_X, y: PINK_SCALE_Y },
  },
  {
    id: 'lightPink',
    cx: 201,
    cy: 313.8,
    rx: 280,
    ry: 166,
    sigma: 53.9,
    color: '#FCDEFA',
    track: { x: LIGHT_PINK_SCALE_X, y: LIGHT_PINK_SCALE_Y },
  },
  {
    id: 'blue',
    cx: 201.001,
    cy: 365.8,
    rx: 188.741,
    ry: 132,
    sigma: 75.5,
    color: '#5F7EE9',
    track: { x: BLUE_SCALE_X, y: BLUE_SCALE_Y },
  },
]

/**
 * 胶囊形态的双层椭圆，逐值换算自设计稿浮层胶囊的光效节点
 *
 * 与 {@link GLOW_LAYERS} 的差别是**椭圆有多大一部分露在容器里**：那组的 `rx` 是画框宽的
 * 69%，且椭圆几乎整枚可见，是给 402×288 这种近方形画框铺满整片色相用的；
 * 这组则沉得很深（`cy` 远在画框底边之下），只露出顶上薄薄一条弧。
 *
 * 三个数决定弧长什么样，全部相对**容器宽度**，与容器高无关：
 * - 弧高 `(GLOW_FRAME.height - (cy - ry)) / GLOW_FRAME.width` = 35/402 ≈ **8.7%**
 * - 弧跨 `2 · rx/402 · √(1 - ((cy - GLOW_FRAME.height) / ry)²)` ≈ **84%**
 * - 模糊 `sigma/402` ≈ 3.2%，约为弧高的 0.37 倍——再糊下去弧度就被抹平成一片雾
 *
 * 这三个比值是这套光效唯一的形状来源，容器 140×40 还是 900×80 都不变——
 * 前提是同一个 `level`：{@link mapLevelToField} 的 scaleX/scaleY 故意不等比
 * （1.05 vs 1.16），满音量时弧会比静音时略尖，那是「说话把光顶起来」的响应。
 * 上一版把 `ry` 定成 184 是在补偿「纵向按容器高算」的旧映射，几何一改成等比就偏尖了
 *
 * 没有蓝层：设计稿的胶囊光效只有粉与浅粉两层，底部蓝紫是大尺寸画框才展开的段落
 */
export const CAPSULE_GLOW_LAYERS: readonly GlowLayer[] = [
  {
    id: 'pink',
    cx: 201,
    cy: 353,
    rx: 223,
    ry: 100,
    sigma: 13,
    color: '#EB92E3',
    track: { x: PINK_SCALE_X, y: PINK_SCALE_Y },
  },
  {
    /** 更浅的核心，压在粉层里侧：沉得更低所以露出的弧更窄，读起来是一枚亮心而不是第二道弧 */
    id: 'lightPink',
    cx: 201,
    cy: 373,
    rx: 223,
    ry: 100,
    sigma: 13,
    color: '#FCDEFA',
    track: { x: LIGHT_PINK_SCALE_X, y: LIGHT_PINK_SCALE_Y },
  },
]

const EASE_SMOOTH = 'cubic-bezier(0.5, 0, 0.5, 1)'

/**
 * 设计稿给出的粉层缩放动效，6s 循环
 *
 * **固定动画，与音量无关**：这一层的大小起伏是"活着"的表达，不是音量表。
 * 用它的调用方应同时把 {@link LevelResponse} 的 `scaleX/scaleY` 设为 1，
 * 否则音量会再叠一层缩放上去
 *
 * x 与 y 的时间点刻意错开（0.8/1.7/2.9… vs 1.1/2.3/3.4…），
 * 两轴同步会读成机械的整体缩放而不是呼吸
 */
export const DESIGN_PINK_SCALE_TRACK: GlowScaleTrack = {
  x: [
    { at: 0, value: 1.00, easing: EASE_SMOOTH },
    { at: 800, value: 1.04, easing: 'ease-in-out' },
    { at: 1700, value: 0.97, easing: 'ease-out' },
    { at: 2900, value: 1.03, easing: 'ease-in-out' },
    { at: 3800, value: 0.95, easing: 'ease-in' },
    { at: 5000, value: 1.03, easing: 'ease-in-out' },
    { at: 6000, value: 1.00, easing: 'ease-in-out' },
  ],
  y: [
    { at: 0, value: 1.00, easing: EASE_SMOOTH },
    { at: 1100, value: 0.96, easing: 'ease-in-out' },
    { at: 2300, value: 1.04, easing: 'ease-out' },
    { at: 3400, value: 0.97, easing: 'ease-in-out' },
    { at: 4700, value: 1.05, easing: 'ease-in' },
    { at: 6000, value: 1.00, easing: 'ease-in-out' },
  ],
}
const EASE_IN = 'cubic-bezier(0.42, 0, 1, 1)'
const EASE_OUT = 'cubic-bezier(0, 0, 0.58, 1)'
const EASE_IN_OUT = 'cubic-bezier(0.42, 0, 0.58, 1)'

/**
 * 整组共用的透明度轨道，首尾同为 0.56
 *
 * 关键帧间隔刻意不规则、缓动四种混用，读起来才像呼吸而不是正弦。
 * 每个关键帧上的 easing 作用于**它到下一帧**的区间
 */
export const GLOW_OPACITY_TRACK: readonly GlowOpacityKeyframe[] = [
  { at: 0, value: 0.56, easing: EASE_SMOOTH },
  { at: 500, value: 0.67, easing: EASE_IN_OUT },
  { at: 900, value: 0.51, easing: EASE_OUT },
  { at: 1500, value: 0.61, easing: EASE_IN_OUT },
  { at: 1900, value: 0.47, easing: EASE_IN },
  { at: 2600, value: 0.70, easing: EASE_IN_OUT },
  { at: 3100, value: 0.58, easing: EASE_OUT },
  { at: 3500, value: 0.65, easing: EASE_IN_OUT },
  { at: 4000, value: 0.48, easing: EASE_IN },
  { at: 4600, value: 0.68, easing: EASE_IN_OUT },
  { at: 5200, value: 0.53, easing: EASE_OUT },
  { at: 5600, value: 0.62, easing: EASE_IN_OUT },
  { at: BREATH_CYCLE_MS, value: 0.56, easing: 'linear' },
]

/** 音量响应的标定值 */
export type LevelResponse = {
  /** 静音时光场的不透明度 */
  minOpacity: number
  /** 满音量时光场的不透明度 */
  maxOpacity: number
  /** 满音量时光场的横向缩放 */
  scaleX: number
  /** 满音量时光场的纵向缩放 */
  scaleY: number
}

/** 一层高斯模糊椭圆的设计参数 */
export type GlowLayer = {
  /** 层标识，同时用于生成滤镜 id */
  id: string
  cx: number
  cy: number
  rx: number
  ry: number
  /**
   * 模糊半径，以 {@link GLOW_FRAME} 的宽度为基准单位
   *
   * 渲染时按容器宽度等比换算成 CSS 像素（`cqw`），因此**两个轴上恒等**——
   * 这正是与旧实现的分野：那时 `stdDeviation` 被非等比变换拽成 σ_x 随宽、σ_y 随高，
   * 扁容器里纵向模糊塌成硬边。整体微调用 `blurScale`
   */
  sigma: number
  /** 层色，CSS 颜色字符串 */
  color: string
  /**
   * 本层不透明度；与整组光场透明度相乘
   * @default 1
   */
  opacity?: number
  /**
   * 本层的缩放轨道；省略即该层不参与呼吸，恒定在原始尺寸
   *
   * x/y 分开且层间错相，是光晕「像活的」而不是「机械放大缩小」的主要来源，
   * 自定义时不要简化成单一等比缩放
   */
  track?: GlowScaleTrack
}

/**
 * 一层的双轴缩放轨道
 *
 * 两种写法都收：等间隔采样数组（旧的 61 点，隐含 linear），
 * 或带时间与缓动的关键帧（设计稿的动效规格就是这种）。
 * **x 与 y 各自独立**——设计稿里两轴的时间点常常不一样，
 * 压在同一串采样里就装不下了
 */
export type GlowScaleTrack = {
  x: readonly number[] | readonly GlowScaleKeyframe[]
  y: readonly number[] | readonly GlowScaleKeyframe[]
}

/** 缩放轨道的一个关键帧；`easing` 作用于**它到下一帧**的区间 */
export type GlowScaleKeyframe = {
  /** 距周期起点的毫秒数 */
  at: number
  value: number
  easing: string
}

/**
 * 把任意一种轨道写法归一成 WAAPI 关键帧
 *
 * 归一化收在这里，`GlowField` 只跟一种形状打交道
 *
 * @param axis 单轴轨道
 * @param cycleMs 关键帧时间所基于的周期；采样数组按等间隔铺满该周期
 * @param direction 该轨道作用于哪个轴；另一轴恒为 1，由兄弟元素负责
 */
export function toScaleKeyframes(
  axis: readonly number[] | readonly GlowScaleKeyframe[],
  cycleMs: number,
  direction: 'x' | 'y',
): Keyframe[] {
  const transform = (value: number) => direction === 'x'
    ? `scale(${value}, 1)`
    : `scale(1, ${value})`

  if (axis.length === 0) return []

  if (typeof axis[0] === 'number') {
    const samples = axis as readonly number[]
    const lastIndex = samples.length - 1
    return samples.map((value, index) => ({
      transform: transform(value),
      offset: lastIndex === 0
        ? 0
        : index / lastIndex,
      easing: 'linear',
    }))
  }

  return (axis as readonly GlowScaleKeyframe[]).map(frame => ({
    transform: transform(frame.value),
    offset: Math.min(1, Math.max(0, frame.at / cycleMs)),
    easing: frame.easing,
  }))
}

/** 透明度轨道的一个关键帧 */
export type GlowOpacityKeyframe = {
  /** 距周期起点的毫秒数 */
  at: number
  value: number
  /** 本帧到下一帧区间的缓动 */
  easing: string
}

/** 强度映射后的光场整体表现 */
export type GlowFieldState = {
  opacity: number
  scaleX: number
  scaleY: number
}

/**
 * 按「相对容器宽度的比例」构造一组弧形椭圆
 *
 * {@link GlowLayer} 的 `cx/cy/rx/ry/sigma` 是 {@link GLOW_FRAME} 坐标系里的数，
 * 直接手写既难核对也容易写错纵向那一步——画布高度是由容器**宽度**导出的
 * （锁死画框宽高比），所以 y 方向必须除掉这个系数，否则会差 288/402 倍。
 * 这个函数把换算收在一处，调用方只需要给设计稿上量得到的比例
 *
 * 只换几何：颜色与呼吸轨道原样沿用 `baseLayers`，因此配色和动效不会漂移
 *
 * @param arc 相对容器宽度的比例，全部为 0-1 的小数
 * @param baseLayers 提供颜色与呼吸轨道的层组；层数即结果层数
 * @param innerArcRatio 第 N 层露出的弧高相对第一层的比例，默认沿用 `baseLayers` 自身的关系
 */
export function buildArcLayers(
  arc: ArcRatios,
  baseLayers: readonly GlowLayer[] = CAPSULE_GLOW_LAYERS,
  innerArcRatio?: number,
): readonly GlowLayer[] {
  const fieldAspect = GLOW_FRAME.height / GLOW_FRAME.width
  const toFrameX = (ratio: number) => ratio * GLOW_FRAME.width
  const toFrameY = (ratio: number) => (ratio / fieldAspect) * GLOW_FRAME.height

  const rx = toFrameX(arc.halfWidth)
  const ry = toFrameY(arc.halfHeight)
  const sigma = toFrameX(arc.blur)
  /** 由弧顶高度反推椭圆中心：画框底边 − 弧高 + 半高 */
  const cyOf = (rise: number) => GLOW_FRAME.height - toFrameY(rise) + ry

  const baseRise = (layer: GlowLayer) => GLOW_FRAME.height - (layer.cy - layer.ry)
  const ratio = innerArcRatio ?? (baseLayers.length > 1
    ? baseRise(baseLayers[1]) / baseRise(baseLayers[0])
    : 1)

  return baseLayers.map((layer, index) => ({
    ...layer,
    cx: GLOW_FRAME.width / 2,
    cy: cyOf(index === 0
      ? arc.rise
      : arc.rise * ratio ** index),
    rx,
    ry,
    sigma,
  }))
}

/**
 * 设计稿录音光效组件的原始框，同时是 {@link DESIGN_ARC} 的换算基准
 *
 * 取自 Figma `iOS 18 - Voice` 实例的节点尺寸。它比 {@link GLOW_FRAME} 矮 78px：
 * `GLOW_FRAME` 是把光场画布向下延到椭圆最深处的那个框，
 * 底边 288 对应的正是本框的底边 210
 */
export const DESIGN_GLOW_COMPONENT = { width: 402, height: 210 } as const

/**
 * 设计稿光场的弧形比例，逐值换算自 {@link GLOW_LAYERS} 的第一层
 *
 * 以 {@link DESIGN_GLOW_COMPONENT} 的宽 402 为基准：
 * - `halfWidth` = `rx` 280 ÷ 402
 * - `halfHeight` = `ry` 166 ÷ 402
 * - `rise` = (组件底边 210 − 弧顶 30) ÷ 402，弧顶 = `cy` 196 − `ry` 166
 * - `blur` = `stdDeviation` 53.9 ÷ 402
 *
 * **直接用它意味着弧顶要顶到容器宽的 45%**——402 宽的手机上是 180px，
 * 换到 896 宽的桌面面板上就是 401px，半屏都是粉色。宽宿主先过
 * {@link squeezeLayers} 把纵向压回去
 */
export const DESIGN_ARC: ArcRatios = {
  halfWidth: 0.6965,
  halfHeight: 0.4129,
  rise: 0.4478,
  blur: 0.1341,
}

/**
 * 把一组层沿纵向压扁，横向原样保留
 *
 * 这套光效的几何全部相对**容器宽度**，所以同一组椭圆搬到两倍宽的宿主上，
 * 弧高也会跟着翻倍——设计稿手机上 180px 的弧到了 896 宽的桌面面板上变成 401px，
 * 半屏都是粉色。但「光该有多高」在观感上是个**绝对量**，不随宿主变宽而变高，
 * 于是需要按宽度比把纵向量压回去
 *
 * 压缩以**画框底边**为锚：`ry` 与「弧顶到底边的距离」同乘一个系数，
 * 弧顶因此按比例下沉，而底边始终贴着容器底
 *
 * `sigma` 一并乘同一个系数。CSS 的 `blur()` 各向同性，压不出椭圆核，
 * 所以横向也跟着变锐——可以接受：椭圆本就比容器宽得多，横向边缘在容器外或被遮罩吃掉，
 * 真正影响观感的是弧顶那条边化开多少，而它与 `rise` 的比值在压缩前后恒等
 *
 * **与「弧形不许随容器长宽比变形」不冲突**：那条禁的是跟着容器高度实时变，
 * 这里是一个由 `设计稿宽 / 宿主宽` 算出来的定值，同一个宿主上恒定
 *
 * @param layers 源层组，通常是 {@link GLOW_LAYERS}
 * @param factor 纵向压缩系数，一般取 `设计稿宽 / 宿主宽`；1 表示原样返回
 */
export function squeezeLayers(layers: readonly GlowLayer[], factor: number): readonly GlowLayer[] {
  if (factor === 1) return layers

  const safeFactor = Math.max(0, factor)
  return layers.map(layer => ({
    ...layer,
    cy: GLOW_FRAME.height - (GLOW_FRAME.height - layer.cy) * safeFactor,
    ry: layer.ry * safeFactor,
    sigma: layer.sigma * safeFactor,
  }))
}

/** 弧形的几何比例，全部相对**容器宽度** */
export type ArcRatios = {
  /** 椭圆半宽；0.5 表示正好铺满容器 */
  halfWidth: number
  /** 椭圆半高，决定弧的胖瘦 */
  halfHeight: number
  /** 弧顶高出容器底边多少 */
  rise: number
  /** 椭圆模糊半径 */
  blur: number
}
