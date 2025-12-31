'use client'

import { copyToClipboard } from '@jl-org/tool'
import { Copy as CopyIcon } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { Button } from '../Button'
import { Checkmark } from '../Checkbox'
import type { CopyProps } from './types'

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
    checkmarkProps = {},
  } = props

  const [showCheckmark, setShowCheckmark] = useState(false)

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

  const LeftIcon = showCheckmark
    ? <Checkmark
      show={true}
      animationDuration={animationDuration}
      size={16}
      {...checkmarkProps}
    />
    : <CopyIcon size={16} />

  /** 否则渲染 Button 组件 */
  return (
    <Button
      onClick={handleCopy}
      leftIcon={LeftIcon}
      iconOnly={!showText}
      {...buttonProps}
    >
      {showText && buttonText}
    </Button>
  )
})

Copy.displayName = 'Copy'

