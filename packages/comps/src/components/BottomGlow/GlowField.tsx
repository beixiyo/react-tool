'use client'

import type { GlowLayer, GlowScaleKeyframe, GlowScaleTrack, LevelResponse } from './constants'
import { memo, useEffect, useRef } from 'react'
import { cn } from 'utils'
import {
  BREATH_CYCLE_MS,
  buildTopFadeMask,
  FADE_HEIGHT_FRACTION,
  GLOW_FRAME,
  GLOW_LAYERS,
  mapLevelToField,
  scaleBreathTrack,
  toScaleKeyframes,
} from './constants'

/** 画布高度占容器宽度的比例，锁死设计稿画框的宽高比 */
const FRAME_ASPECT_PERCENT = (GLOW_FRAME.height / GLOW_FRAME.width) * 100

/**
 * 轨道引用变了才递增的版本号
 *
 * 动画重建必须由**轨道**触发，而不是 `layers` 的数组引用：调用方经常在渲染里现算
 * layers（`buildArcLayers(...).map(...)`），引用每帧都变。若直接进依赖数组，
 * WAAPI 动画每帧被 cancel 重建，`currentTime` 永远停在 0——表现是动效完全不动，
 * 而 `getAnimations()` 仍报告 `running`，控制台一句警告都没有
 */
function useTrackRevision(layers: readonly GlowLayer[]): number {
  const previous = useRef<Array<GlowScaleTrack | undefined>>([])
  const revision = useRef(0)

  const current = layers.map(layer => layer.track)
  const changed = current.length !== previous.current.length
    || current.some((track, index) => track !== previous.current[index])

  if (changed) {
    previous.current = current
    revision.current += 1
  }

  return revision.current
}

/** 关闭呼吸时停在轨道首帧；采样数组与关键帧两种写法都要认 */
function firstScale(axis?: readonly number[] | readonly GlowScaleKeyframe[]): number {
  const first = axis?.[0]
  if (first === undefined) return 1
  return typeof first === 'number'
    ? first
    : first.value
}

/** 关闭呼吸时停在周期起点，与轨道首帧一致 */
const staticOpacity = (breathAmplitude: number) => scaleBreathTrack(breathAmplitude)[0].value

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
    levelResponse,
    breathAmplitude = 1,
    breathCycleMs = BREATH_CYCLE_MS,
    fadeFraction = FADE_HEIGHT_FRACTION,
    offsetX = 0,
    className,
    style,
    ...rest
  } = props

  /**
   * 呼吸只看 `breathing`，**不再读 `prefers-reduced-motion`**
   *
   * 产品要求所有用户看到同一套效果。这是有意放弃这项无障碍适配：
   * 需要按系统偏好关掉的调用方，自己读 `useReducedMotion()` 后传 `breathing={false}`
   */
  const animated = breathing

  /** 负值会把光场翻到容器上方，归一化收口在这里 */
  const safeScale = Math.max(0, scale)

  const groupRef = useRef<HTMLDivElement>(null)
  /** x 与 y 分挂两层元素：设计稿里两轴的时间点常常错开，合成一条轨道就装不下各自的缓动 */
  const scaleXRefs = useRef<Array<HTMLDivElement | null>>([])
  const scaleYRefs = useRef<Array<HTMLDivElement | null>>([])

  /** 效果里读 ref 而不是闭包：`layers` 不进依赖数组，见 {@link useTrackRevision} */
  const layersRef = useRef(layers)
  layersRef.current = layers
  const trackRevision = useTrackRevision(layers)

  /**
   * 呼吸轨道走 Web Animations API 而不是 motion/react：
   * 61 点 × 3 层的无限循环若由 JS 逐帧驱动会常驻主线程；
   * 交给 WAAPI 后 transform/opacity 跑在合成层，且完全不经过 React 渲染
   */
  useEffect(() => {
    if (!animated)
      return

    const animations: Animation[] = []

    layersRef.current.forEach((layer, index) => {
      const track = layer.track
      if (!track)
        return

      const axes = [
        { el: scaleXRefs.current[index], axis: track.x, direction: 'x' as const },
        { el: scaleYRefs.current[index], axis: track.y, direction: 'y' as const },
      ]
      axes.forEach(({ el, axis, direction }) => {
        if (!el)
          return
        animations.push(el.animate(
          toScaleKeyframes(axis, breathCycleMs, direction),
          { duration: breathCycleMs, iterations: Number.POSITIVE_INFINITY },
        ))
      })
    })

    const group = groupRef.current
    if (group) {
      animations.push(group.animate(
        scaleBreathTrack(breathAmplitude).map(keyframe => ({
          opacity: keyframe.value,
          /** `at` 是相对设计稿 6s 周期的毫秒数，先归一化再由 duration 拉伸到目标周期 */
          offset: keyframe.at / BREATH_CYCLE_MS,
          easing: keyframe.easing,
        })),
        { duration: breathCycleMs, iterations: Number.POSITIVE_INFINITY },
      ))
    }

    return () => animations.forEach(animation => animation.cancel())
  }, [animated, trackRevision, breathAmplitude, breathCycleMs])

  const field = mapLevelToField(level, levelResponse)
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
        className="size-full origin-bottom transition-[opacity,transform] duration-100 ease-out"
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
            : { opacity: staticOpacity(breathAmplitude) } }
        >
          { layers.map((layer, index) => (
            <div
              key={ layer.id }
              ref={ (el) => {
                scaleXRefs.current[index] = el
              } }
              className="absolute"
              style={ {
                /**
                 * 横向按画框宽取 %、纵向按画框高取 %，两者等价**只因为画布宽高比被锁死成
                 * 画框的宽高比**。这是个隐性前提：任何单独改画布高度的改动都会让椭圆变形
                 */
                left: `${((layer.cx - layer.rx) / GLOW_FRAME.width) * 100}%`,
                top: `${((layer.cy - layer.ry) / GLOW_FRAME.height) * 100}%`,
                width: `${((layer.rx * 2) / GLOW_FRAME.width) * 100}%`,
                height: `${((layer.ry * 2) / GLOW_FRAME.height) * 100}%`,
                transformOrigin: 'center',
                transform: animated
                  ? undefined
                  : `scale(${firstScale(layer.track?.x)}, 1)`,
              } }
            >
              <div
                ref={ (el) => {
                  scaleYRefs.current[index] = el
                } }
                className="size-full rounded-[50%]"
                style={ {
                  background: layer.color,
                  /**
                   * 用 `cqw`（查询容器是光场本体）而不是 px：模糊跟着容器宽度等比缩放，
                   * 且**两个轴上恒等**，容器再扁也不会畸变
                   */
                  filter: `blur(${((layer.sigma / GLOW_FRAME.width) * 100 * blurScale).toFixed(4)}cqw)`,
                  transformOrigin: 'center',
                  transform: animated
                    ? undefined
                    : `scale(1, ${firstScale(layer.track?.y)})`,
                } }
              />
            </div>
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
   * 是否播放 6s 呼吸循环
   *
   * 不再受 `prefers-reduced-motion` 影响：所有用户看到同一套效果。
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
