/**
 * GlowField 类型声明
 */
import type * as React from 'react'
import type { GlowLayer, LevelResponse } from '../constants'

export type GlowFieldProps = {
  /**
   * 归一化强度，超出 0-1 的值会在组件边界被截断
   * @default 0
   */
  level?: number
  /**
   * 是否播放 6s 呼吸循环
   *
   * 不再受 `prefers-reduced-motion` 影响：所有用户看到同一套效果
   * 要按系统偏好关掉，调用方自行读 `useReducedMotion()` 传入 false
   * @default true
   */
  breathing?: boolean
  /**
   * 覆盖默认的三层椭圆
   * @default GLOW_LAYERS
   */
  layers?: readonly GlowLayer[]
  /**
   * 光场的整体缩放，等比且贴底边向上长；负值按 0 处理
   *
   * 实现上是外层 transform，因此几何与 `blur()` 一起放大，**只改大小、不改弧的胖瘦**
   * 想改弧形本身要动 {@link GlowLayer} 的 `rx` / `ry` / `cy`
   * @default 1
   */
  scale?: number
  /**
   * 模糊半径的整体倍率
   *
   * 每层的基准是 {@link GlowLayer.sigma}，渲染时按容器宽度等比换算，
   * 所以常规情况下不需要动这个值——它是给「同一组椭圆想更糊/更锐」时留的口子
   * 与 {@link GlowFieldProps.scale} 的区别：那个连模糊一起放大（形状不变），
   * 这个只动模糊（形状会变糊或变锐）
   * @default 1
   */
  blurScale?: number
  /**
   * 覆盖音量→光场的响应标定；只传部分字段时其余走 {@link LEVEL_RESPONSE}
   *
   * 这是「说话时光变多亮、涨多高」的全部来源。默认 opacity 只涨 1.33 倍，
   * 观感上的动态主要由 `scaleY`（1→1.16）与亮条宽度提供，调之前先想清楚要动哪一个
   */
  levelResponse?: Partial<LevelResponse>
  /**
   * 呼吸起伏的振幅倍率
   *
   * 绕轨道中点缩放：0 为完全静止（恒定在中点亮度），1 为设计稿原值，
   * 大于 1 会夸张化。不会连带改变整体亮度——那是 {@link GlowFieldProps.levelResponse} 的事
   * @default 1
   */
  breathAmplitude?: number
  /**
   * 呼吸循环周期，毫秒
   * @default 6000
   */
  breathCycleMs?: number
  /**
   * 顶部淡出区高度占**光场画布**高度的比例
   *
   * 画布高度是容器宽的 `GLOW_FRAME.height / GLOW_FRAME.width`（约 72%），
   * 所以在扁容器里画布顶远在可视区之外，这个淡出**根本不会露出来**——
   * 它只对「容器高接近甚至超过画布高」的近方形宿主有意义
   * @default 1 / 6
   */
  fadeFraction?: number
  /**
   * 横向偏移，单位为光场宽度的比例，正值向右
   * @default 0
   */
  offsetX?: number
} & React.HTMLAttributes<HTMLDivElement>
