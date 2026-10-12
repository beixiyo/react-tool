import type { CSSProperties } from 'react'

/** 保留原有预设尺寸，不能与通用控件高度表合并 */
export const SKELETON_SIZE_CLASSES = {
  xs: 'h-3 w-16',
  sm: 'h-4 w-24',
  md: 'h-5 w-32',
  lg: 'h-6 w-48',
  xl: 'h-8 w-64',
  full: 'h-full w-full',
}

/** 用于小数行的 calc，单位与预设 Tailwind 宽度保持一致 */
export const SKELETON_SIZE_WIDTHS = {
  xs: '4rem',
  sm: '6rem',
  md: '8rem',
  lg: '12rem',
  xl: '16rem',
  full: '100%',
}

export const SKELETON_NUMERIC_WIDTH_RATIO = 4

export const SKELETON_SIZE_CONFIG = {
  classes: SKELETON_SIZE_CLASSES,
  getInlineStyle: (size: number): CSSProperties => ({
    height: size,
    width: size * SKELETON_NUMERIC_WIDTH_RATIO,
  }),
}
