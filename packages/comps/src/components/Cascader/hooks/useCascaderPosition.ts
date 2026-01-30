import type { RefObject } from 'react'
import type { CascaderProps } from '../types'
import { useFloatingPosition } from 'hooks'
import { useEffect, useState } from 'react'

export function useCascaderPosition(
  triggerRef: RefObject<HTMLDivElement | null>,
  dropdownRef: RefObject<HTMLDivElement | null>,
  isOpen: boolean,
  options: Pick<CascaderProps, 'placement' | 'offset'>,
) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  const {
    style,
    update: updatePosition,
  } = useFloatingPosition(triggerRef, dropdownRef, {
    enabled: isOpen,
    placement: options.placement ?? 'bottom-start',
    offset: options.offset ?? 4,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setShouldAnimate(false)
      requestAnimationFrame(() => {
        updatePosition()
        setShouldAnimate(true)
      })
    }
    else {
      setShouldAnimate(false)
    }
  }, [isOpen, updatePosition])

  return { style, shouldAnimate }
}
