import { getSizeStyles } from '../../utils/sizeUtils'

const ICON_SIZE_PRESETS = ['sm', 'md', 'lg', 'xl'] as const

export type IconSize = (typeof ICON_SIZE_PRESETS)[number] | number
export type IconButtonVariant = 'default' | 'filled'

const iconSizeConfig = {
  classes: {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
    xl: 'size-7',
  },
  getInlineStyle: (size: number) => ({
    width: size,
    height: size,
  }),
}

const iconButtonSizeConfigs = {
  default: {
    classes: {
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
      xl: 'size-10',
    },
    iconSizes: {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28,
    },
  },
  filled: {
    classes: {
      sm: 'size-6 p-0.5',
      md: 'size-8 p-0.5',
      lg: 'size-10 p-0.5',
      xl: 'size-12 p-0.5',
    },
    iconSizes: {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28,
    },
  },
} satisfies Record<IconButtonVariant, {
  classes: Record<Exclude<IconSize, number>, string>
  iconSizes: Record<Exclude<IconSize, number>, number>
}>

/** 将 icon 的语义尺寸格式化为 Tailwind 类名或数值尺寸样式。 */
export function getIconSizeStyles(size: IconSize) {
  return getSizeStyles(size, iconSizeConfig)
}

/** 将 icon button 的语义尺寸格式化为容器样式和默认图标尺寸。 */
export function getIconButtonSizeStyles(size: IconSize, variant: IconButtonVariant) {
  const config = iconButtonSizeConfigs[variant]
  const styles = getSizeStyles(size, {
    classes: config.classes,
    getInlineStyle: (value) => ({
      width: value,
      height: value,
      minWidth: value,
      minHeight: value,
    }),
  })

  return {
    ...styles,
    iconSize: typeof size === 'number'
      ? size * 0.75
      : config.iconSizes[size],
  }
}
