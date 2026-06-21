import type { HTMLMotionProps } from 'motion/react'
import type { REVEAL_VARIANTS } from './constants'

/** Available animation variant presets */
export type RevealVariant = keyof typeof REVEAL_VARIANTS

/**
 * Supported HTML element types for motion rendering.
 *
 * @remarks
 * `motion` supports many more intrinsic elements; this curated union covers the
 * common semantic tags. The forwarded `ref` is typed as `HTMLDivElement` for the
 * default `'div'` — when rendering a different tag (e.g. `'span'`, `'li'`), cast
 * the ref to the matching element type if you need precise typing.
 */
export type MotionAs
  = | 'div'
    | 'section'
    | 'span'
    | 'p'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'header'
    | 'footer'
    | 'main'
    | 'nav'
    | 'article'
    | 'aside'
    | 'figure'
    | 'li'
    | 'ul'
    | 'ol'
    | 'a'
    | 'button'

type BaseMotionProps = Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'whileInView' | 'viewport'>

export type ViewportConfig = {
  /**
   * Whether animation should only trigger once
   * @default true
   */
  once?: boolean
  /**
   * Percentage of element visible to trigger (0-1)
   * @default 0.15
   */
  amount?: number
}

export type ScrollRevealProps = {
  /**
   * Animation variant preset
   * @default 'fadeUp'
   */
  variant?: RevealVariant
  /**
   * Delay before animation starts (seconds)
   * @default 0
   */
  delay?: number
  /**
   * Animation duration (seconds)
   * @default 0.7
   */
  duration?: number
  /**
   * HTML element type to render
   * @default 'div'
   */
  as?: MotionAs
  /** Viewport trigger configuration */
  viewport?: ViewportConfig
  /**
   * Respect the user's `prefers-reduced-motion` setting.
   * When enabled and the user requests reduced motion, content renders in its
   * final state with no entrance animation.
   * Defaults to `false` so the animation always plays; opt in for accessibility.
   * @default false
   */
  respectReducedMotion?: boolean
} & React.PropsWithChildren<BaseMotionProps>

export type StaggerContainerProps = {
  /**
   * Delay between each child animation (seconds)
   * @default 0.1
   */
  stagger?: number
  /**
   * Initial delay before first child animates (seconds)
   * @default 0
   */
  delay?: number
  /**
   * HTML element type to render
   * @default 'div'
   */
  as?: MotionAs
  /** Viewport trigger configuration */
  viewport?: ViewportConfig
  /**
   * Respect the user's `prefers-reduced-motion` setting.
   * When enabled and the user requests reduced motion, stagger orchestration is
   * disabled and children render in their final state.
   * Defaults to `false` so the animation always plays; opt in for accessibility.
   * @default false
   */
  respectReducedMotion?: boolean
} & React.PropsWithChildren<BaseMotionProps>

export type StaggerItemProps = {
  /**
   * Animation variant preset
   * @default 'fadeUp'
   */
  variant?: RevealVariant
  /**
   * Animation duration (seconds)
   * @default 0.6
   */
  duration?: number
  /**
   * HTML element type to render
   * @default 'div'
   */
  as?: MotionAs
  /**
   * Respect the user's `prefers-reduced-motion` setting.
   * When enabled and the user requests reduced motion, the item snaps to its
   * final state with no transition.
   * Defaults to `false` so the animation always plays; opt in for accessibility.
   * @default false
   */
  respectReducedMotion?: boolean
} & React.PropsWithChildren<BaseMotionProps>
