import type { MotionProps } from 'motion/react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { Rounded, Size } from '../../types'

/** 预设档位保持原有宽高；数字表示高度（px），宽度为高度的四倍 */
export type SkeletonSize = 'xs' | Size | 'xl' | 'full'

/**
 * 骨架屏属性。组件渲染 div，勿直接置于 p 内；行内场景请用等排版容器承载
 * count = 1 时根节点即骨架行；其他 count 使用段落容器，HTML 属性挂在容器上
 */
export type SkeletonProps = {
  /** 自定义骨架行类名，多行时应用到每一行 */
  className?: string
  /** 自定义骨架行样式，多行时应用到每一行，优先于 size；小数末行宽度再乘以小数部分 */
  style?: CSSProperties
  /**
   * 是否启用扫光动画，同时控制容器 aria-busy
   * @default true
   */
  active?: boolean
  /**
   * 基础颜色，支持 CSS 颜色表达式
   * @default 'rgb(var(--skeletonBase) / 1)'（自动适配主题）
   */
  baseColor?: string
  /**
   * 扫光高亮颜色，支持 CSS 颜色表达式
   * @default 'rgb(var(--skeletonHighlight) / 1)'（自动适配主题）
   */
  highlightColor?: string
  /**
   * 单次扫光动画持续时间（秒）
   * @default 1
   */
  animationDuration?: number
  /**
   * 圆角档位、像素值或 'auto'
   * 'auto'（默认）走 CSS 默认 0.25em（随字号缩放）；className 的 rounded-* 类、档位与像素值均可覆盖
   * @default 'auto'
   */
  rounded?: 'auto' | Rounded | number
  /**
   * 预设档位或数字高度（px，宽度为高度四倍）
   * 未传时走 CSS 自适应默认：高度 1em（继承字号）、宽度 100%
   * className 的 h-* / w-* 工具类、显式 size 与 style 均可覆盖默认值
   * @default undefined（CSS 自适应）
   */
  size?: SkeletonSize
  /**
   * 骨架行数，支持小数（3.5 为三条完整行及一条半宽行）
   * 小数行通过 calc 缩放 style.width 或 size 宽度；自定义宽度请用 style 的长度或百分比
   * 0、负数及非有限数值不渲染行
   * @default 1
   */
  count?: number
  /** 可选内容，每条骨架行内重复渲染；count 为 0 时不渲染 */
  children?: ReactNode
} & HTMLAttributes<HTMLDivElement>

/** 骨架屏卡片组件的属性类型 */
export type SkeletonCardProps = {
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: CSSProperties
  /**
   * 入场动画延迟时间（秒）
   * @default 0
   */
  delay?: number
  /**
   * 是否显示标题骨架
   * @default true
   */
  showTitle?: boolean
  /**
   * 是否显示内容骨架
   * @default true
   */
  showContent?: boolean
  /**
   * 是否显示标签骨架
   * @default true
   */
  showTags?: boolean
  /**
   * 标题宽度的 Tailwind 类名，保持原有 API
   * @default 'w-3/4'
   */
  titleWidth?: string
  /**
   * 内容行数
   * @default 3
   */
  contentLines?: number
  /**
   * 标签数量
   * @default 2
   */
  tagCount?: number
} & MotionProps
