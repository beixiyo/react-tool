import type { SliderStyleConfig } from './types'

/**
 * 默认样式配置
 */
export const DEFAULT_STYLE_CONFIG: SliderStyleConfig = {
  handle: {
    size: 'w-4 h-4',
    color: 'bg-white border-blue-500 dark:bg-gray-800 dark:border-blue-400',
    border: 'border-2',
    rounded: 'rounded-full',
    hover: 'hover:scale-110',
    focus: 'focus:scale-110 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:focus:ring-blue-400',
  },
  track: {
    background: 'bg-gray-200 dark:bg-gray-700',
    size: 'h-1', // 默认水平方向，垂直方向会在组件中动态设置
    rounded: 'rounded-full',
  },
  fill: {
    color: 'bg-blue-500 dark:bg-blue-400',
    rounded: 'rounded-full',
  },
  marks: {
    dotColor: 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600',
    activeDotColor: 'bg-blue-500 border-blue-500 dark:bg-blue-400 dark:border-blue-400',
    labelColor: 'text-gray-600 dark:text-gray-300',
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
