/**
 * Animate 组件类型声明
 */
import type { MotionProps, Variants } from 'motion/react'
import type { CSSProperties, Ref } from 'react'
import type * as React from 'react'
import type { SizeTransitionProps, SizeTransitionTag } from '../SizeTransition'
import { variantsMap } from './constants'

export type AnimateProps =
  & {
    ref?: Ref<HTMLDivElement>
    className?: string
    style?: CSSProperties
    children?: React.ReactNode

    /**
     * 无回弹弹簧的时长（秒）
     * @default 0.3
     */
    duration?: number

    /**
     * 动画变体配置
     * 支持字符串枚举或自定义 Variants 对象
     * @default 'top-bottom'
     */
    variants?: keyof typeof variantsMap | MotionProps['variants']
  }
  & Omit<MotionProps, 'variants'>

export type AnimateShowProps =
  & {
    className?: string
    style?: CSSProperties
    children?: React.ReactNode

    show?: boolean
    display?: string
    visibilityMode?: boolean
    /**
     * 无回弹弹簧的时长（秒）
     * @default 0.3
     */
    duration?: number

    /**
     * 动画变体配置
     * 支持字符串枚举或自定义 Variants 对象
     * @default 'top-bottom'
     */
    variants?: keyof typeof variantsMap | MotionProps['variants']

    /**
     * 退出动画是否采用 set 同步模式
     * 这将关闭退出动画
     * ### 适用于路由动画，可以解决布局异常问题
     */
    exitSetMode?: boolean

    /**
     * 是否在组件挂载时播放动画
     * @default false
     */
    animateOnMount?: boolean
  }
  & Omit<MotionProps, 'variants'>
  & React.ComponentPropsWithRef<'div'>

/** 浮层外壳的 Motion 与原生属性；布局/关闭语义仍由下拉组件拥有 */
export type DropdownMotion<Tag extends SizeTransitionTag = 'div'> =
  | false
  | (
    Omit<SizeTransitionProps<Tag>, 'open' | 'children' | 'variants' | 'inert' | 'aria-hidden'> & {
      /** 整套替换默认变体。回调收到用于定位的内容高度，单位为 px */
      variants?: Variants | ((context: { height: number }) => Variants)
    }
  )
