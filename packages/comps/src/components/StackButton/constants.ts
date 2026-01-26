import type { Size } from '../../types'

export const defaultConfig = {
  overlapMargin: -10,
  activeGap: 6,
  borderRadius: 12,
  iconSize: 'size-4',
  activeBackground: 'rgb(var(--buttonPrimary))',
  inactiveBackground: 'rgb(var(--buttonSecondary))',
  activeBorderColor: 'transparent',
  inactiveBorderColor: 'transparent',
  activeIconColor: 'rgb(var(--background))',
  inactiveIconColor: 'rgb(var(--textSecondary) / 0.7)',
  activeShadow: '0 2px 8px rgb(0 0 0 / 0.12)',
  inactiveShadow: '0 0.5px 2px rgb(0 0 0 / 0.04)',
  springStiffness: 280,
  springDamping: 26,
  springMass: 0.9,
  colorTransitionDuration: 0.35,
}

export const sizeConfigs: Record<Exclude<Size, number>, { size: number } & Partial<typeof defaultConfig>> = {
  sm: {
    size: 32,
    overlapMargin: -8,
    activeGap: 3,
    borderRadius: 8,
    iconSize: 'size-3.5',
  },
  md: {
    size: 40,
    overlapMargin: -10,
    activeGap: 4,
    borderRadius: 12,
    iconSize: 'size-4',
  },
  lg: {
    size: 48,
    overlapMargin: -12,
    activeGap: 5,
    borderRadius: 14,
    iconSize: 'size-5',
  },
}

export const ACTIVE_Z_INDEX = 49
