/**
 * BottomGlow 光场的设计常量
 *
 * 几何、色彩与动画轨道均来自同一份设计稿（Figma SVG payload），与 Android 端
 * AskVoiceGlow 逐值对齐，两端观感统一。改动前先确认设计侧已同步。
 */

/** 设计稿坐标系，同时是光场 SVG 的 viewBox 基准 */
export const GLOW_FRAME = { width: 402, height: 288 } as const

/**
 * 三层高斯模糊椭圆，数组顺序即绘制顺序（自下而上：粉 → 浅粉 → 蓝）
 *
 * 三层中心都对齐在画面横向正中，cy 依次下沉到容器底边附近或下方，
 * 叠加后形成「底部中央蓝紫、向上与向两侧转粉」的双向色相渐变
 */
export const GLOW_LAYERS: readonly GlowLayer[] = [
  { id: 'pink', cx: 201, cy: 273.8, rx: 280, ry: 166, sigma: 53.9, color: '#EB92E3' },
  { id: 'lightPink', cx: 201, cy: 313.8, rx: 280, ry: 166, sigma: 53.9, color: '#FCDEFA' },
  { id: 'blue', cx: 201.001, cy: 365.8, rx: 188.741, ry: 132, sigma: 75.5, color: '#5F7EE9' },
]

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
 * 单层的滤镜作用域
 *
 * feGaussianBlur 默认作用域只比包围盒大 10%，装不下 3σ 的模糊尾巴会被裁出硬边。
 * 按各层自己的 σ 与半径算，避免统一放大带来的无谓像素开销
 */
export function buildFilterRegion(layer: GlowLayer) {
  const marginX = (3.4 * layer.sigma) / (2 * layer.rx)
  const marginY = (3.4 * layer.sigma) / (2 * layer.ry)
  return {
    x: `${(-marginX * 100).toFixed(2)}%`,
    y: `${(-marginY * 100).toFixed(2)}%`,
    width: `${((1 + 2 * marginX) * 100).toFixed(2)}%`,
    height: `${((1 + 2 * marginY) * 100).toFixed(2)}%`,
  }
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
     * 再乘一个低系数会让底部蓝层直接掉到看不见，色相故事只剩粉
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
 * 每层 x/y 双轴异相的缩放轨道，61 点等间隔（100ms 一帧）覆盖整个 6s 周期
 *
 * 顺序与 [GLOW_LAYERS] 一一对应。x/y 分开且层间错相是光晕「像活的」而不是
 * 「机械放大缩小」的主要来源，不要简化成单一等比缩放
 */
export const GLOW_SCALE_TRACKS: readonly GlowScaleTrack[] = [
  { x: PINK_SCALE_X, y: PINK_SCALE_Y },
  { x: LIGHT_PINK_SCALE_X, y: LIGHT_PINK_SCALE_Y },
  { x: BLUE_SCALE_X, y: BLUE_SCALE_Y },
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
  /** 高斯标准差，单位与 [GLOW_FRAME] 同为设计单位 */
  sigma: number
  /** 层色，CSS 颜色字符串 */
  color: string
}

/** 一层的双轴缩放轨道，两条数组等长且等间隔铺满整个周期 */
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
