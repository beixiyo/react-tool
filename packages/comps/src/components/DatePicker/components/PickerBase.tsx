'use client'

import type { FloatingPlacement } from 'hooks'
import { useShortCutKey } from 'hooks'
import { memo, useRef } from 'react'
import { cn } from 'utils'
import { Z } from '../../../constants/z-index'
import { AnimateShow } from '../../Animate'
import { SafePortal } from '../../SafePortal'
import { CONTAINER_CLASSNAME } from '../constants'
import { useClickOutside } from '../hooks/useClickOutside'
import { usePickerFloating } from '../hooks/usePickerFloating'

interface PickerBaseProps {
  isOpen: boolean
  setOpen: (open: boolean) => void
  trigger: React.ReactNode
  dropdown: React.ReactNode
  placement?: FloatingPlacement
  offset?: number
  onClickOutside?: () => void
  onBlur?: () => void
  className?: string
  dropdownClassName?: string
  error?: boolean
  errorMessage?: string
}

export const PickerBase = memo<PickerBaseProps>(({
  isOpen,
  setOpen,
  trigger,
  dropdown,
  placement = 'bottom-start',
  offset = 4,
  onClickOutside,
  onBlur,
  className,
  dropdownClassName,
  error,
  errorMessage,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { style } = usePickerFloating({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    placement,
    offset,
  })

  useClickOutside({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    onClickOutside,
    onClose: () => {
      setOpen(false)
      onBlur?.()
    },
  })

  useShortCutKey({
    key: 'Escape',
    /** 仅在浮层打开时监听，关闭时不挂全局监听，避免随实例数累积 */
    enabled: isOpen,
    /** 关闭浮层不应吞掉 Escape 默认行为，以免影响页面其它 Escape 处理 */
    preventDefault: false,
    fn: () => {
      setOpen(false)
      onBlur?.()
    },
  })

  const dropdownContent = isOpen && (
    <AnimateShow
      ref={ dropdownRef }
      variants="fade"
      style={ {
        ...style,
        zIndex: Z.dropdown,
      } }
      className={ cn(CONTAINER_CLASSNAME, dropdownClassName) }
    >
      { dropdown }
    </AnimateShow>
  )

  return (
    <div className={ cn('inline-block w-full', className) }>
      <div ref={ triggerRef } className="w-full">
        { trigger }
      </div>

      <SafePortal>{ dropdownContent }</SafePortal>

      { error && errorMessage && (
        <div className="mt-1 text-xs text-danger">
          { errorMessage }
        </div>
      ) }
    </div>
  )
})

PickerBase.displayName = 'PickerBase'
