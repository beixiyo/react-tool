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

/**
 * 归一化强度到光场整体表现的映射
 *
 * 与呼吸轨道相乘而非相加：呼吸负责「活着」的底噪，强度负责「说话」的起伏
 */
export function mapLevelToField(level: number): GlowFieldState {
  const normalized = clamp01(level)
  return {
    /**
     * 下限刻意抬到 0.75：呼吸轨道本身已经把整组压到 0.47~0.70，
     * 再乘一个低系数会让最暗的那层直接掉到看不见。
     * 这个下限是照 {@link GLOW_LAYERS} 的蓝层定的（它最容易先消失），
     * 对只有粉与浅粉的 {@link CAPSULE_GLOW_LAYERS} 属于顺带偏保守
     */
    opacity: 0.75 + normalized * 0.25,
    scaleX: 1 + normalized * 0.05,
    scaleY: 1 + normalized * 0.16,
  }
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
   * 本层的缩放轨道；省略即该层不参与呼吸，恒定在原始尺寸
   *
   * x/y 分开且层间错相，是光晕「像活的」而不是「机械放大缩小」的主要来源，
   * 自定义时不要简化成单一等比缩放
   */
  track?: GlowScaleTrack
}

/** 一层的双轴缩放轨道，61 点等间隔（100ms 一帧）铺满整个 6s 周期，两条数组等长 */
export type GlowScaleTrack = {
  x: readonly number[]
  y: readonly number[]
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
