'use client'

import type { CheckmarkProps } from '../Checkbox/types'
import type { CopyProps } from './types'
import { copyToClipboard } from '@jl-org/tool'
import { Copy as CopyIcon } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'
import { Button } from '../Button'
import { Checkmark } from '../Checkbox'

/**
 * Copy 组件
 *
 * 点击后复制内容到剪贴板，显示 Checkmark 动画，然后切换回 Button
 *
 * @example
 * <Copy text="要复制的内容" />
 * <Copy
 *   text="要复制的内容"
 *   showText
 *   buttonText="复制链接"
 *   onCopy={(text) => console.log('已复制:', text)}
 * />
 */
export const Copy = memo<CopyProps>((props) => {
  const {
    text,
    onCopy,
    onCopyError,
    resetDelay = 1500,
    animationDuration = 1,
    showText = false,
    buttonText = '',
    buttonProps = {},
    copyIcon,
    checkIcon,
  } = props

  const [showCheckmark, setShowCheckmark] = useState(false)

  /** 根据按钮 size 计算图标和 Checkmark 的大小 */
  const iconSize = useMemo<number>(() => {
    const buttonSize = buttonProps.size || 'md'
    if (typeof buttonSize === 'number') {
      /** 数字 size：图标大小约为按钮高度的 40% */
      return Math.round(buttonSize * 0.4)
    }
    /** 字符串 size：使用固定值 */
    const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
      sm: 14,
      md: 16,
      lg: 18,
    }
    return sizeMap[buttonSize]
  }, [buttonProps.size])

  /** 处理复制操作 */
  const handleCopy = async () => {
    try {
      await copyToClipboard(text)
      setShowCheckmark(true)
      onCopy?.(text)
    }
    catch (error) {
      onCopyError?.(error as Error)
    }
  }

  /** 动画完成后切换回 Button */
  useEffect(() => {
    if (showCheckmark) {
      const timer = setTimeout(() => {
        setShowCheckmark(false)
      }, resetDelay)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [showCheckmark, resetDelay])

  const checkmarkProps: CheckmarkProps = {
    color: 'rgb(var(--buttonPrimary) / 1)',
    strokeWidth: 2,
    ...props.checkmarkProps,
  }

  const LeftIcon = showCheckmark
    ? (checkIcon ?? (
        <Checkmark
          show={ true }
          animationDuration={ animationDuration }
          size={ iconSize }
          { ...checkmarkProps }
        />
      ))
    : (copyIcon ?? (
        <CopyIcon
          size={ iconSize }
          { ...checkmarkProps }
        />
      ))

  /** 否则渲染 Button 组件 */
  return (
    <Button
      onClick={ handleCopy }
      leftIcon={ LeftIcon }
      iconOnly={ !showText }
      { ...buttonProps }
    >
      { showText && buttonText }
    </Button>
  )
})

Copy.displayName = 'Copy'
