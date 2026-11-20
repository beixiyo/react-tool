import type { SliderStyleConfig } from './types'

/**
 * 默认样式配置
 */
export const DEFAULT_STYLE_CONFIG: SliderStyleConfig = {
  handle: {
    sizeClassName: 'w-4 h-4',
    color: 'bg-background border-brand',
    border: 'border-2',
    rounded: 'rounded-full',
    hover: 'hover:shadow-sm',
    focus: 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand',
  },
  track: {
    background: 'bg-border',
    sizeClassName: 'h-1', // 默认水平方向，垂直方向会在组件中动态设置
    rounded: 'rounded-full',
  },
  fill: {
    color: 'bg-brand',
    rounded: 'rounded-full',
  },
  marks: {
    dotColor: 'bg-background border-border2',
    activeDotColor: 'bg-brand border-brand',
    labelColor: 'text-text2',
  },
}

/**
 * 默认属性值
 */
export const DEFAULT_PROPS = {
  disabled: false,
  keyboard: true,
  dots: false,
  included: true,
  max: 100,
  min: 0,
  range: false,
  reverse: false,
  step: 1,
  vertical: false,
} as const
