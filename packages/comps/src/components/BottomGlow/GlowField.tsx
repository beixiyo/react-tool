'use client'

import type { GlowLayer } from './constants'
import { useReducedMotion } from 'motion/react'
import { memo, useEffect, useRef } from 'react'
import { cn } from 'utils'
import {
  BREATH_CYCLE_MS,
  buildTopFadeMask,
  FADE_HEIGHT_FRACTION,
  GLOW_FRAME,
  GLOW_LAYERS,
  GLOW_OPACITY_TRACK,
  mapLevelToField,
} from './constants'

/** 画布高度占容器宽度的比例，锁死设计稿画框的宽高比 */
const FRAME_ASPECT_PERCENT = (GLOW_FRAME.height / GLOW_FRAME.width) * 100

/** 关闭呼吸时停在周期起点，与轨道首帧一致 */
const STATIC_OPACITY = GLOW_OPACITY_TRACK[0].value

/**
 * 多层模糊椭圆构成的光场
 *
 * 只负责把强度渲染成画面，不感知音频、不持有采集逻辑。
 *
 * **光场只认容器宽度这一个尺寸。**画布锁死 {@link GLOW_FRAME} 的宽高比、按容器宽
 * 换算出高度、贴着容器底边向上铺；容器高只决定往上露出多少，切不到几何。
 * 于是弧的胖瘦是一个常数，容器再扁再宽，弧看起来都一样，只是整体变大变小。
 *
 * 这条不变量是踩出来的。最初整块画在一张 `preserveAspectRatio="none"` 的 SVG 里，
 * `stdDeviation` 这个标量被非等比变换拽成两个物理值（σ_x 随容器宽、σ_y 随容器高），
 * 扁容器里纵向模糊塌成硬边。改成 div + `cqw` 之后模糊各向同性了，**几何却还留在
 * 老规则上**：横向按容器宽、纵向按容器高。表现是同一套椭圆在 330×90 的输入框里
 * 弧高/跨度 10.4%（太尖），在 896×40 的页面底栏里只剩 3.3%（塌成一条雾带）。
 * 三次都是同一个病根：让容器的两个维度分别去拉一个本该整体缩放的图形
 */
export const GlowField = memo<GlowFieldProps>((props) => {
  const {
    level = 0,
    breathing = true,
    layers = GLOW_LAYERS,
    scale = 1,
    blurScale = 1,
    fadeFraction = FADE_HEIGHT_FRACTION,
    offsetX = 0,
    className,
    style,
    ...rest
  } = props

  const reduceMotion = useReducedMotion()
  const animated = breathing && !reduceMotion

  /** 负值会把光场翻到容器上方，归一化收口在这里 */
  const safeScale = Math.max(0, scale)

  const groupRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<Array<HTMLDivElement | null>>([])

  /**
   * 呼吸轨道走 Web Animations API 而不是 motion/react：
   * 61 点 × 3 层的无限循环若由 JS 逐帧驱动会常驻主线程；
   * 交给 WAAPI 后 transform/opacity 跑在合成层，且完全不经过 React 渲染
   */
  useEffect(() => {
    if (!animated)
      return

    const animations: Animation[] = []

    layers.forEach((layer, index) => {
      const el = layerRefs.current[index]
      const track = layer.track
      if (!el || !track)
        return

      const lastIndex = track.x.length - 1
      animations.push(el.animate(
        track.x.map((scaleX, frame) => ({
          transform: `scale(${scaleX}, ${track.y[frame]})`,
          offset: frame / lastIndex,
        })),
        { duration: BREATH_CYCLE_MS, iterations: Number.POSITIVE_INFINITY, easing: 'linear' },
      ))
    })

    const group = groupRef.current
    if (group) {
      animations.push(group.animate(
        GLOW_OPACITY_TRACK.map(keyframe => ({
          opacity: keyframe.value,
          offset: keyframe.at / BREATH_CYCLE_MS,
          easing: keyframe.easing,
        })),
        { duration: BREATH_CYCLE_MS, iterations: Number.POSITIVE_INFINITY },
      ))
    }

    return () => animations.forEach(animation => animation.cancel())
  }, [animated, layers])

  const field = mapLevelToField(level)
  const mask = buildTopFadeMask(fadeFraction)

  return (
    <div
      aria-hidden
      className={ cn('GlowField @container pointer-events-none absolute inset-x-0 bottom-0', className) }
      style={ {
        ...style,
        /**
         * 以下两项是不变量，**刻意排在 `...style` 之后**：调用方能透传任何别的样式，
         * 但不该从 style 里绕过画布的定义——尺寸走 {@link GlowFieldProps.scale}，
         * 淡出走 {@link GlowFieldProps.fadeFraction}
         *
         * 高度由容器宽度导出、且**不含 scale**：画布的宽高比必须恒等于 `GLOW_FRAME` 的，
         * 否则子层那套「横向按画框宽 %、纵向按画框高 %」的映射就会被拉变形。
         * 缩放因此挂在下一层的 transform 上，几何与模糊一起等比
         *
         * `cqw` 在本元素上解析的是**父级**查询容器的宽度，自身的 `@container`
         * 只服务于子层的模糊，两者不会打架
         */
        height: `${FRAME_ASPECT_PERCENT.toFixed(4)}cqw`,
        maskImage: mask,
        WebkitMaskImage: mask,
      } }
      { ...rest }
    >
      <div
        className="size-full origin-bottom transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none"
        style={ {
          opacity: field.opacity,
          /**
           * 缩放走 transform 而不是改画布高度：transform 会把整棵子树（含 `blur()`）
           * 一起等比放大，改高度则只拉长纵轴——椭圆变扁、模糊纹丝不动。
           * `origin-bottom` 保证放大时贴着容器底边往上长
           *
           * {@link mapLevelToField} 的 scaleX/scaleY 故意不等比（1.05 vs 1.16），
           * 那是「说话时光往上顶」的音量响应，与这里的等比缩放是两件事
           */
          transform: `translateX(${offsetX * 100}%) scale(${field.scaleX * safeScale}, ${field.scaleY * safeScale})`,
        } }
      >
        {
          /** 呼吸的整组透明度挂在这一层，与上面按音量给的透明度分开，两者相乘 */
        }
        <div
          ref={ groupRef }
          className="relative size-full"
          style={ animated
            ? undefined
            : { opacity: STATIC_OPACITY } }
        >
          { layers.map((layer, index) => (
            <div
              key={ layer.id }
              ref={ (el) => {
                layerRefs.current[index] = el
              } }
              className="absolute rounded-[50%]"
              style={ {
                /**
                 * 横向按画框宽取 %、纵向按画框高取 %，两者等价**只因为画布宽高比被锁死成
                 * 画框的宽高比**。这是个隐性前提：任何单独改画布高度的改动都会让椭圆变形，
                 * 曾经的 `scale` 就是这么把弧压扁的
                 */
                left: `${((layer.cx - layer.rx) / GLOW_FRAME.width) * 100}%`,
                top: `${((layer.cy - layer.ry) / GLOW_FRAME.height) * 100}%`,
                width: `${((layer.rx * 2) / GLOW_FRAME.width) * 100}%`,
                height: `${((layer.ry * 2) / GLOW_FRAME.height) * 100}%`,
                background: layer.color,
                /**
                 * 用 `cqw`（本元素自身即查询容器）而不是 px：模糊跟着容器宽度等比缩放，
                 * 且**两个轴上恒等**，容器再扁也不会畸变。这正是与旧实现的分野
                 */
                filter: `blur(${((layer.sigma / GLOW_FRAME.width) * 100 * blurScale).toFixed(4)}cqw)`,
                transformOrigin: 'center',
                transform: animated
                  ? undefined
                  : `scale(${layer.track?.x[0] ?? 1}, ${layer.track?.y[0] ?? 1})`,
              } }
            />
          )) }
        </div>
      </div>
    </div>
  )
})

GlowField.displayName = 'GlowField'

export type GlowFieldProps = {
  /**
   * 归一化强度，超出 0-1 的值会在组件边界被截断
   * @default 0
   */
  level?: number
  /**
   * 是否播放 6s 呼吸循环；`prefers-reduced-motion` 下强制关闭
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
   * 实现上是外层 transform，因此几何与 `blur()` 一起放大，**只改大小、不改弧的胖瘦**。
   * 想改弧形本身要动 {@link GlowLayer} 的 `rx` / `ry` / `cy`
   * @default 1
   */
  scale?: number
  /**
   * 模糊半径的整体倍率
   *
   * 每层的基准是 {@link GlowLayer.sigma}，渲染时按容器宽度等比换算，
   * 所以常规情况下不需要动这个值——它是给「同一组椭圆想更糊/更锐」时留的口子。
   * 与 {@link GlowFieldProps.scale} 的区别：那个连模糊一起放大（形状不变），
   * 这个只动模糊（形状会变糊或变锐）
   * @default 1
   */
  blurScale?: number
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
