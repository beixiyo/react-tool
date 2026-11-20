'use client'

import type { FloatingPlacement } from 'hooks'
import { useClickOutside, useKeyboardLayer, useResizeObserver, useTheme } from 'hooks'
import { memo, useLayoutEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Z } from '../../../constants/z-index'
import { useNestedLayerPriority } from '../../../hooks/useKeyboardLayerHost'
import { useAriaT } from '../../../i18n'
import { AnimateShow } from '../../Animate'
import { DropdownPanelFrame } from '../../Animate/subcomponents/DropdownPanelFrame'
import type { FloatingArrowConfig } from '../../FloatingArrow'
import { FloatingArrow } from '../../FloatingArrow'
import { SafePortal } from '../../SafePortal'
import { CONTAINER_CLASSNAME } from '../constants'
import { usePickerFloating } from '../hooks/usePickerFloating'
import { usePickerFocusHandoff } from '../hooks/usePickerFocusHandoff'

interface PickerBaseProps {
  isOpen: boolean
  disabled?: boolean
  setOpen: (open: boolean) => void
  trigger: React.ReactNode
  onTriggerClick?: () => void
  dropdown: React.ReactNode
  placement?: FloatingPlacement
  offset?: number
  onClickOutside?: () => void
  onDismiss?: (reason: PickerDismissReason) => void
  onBlur?: () => void
  className?: string
  dropdownClassName?: string
  arrow?: FloatingArrowConfig
  dropdownZIndex?: number
  error?: boolean
  errorMessage?: React.ReactNode
  fullWidth?: boolean
  /**
   * 弹层 dialog 的无障碍名称
   * @default 通用 aria 文案「选择日期」（不要求 I18nProvider）
   */
  dialogLabel?: string
}

export const PickerBase = memo<PickerBaseProps>(({
  isOpen,
  disabled = false,
  setOpen,
  trigger,
  onTriggerClick,
  dropdown,
  placement = 'bottom-start',
  offset = 8,
  onClickOutside,
  onDismiss,
  onBlur,
  className,
  dropdownClassName,
  arrow = true,
  dropdownZIndex,
  error,
  errorMessage,
  fullWidth = true,
  dialogLabel,
}) => {
  const [theme] = useTheme()
  const ariaT = useAriaT()
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [panelHeight, setPanelHeight] = useState(0)
  const [revealComplete, setRevealComplete] = useState(false)
  const revealHeight = placement.startsWith('top') || placement.startsWith('bottom')

  // 定位和限高只读内层的完整尺寸，避免逐帧测量正在变化的外壳
  useLayoutEffect(() => {
    if (!isOpen) setRevealComplete(false)
    if (revealHeight && isOpen && dropdownRef.current) setPanelHeight(dropdownRef.current.offsetHeight)
  }, [revealHeight, isOpen])

  useResizeObserver([dropdownRef], ({ target }) => {
    if (revealHeight && isOpen) setPanelHeight((target as HTMLElement).offsetHeight)
  })

  const {
    style,
    placement: actualPlacement,
    shouldAnimate,
    arrowProps,
  } = usePickerFloating({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    placement,
    offset,
    arrow,
    bordered: theme !== 'light',
  })

  const { triggerHandlers, cancelReturnFocus } = usePickerFocusHandoff({
    isOpen,
    ready: shouldAnimate,
    triggerRef,
    dropdownRef,
  })

  /**
   * 面板经 Portal 渲染，需同时跟踪 trigger 与面板；
   * 带 ignore 属性的嵌套 Portal（如年月下拉）不视为外部点击
   */
  useClickOutside(
    [triggerRef, dropdownRef],
    () => {
      cancelReturnFocus()
      if (onDismiss) onDismiss('outside')
      else setOpen(false)
      onBlur?.()
      onClickOutside?.()
    },
    {
      enabled: isOpen,
      additionalSelectors: [`[${DATA_ATTR.datePicker.ignore}]`],
      /** 面板尚未挂载（或 trigger 已卸载）时不判定外部点击，与原实现保持一致 */
      ignore: () => !triggerRef.current || !dropdownRef.current,
    },
  )

  /** 嵌在弹窗 / 气泡里时至少压过宿主，否则 Esc 关掉的是宿主而不是这个面板 */
  const layerPriority = useNestedLayerPriority(dropdownZIndex ?? Z.dropdown)

  useKeyboardLayer({
    active: isOpen && shouldAnimate && !disabled,
    keys: ['Escape'],
    priority: layerPriority,
    allowRepeat: false,
    onKeyDown: () => {
      if (onDismiss) onDismiss('escape')
      else setOpen(false)
      onBlur?.()
    },
  })

  const dropdownContent = revealHeight
    ? (
      <DropdownPanelFrame
        open={ isOpen && shouldAnimate }
        above={ actualPlacement.startsWith('top') }
        height={ panelHeight }
        style={ {
          ...style,
          zIndex: dropdownZIndex ?? Z.dropdown,
          overflow: 'visible',
        } }
        motionOptions={ {
          variants: {
            open: { height: panelHeight, opacity: 1 },
            closed: { height: 0, opacity: 0 },
          },
          onAnimationComplete: (phase) => {
            if (phase === 'open') setRevealComplete(true)
          },
        } }
        className={ cn('rounded-[20px] bg-background shadow-card', theme !== 'light' && 'ring-1 ring-inset ring-border') }
      >
        { /* 箭头贴住浮层锚边，与外壳一起淡入淡出，不参与内容的高度裁切 */ }
        { arrowProps && <FloatingArrow { ...arrowProps } /> }
        <div
          className={ cn('flex min-h-0 flex-1 flex-col', !(isOpen && revealComplete) && 'overflow-clip') }
          style={ { justifyContent: 'inherit' } }
        >
          <div
            ref={ dropdownRef }
            role="dialog"
            aria-label={ dialogLabel ?? ariaT('selectDate') }
            className={ cn('relative shrink-0 rounded-[20px] p-6', theme !== 'light' && 'border border-transparent', dropdownClassName) }
          >
            { dropdown }
          </div>
        </div>
      </DropdownPanelFrame>
    )
    : (
      <AnimateShow
        show={ isOpen && shouldAnimate }
        ref={ dropdownRef }
        role="dialog"
        aria-label={ dialogLabel ?? ariaT('selectDate') }
        variants="fade"
        animateOnMount={ false }
        style={ {
          ...style,
          zIndex: dropdownZIndex ?? Z.dropdown,
        } }
        className={ cn(
          CONTAINER_CLASSNAME,
          'relative',
          theme !== 'light' && 'border border-border',
          arrowProps && 'overflow-visible',
          dropdownClassName,
        ) }
      >
        { arrowProps && <FloatingArrow { ...arrowProps } /> }
        { dropdown }
      </AnimateShow>
    )

  return (
    <div className={ cn('inline-block', fullWidth && 'w-full', className) }>
      <div
        ref={ triggerRef }
        className={ cn(fullWidth && 'w-full') }
        onClick={ onTriggerClick }
        { ...triggerHandlers }
      >
        { trigger }
      </div>

      <SafePortal>{ dropdownContent }</SafePortal>

      { error && errorMessage && (
        <div className="text-danger mt-1 text-xs">
          { errorMessage }
        </div>
      ) }
    </div>
  )
})

PickerBase.displayName = 'PickerBase'

export type PickerDismissReason = 'outside' | 'escape'
