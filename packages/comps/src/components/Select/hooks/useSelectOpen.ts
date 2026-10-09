import { useLatestCallback } from 'hooks'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

export function useSelectOpen(
  containerRef: RefObject<HTMLDivElement | null>,
  /** 下拉面板渲染在 Portal 里，不在 containerRef 内，点击面板也要视为内部点击 */
  panelRef: RefObject<HTMLElement | null>,
  options: {
    onClickOutside?: () => void
    handleBlur: () => void
  },
) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClickOutside = useLatestCallback((event: MouseEvent) => {
    const target = event.target as Node
    if (containerRef.current && !containerRef.current.contains(target) && !panelRef.current?.contains(target)) {
      setIsOpen(false)
      options.onClickOutside?.()
      options.handleBlur()
    }
  })

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return { isOpen, setIsOpen }
}
