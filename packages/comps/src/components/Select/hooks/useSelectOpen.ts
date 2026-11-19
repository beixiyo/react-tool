import { useClickOutside, useControllableState } from 'hooks'
import type { RefObject } from 'react'

/**
 * Select 开关状态（受控 / 非受控）与点击外部关闭
 */
export function useSelectOpen(
  containerRef: RefObject<HTMLDivElement | null>,
  /** 下拉面板渲染在 Portal 里，不在 containerRef 内，点击面板也要视为内部点击 */
  panelRef: RefObject<HTMLElement | null>,
  options: UseSelectOpenOptions,
) {
  const [isOpen, setIsOpen] = useControllableState({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  })

  useClickOutside(
    [containerRef, panelRef],
    () => {
      setIsOpen(false)
      options.onClickOutside?.()
      options.handleBlur()
    },
    { enabled: isOpen },
  )

  return { isOpen, setIsOpen }
}

type UseSelectOpenOptions = {
  /** 受控打开状态 */
  open?: boolean
  /** 非受控初始打开状态 */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onClickOutside?: () => void
  handleBlur: () => void
}
