import type { RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'

export function useSelectOpen(
  containerRef: RefObject<HTMLDivElement | null>,
  options: {
    onClickOutside?: () => void
    handleBlur: () => void
  },
) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false)
      options.onClickOutside?.()
      options.handleBlur()
    }
  }, [containerRef, options.onClickOutside, options.handleBlur])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  return { isOpen, setIsOpen }
}
