import type { HTMLMotionProps } from 'motion/react'
import type { REVEAL_VARIANTS } from './constants'

/** Available animation variant presets */
export type RevealVariant = keyof typeof REVEAL_VARIANTS

/** Supported HTML element types for motion rendering */
export type MotionAs
  = | 'div'
    | 'section'
    | 'span'
    | 'p'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'header'
    | 'footer'
    | 'article'
    | 'aside'
    | 'li'
    | 'ul'

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
} & React.PropsWithChildren<BaseMotionProps>
