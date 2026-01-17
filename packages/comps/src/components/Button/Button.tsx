'use client'

import type { ButtonProps } from './types'
import { useSaveRef } from 'hooks'
import React, { Children, forwardRef, memo, useState } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'
import { Slot } from '../Slot'
import { Tooltip } from '../Tooltip'
import { useButtonGroup } from './ButtonGroupContext'
import { BUTTON_ATTR } from './constans'
import { getDefaultStyles, getIconButtonStyles, getNeumorphicStyles } from './styles'

const defaultProps: ButtonProps = {
  iconOnly: false,
  loading: false,
  disabled: false,
  designStyle: 'default',
  variant: 'default',
  size: 'md',
  rounded: 'full',
  block: false,
}

const InnerButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const newProps = {
    ...defaultProps,
    ...props,
  } as ButtonProps

  const {
    children,
    variant,
    size,
    rounded,
    block,
    leftIcon,
    loadingText,
    rightIcon,
    className,
    iconClassName,
    disabled,
    loading,
    hoverClassName,
    activeClassName,
    disabledClassName,
    loadingClassName,
    asChild,
    onClick,
    iconOnly,
    designStyle,
    as: Component = 'button',
    tooltip,
    name,
    ...rest
  } = newProps

  /** 从 ButtonGroup Context 获取状态 */
  const buttonGroupContext = useButtonGroup()
  const isInButtonGroup = !!buttonGroupContext
  const isGroupActive = isInButtonGroup && name && buttonGroupContext.active === name

  const [isActive, setIsActive] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const noChild = Children.toArray(children).length <= 0 || iconOnly

  /** 获取设计风格对应的样式 */
  const getStylesByDesign = () => {
    switch (designStyle) {
      case 'neumorphic':
        return getNeumorphicStyles(newProps)
      case 'default':
      default:
        return getDefaultStyles(newProps)
    }
  }

  /** 获取尺寸相关的样式 */
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      return {
        className: undefined,
        style: {
          height: `${size}px`,
          minHeight: `${size}px`,
          paddingLeft: `${size * 0.4}px`,
          paddingRight: `${size * 0.4}px`,
          fontSize: `${size * 0.4}px`,
        },
      }
    }
    return {
      className: undefined,
      style: undefined,
    }
  }

  const sizeStyles = getSizeStyles()

  /** 图标按钮的尺寸样式 */
  const iconButtonSize = noChild
    ? (typeof size === 'number' ? undefined : getIconButtonStyles(size!))
    : ''

  /** 在 ButtonGroup 中的样式 */
  const groupStyles = isInButtonGroup
    ? cn(
        'relative z-10 flex items-center justify-center px-3 py-1.5',
        isGroupActive
          ? 'text-buttonTertiary'
          : 'text-textPrimary',
      )
    : ''

  /** 最终的按钮样式 */
  const buttonStyles = cn(
    /** 如果在 ButtonGroup 中，使用组样式，否则使用默认样式 */
    isInButtonGroup
      ? groupStyles
      : getStylesByDesign(),
    /** 使用 w-full 保持宽度充满，但不覆盖默认的 inline-flex，从而保持垂直居中 */
    !isInButtonGroup && block && 'w-full',
    !isInButtonGroup && noChild && [iconButtonSize, 'p-0'],
    !isInButtonGroup && disabled && disabledClassName,
    !isInButtonGroup && loading && loadingClassName,
    !isInButtonGroup && isActive && activeClassName,
    !isInButtonGroup && isHover && hoverClassName,
    sizeStyles.className,
    className,
  )

  /** 处理点击事件 */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      e.preventDefault()
      return
    }

    /** 如果在 ButtonGroup 中且有 name，调用 Context 的 onChange */
    if (isInButtonGroup && name && buttonGroupContext.onChange) {
      buttonGroupContext.onChange(name)
    }

    onClick?.(e)
  }

  /** 处理鼠标按下事件 */
  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsActive(true)
    }
  }

  /** 处理鼠标抬起事件 */
  const handleMouseUp = () => {
    setIsActive(false)
  }

  /** 处理鼠标进入事件 */
  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      setIsHover(true)
    }
  }

  /** 处理鼠标离开事件 */
  const handleMouseLeave = () => {
    setIsHover(false)
    setIsActive(false)
  }

  /** 获取按钮内容 */
  const getButtonContent = () => {
    // 基础颜色判断：primary 以外的语义色通常文字是白色的
    const isSemanticVariant = ['success', 'warning', 'danger', 'info'].includes(variant!)
    const color = (variant === 'primary' || isSemanticVariant)
      ? 'white'
      : undefined

    if (loading) {
      // 计算 LoadingIcon 的 size
      const loadingIconSize = typeof size === 'number'
        ? size * 0.6 // 图标大小约为按钮高度的 60%
        : size === 'lg'
          ? 'md'
          : 'sm'

      return (
        <div className="flex items-center justify-center gap-2">
          <LoadingIcon
            size={ loadingIconSize }
            color={ variant === 'primary' ? 'currentColor' : color }
          />
          {!iconOnly && loadingText
            ? loadingText
            : children}
        </div>
      )
    }

    if (noChild && (leftIcon || rightIcon)) {
      return leftIcon || rightIcon
    }

    return (
      <>
        {leftIcon && (
          <span className={ cn('mr-2', (noChild) && 'mr-0', iconClassName) }>
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className={ cn('ml-2', (noChild) && 'ml-0', iconClassName) }>
            {rightIcon}
          </span>
        )}
      </>
    )
  }

  const finalProps = {
    ref: undefined as any,
    className: buttonStyles,
    style: {
      ...sizeStyles.style,
      transition: 'all 0.3s',
      ...rest.style,
    },
    disabled: disabled || loading,
    onClick: handleClick,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    /** 在 ButtonGroup 中添加 data 属性以便定位 */
    ...(isInButtonGroup && name
      ? { [BUTTON_ATTR.name]: name }
      : {}),
    ...rest,
  }

  const { setRef } = useSaveRef({
    ref,
    onMounted: (node) => {
      if (isInButtonGroup && name) {
        buttonGroupContext.register?.(name, node)
      }
    },
    onUnmounted: () => {
      if (isInButtonGroup && name) {
        buttonGroupContext.unregister?.(name)
      }
    },
  })
  finalProps.ref = setRef

  /** 触发元素，根据 asChild 决定是 Slot 还是普通按钮 */
  const triggerElement = asChild
    ? (
        <Slot
          { ...finalProps }
        >
          {children}
        </Slot>
      )
    : (
        <Component
          { ...finalProps }
        >
          {getButtonContent()}
        </Component>
      )

  /** 如果传入 tooltip，则使用 Tooltip 包裹触发元素 */
  if (tooltip) {
    const tooltipProps = (typeof tooltip === 'object' && tooltip !== null && !React.isValidElement(tooltip))
      ? tooltip as any
      : { content: tooltip }

    return (
      <Tooltip { ...tooltipProps }>
        {triggerElement}
      </Tooltip>
    )
  }

  return triggerElement
})

InnerButton.displayName = 'Button'

/**
 * ## 新拟态风格按钮建议
 * - 浅色模式背景色建议：#e8e8e8
 * - 深色模式背景色建议：#262626 neutral-800
 */
export const Button = memo(InnerButton)
