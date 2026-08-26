'use client'

import type { GlowLayer } from './constants'
import { useReducedMotion } from 'motion/react'
import { memo, useEffect, useId, useRef } from 'react'
import { cn } from 'utils'
import {
  BREATH_CYCLE_MS,
  buildFilterRegion,
  buildTopFadeMask,
  FADE_HEIGHT_FRACTION,
  GLOW_FRAME,
  GLOW_LAYERS,
  GLOW_OPACITY_TRACK,
  GLOW_SCALE_TRACKS,
  mapLevelToField,
} from './constants'

/** 关闭呼吸时停在周期起点，与轨道首帧一致 */
const STATIC_OPACITY = GLOW_OPACITY_TRACK[0].value

/**
 * 三层高斯模糊椭圆构成的光场
 *
 * 只负责把强度渲染成画面，不感知音频、不持有采集逻辑。铺满调用方给定的容器，
 * 几何按 GLOW_FRAME 非等比拉伸，因此模糊半径随容器一起缩放，不会在大尺寸下失真
 */
export const GlowField = memo<GlowFieldProps>((props) => {
  const {
    level = 0,
    breathing = true,
    layers = GLOW_LAYERS,
    fadeFraction = FADE_HEIGHT_FRACTION,
    offsetX = 0,
    className,
    style,
    ...rest
  } = props

  /** useId 的原始值含非 ASCII 字符，不能直接进 SVG id */
  const uid = useId().replace(/[^a-z0-9]/gi, '')
  const reduceMotion = useReducedMotion()
  const animated = breathing && !reduceMotion

  const groupRef = useRef<SVGGElement>(null)
  const layerRefs = useRef<Array<SVGEllipseElement | null>>([])

  /**
   * 呼吸轨道走 Web Animations API 而不是 motion/react：
   * 61 点 × 3 层的无限循环若由 JS 逐帧驱动会常驻主线程；
   * 交给 WAAPI 后 transform/opacity 跑在合成层，且完全不经过 React 渲染
   */
  useEffect(() => {
    if (!animated)
      return

    const animations: Animation[] = []

    layers.forEach((_, index) => {
      const el = layerRefs.current[index]
      const track = GLOW_SCALE_TRACKS[index]
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
  /** 横向偏移做进 viewBox：粉层 rx 远大于画框，平移后不会露出空边 */
  const viewBox = `${(-offsetX * GLOW_FRAME.width).toFixed(3)} 0 ${GLOW_FRAME.width} ${GLOW_FRAME.height}`

  return (
    <div
      aria-hidden
      className={ cn('GlowField pointer-events-none absolute inset-x-0 bottom-0 h-full', className) }
      style={ { maskImage: mask, WebkitMaskImage: mask, ...style } }
      { ...rest }
    >
      <div
        className="size-full origin-bottom transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none"
        style={ {
          opacity: field.opacity,
          transform: `scale(${field.scaleX}, ${field.scaleY})`,
        } }
      >
        <svg viewBox={ viewBox } preserveAspectRatio="none" className="block size-full">
          <defs>
            { layers.map(layer => (
              <filter
                key={ layer.id }
                id={ `${uid}-${layer.id}` }
                colorInterpolationFilters="sRGB"
                { ...buildFilterRegion(layer) }
              >
                <feGaussianBlur stdDeviation={ layer.sigma } />
              </filter>
            )) }
          </defs>

          <g ref={ groupRef } style={ animated
            ? undefined
            : { opacity: STATIC_OPACITY } }
          >
            { layers.map((layer, index) => (
              <ellipse
                key={ layer.id }
                ref={ (el) => {
                  layerRefs.current[index] = el
                } }
                cx={ layer.cx }
                cy={ layer.cy }
                rx={ layer.rx }
                ry={ layer.ry }
                fill={ layer.color }
                filter={ `url(#${uid}-${layer.id})` }
                style={ {
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: animated
                    ? undefined
                    : `scale(${GLOW_SCALE_TRACKS[index]?.x[0] ?? 1}, ${GLOW_SCALE_TRACKS[index]?.y[0] ?? 1})`,
                } }
              />
            )) }
          </g>
        </svg>
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
   * 顶部淡出区高度占光场高度的比例
   * @default 1 / 6
   */
  fadeFraction?: number
  /**
   * 横向偏移，单位为画框宽度的比例，正值向右
   * @default 0
   */
  offsetX?: number
} & React.HTMLAttributes<HTMLDivElement>
