/**
 * 交互控件（Input / NumberInput / Copy 等）共用的 sm / md / lg 尺度表
 * 只存放数值与换算，机制复用 sizeUtils；各组件按需取用，不在此处耦合组件逻辑
 */
import type { Size } from '../types'
import { getSizeStyles } from './sizeUtils'

/**
 * 数字 size 换算为字号 / 内嵌图标的比例（字号 = size * 0.4）
 * @default 0.4
 */
export const CONTROL_NUMERIC_RATIO = 0.4

/** 控件高度 + 字号类名：32 / 40 / 48px，字号 14 / 16 / 18px */
export const CONTROL_SIZE_CLASSES: Record<ControlSizeName, string> = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg',
}

/** 控件配套 label 的字号类名 */
export const CONTROL_FONT_CLASSES: Record<ControlSizeName, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

/** 控件内嵌图标（步进箭头、复制图标等）的像素值 */
export const CONTROL_ICON_PX: Record<ControlSizeName, number> = {
  sm: 14,
  md: 16,
  lg: 18,
}

/**
 * 获取控件的高度、字号样式与内嵌图标像素
 * 字符串档位返回类名，数字 size 返回行内高度与字号（高度 = size）
 * @param size 档位或数字高度
 * @returns 类名 / 行内样式二选一，以及内嵌图标像素
 */
export function getControlSizeStyles(size: Size): ControlSizeStyles {
  const styles = getSizeStyles(size, {
    classes: CONTROL_SIZE_CLASSES,
    getInlineStyle: (px) => ({
      height: `${px}px`,
      fontSize: `${px * CONTROL_NUMERIC_RATIO}px`,
    }),
  })

  return { ...styles, iconPx: getControlIconPx(size) }
}

/**
 * 获取控件 label 的字号样式（字符串档位走类名，数字走行内字号）
 * @param size 档位或数字高度
 */
export function getControlLabelStyles(size: Size) {
  return getSizeStyles(size, {
    classes: CONTROL_FONT_CLASSES,
    getInlineStyle: (px) => ({ fontSize: `${px * CONTROL_NUMERIC_RATIO}px` }),
  })
}

/**
 * 获取控件内嵌图标像素：档位查表，数字按高度 * 0.4 取整
 * @param size 档位或数字高度
 */
export function getControlIconPx(size: Size): number {
  return typeof size === 'number'
    ? Math.round(size * CONTROL_NUMERIC_RATIO)
    : CONTROL_ICON_PX[size]
}

export type ControlSizeName = Exclude<Size, number>

export type ControlSizeStyles = {
  /** 字符串档位对应的高度 + 字号类名 */
  className?: string
  /** 数字 size 对应的行内高度与字号 */
  style?: React.CSSProperties
  /** 内嵌图标像素 */
  iconPx: number
}
