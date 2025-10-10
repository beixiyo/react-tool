import type { DrawerPosition } from './types'

export function getDrawerClasses(
  position: DrawerPosition = 'right',
  baseClasses: string = '',
) {
  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    left: 'top-0 left-0 bottom-0',
    right: 'top-0 right-0 bottom-0',
  }

  return `${baseClasses} ${positionClasses[position]}`
}
